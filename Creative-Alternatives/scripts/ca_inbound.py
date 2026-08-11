"""Creative Alternatives inbound launch control and implementation generator.

This tool turns ``config/ca_inbound.yaml`` into reviewable implementation files and
fails closed when a niche is missing approvals, access, attribution, routing, or QA.
It never publishes a page, enables a campaign, spends money, or contacts a lead.

Usage:
    .venv/bin/python scripts/ca_inbound.py validate
    .venv/bin/python scripts/ca_inbound.py audit
    .venv/bin/python scripts/ca_inbound.py audit --niche camp --channel paid
    .venv/bin/python scripts/ca_inbound.py render
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from dataclasses import asdict, dataclass
from datetime import datetime
from pathlib import Path
from typing import Any
from urllib.parse import urlencode

import yaml


ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CONFIG = ROOT / "config" / "ca_inbound.yaml"
DEFAULT_HUBSPOT = ROOT / "config" / "ca_hubspot_properties.yaml"
DEFAULT_PARTNERS = ROOT / "config" / "ca_inbound_partners.yaml"
DEFAULT_NURTURE = ROOT / "config" / "ca_inbound_nurture.yaml"
DEFAULT_ASSETS = ROOT / "config" / "ca_inbound_assets.yaml"
DEFAULT_MEASUREMENT = ROOT / "config" / "ca_inbound_measurement.yaml"
DEFAULT_SCHEMA = ROOT / "pillars" / "3-online-presence" / "inbound" / "lead-intake-schema.json"
DEFAULT_OUTPUT = ROOT / "outputs" / "inbound" / "implementation"

CHANNELS = ("site", "organic", "paid", "local")
DEDICATED_STATUSES = {"build", "validate"}
VALID_STATUSES = DEDICATED_STATUSES | {"shared_only"}
VALID_RESOURCE_STATUSES = {"draft", "review", "live"}
ADS_HEADLINE_LIMIT = 30
ADS_DESCRIPTION_LIMIT = 90
SEO_TITLE_LIMIT = 65
SEO_DESCRIPTION_LIMIT = 160
HUBSPOT_OBJECTS = {"contacts", "companies", "deals"}
HUBSPOT_TYPES = {"string", "number", "date", "datetime", "enumeration", "bool"}
HUBSPOT_FIELD_TYPES = {
    "text",
    "textarea",
    "number",
    "date",
    "select",
    "checkbox",
    "booleancheckbox",
    "file",
    "phonenumber",
}
NATIVE_CONTACT_PROPERTIES = {"firstname", "lastname", "email", "company", "website", "phone"}
PARTNER_STATUSES = {"research", "draft_ready", "approved", "contacted", "active", "paused", "rejected"}
PARTNER_SOURCE_STATUSES = {"verified", "verified_channel", "contact_only", "internal"}
NURTURE_TIMING_MODES = {"fixed_dates", "relative_days"}
REQUIRED_NURTURE_SUPPRESSIONS = {
    "marketing_consent_missing",
    "email_unsubscribed_or_ineligible",
    "active_sales_conversation",
    "open_deal",
    "nonbuyer_or_no_fit",
    "hard_bounce",
    "manual_pause",
}
ASSET_SLOT_STATUSES = {"candidate", "brief_ready", "approved"}
ASSET_PAGE_STATUSES = {"draft", "review", "approved"}
ASSET_PERMISSION_STATUSES = {"confirm_reuse", "requested", "approved", "rejected", "expired"}
REQUIRED_COMMERCIAL_ASSET_SLOTS = {"hero", "product_or_process", "proof", "social_share"}
REQUIRED_RESOURCE_ASSET_SLOTS = {"hero", "inline_tool", "social_share"}
MEASUREMENT_EVENT_STATUSES = {"draft", "review", "active", "paused"}
MEASUREMENT_CONVERSION_LEVELS = {
    "diagnostic",
    "diagnostic_only",
    "secondary",
    "primary",
    "value_stage",
    "customer",
    "revenue",
}
STANDARD_ANALYTICS_PARAMETERS = {"value", "currency", "transaction_id"}


@dataclass(frozen=True)
class GateResult:
    name: str
    source: str
    complete: bool
    owner: str
    evidence: str


def load_config(path: Path = DEFAULT_CONFIG) -> dict[str, Any]:
    with path.open() as handle:
        config = yaml.safe_load(handle)
    if not isinstance(config, dict):
        raise ValueError(f"{path} must contain a YAML object")
    return config


def _repo_path(value: str) -> Path:
    return ROOT / value


def _page_setting(text: str, label: str) -> str:
    match = re.search(rf"^- {re.escape(label)}: `([^`]+)`$", text, flags=re.MULTILINE)
    return match.group(1) if match else ""


def _validate_gate(name: str, gate: dict[str, Any], errors: list[str]) -> None:
    if not isinstance(gate, dict):
        errors.append(f"gate {name!r} must be an object")
        return
    required_for = gate.get("required_for", [])
    unknown = sorted(set(required_for) - set(CHANNELS))
    if unknown:
        errors.append(f"gate {name!r} has unknown channels: {', '.join(unknown)}")
    if not gate.get("owner"):
        errors.append(f"gate {name!r} needs an owner")
    if gate.get("complete") is True and not str(gate.get("evidence", "")).strip():
        errors.append(f"gate {name!r} is complete but has no evidence")


def validate_config(config: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if config.get("schema_version") != "1.0.0":
        errors.append("schema_version must be 1.0.0")

    guardrails = config.get("guardrails") or {}
    if guardrails.get("public_actions_require_approval") is not True:
        errors.append("public_actions_require_approval must remain true")
    if guardrails.get("create_deal_before_human_qualification") is not False:
        errors.append("create_deal_before_human_qualification must remain false")
    if guardrails.get("send_quote_automatically") is not False:
        errors.append("send_quote_automatically must remain false")
    if guardrails.get("accept_order_automatically") is not False:
        errors.append("accept_order_automatically must remain false")

    for name, gate in (config.get("shared_gates") or {}).items():
        _validate_gate(f"shared.{name}", gate, errors)

    niches = config.get("niches") or {}
    if not niches:
        errors.append("at least one niche is required")
        return errors

    priorities: dict[int, str] = {}
    paths: dict[str, str] = {}
    for key, niche in niches.items():
        status = niche.get("status")
        if status not in VALID_STATUSES:
            errors.append(f"niche {key!r} has invalid status {status!r}")
        priority = niche.get("priority")
        if not isinstance(priority, int) or priority < 1:
            errors.append(f"niche {key!r} needs a positive integer priority")
        elif priority in priorities:
            errors.append(f"niches {priorities[priority]!r} and {key!r} share priority {priority}")
        else:
            priorities[priority] = key
        if not niche.get("owner"):
            errors.append(f"niche {key!r} needs an owner")

        page_path = str(niche.get("page_path", "")).strip()
        if status in DEDICATED_STATUSES and not page_path:
            errors.append(f"niche {key!r} needs a page_path")
        if page_path:
            if not page_path.startswith("/"):
                errors.append(f"niche {key!r} page_path must start with /")
            if page_path in paths:
                errors.append(f"niches {paths[page_path]!r} and {key!r} share {page_path}")
            paths[page_path] = key
            title = str(niche.get("title", ""))
            description = str(niche.get("meta_description", ""))
            if not title or len(title) > SEO_TITLE_LIMIT:
                errors.append(
                    f"niche {key!r} title must be 1-{SEO_TITLE_LIMIT} characters"
                )
            if not description or len(description) > SEO_DESCRIPTION_LIMIT:
                errors.append(
                    f"niche {key!r} meta_description must be 1-{SEO_DESCRIPTION_LIMIT} characters"
                )

        page_copy = str(niche.get("page_copy", "")).strip()
        if status == "build" and not page_copy:
            errors.append(f"build niche {key!r} needs page_copy")
        if page_copy and not _repo_path(page_copy).is_file():
            errors.append(f"niche {key!r} page_copy does not exist: {page_copy}")
        elif page_copy:
            copy_text = _repo_path(page_copy).read_text()
            expected = {
                "URL": page_path,
                "SEO title": str(niche.get("title", "")),
                "Meta description": str(niche.get("meta_description", "")),
            }
            for label, value in expected.items():
                actual = _page_setting(copy_text, label)
                if actual != value:
                    errors.append(
                        f"niche {key!r} page_copy {label} mismatch: {actual!r} != {value!r}"
                    )

        for name, gate in (niche.get("gates") or {}).items():
            _validate_gate(f"{key}.{name}", gate, errors)

        ads = niche.get("ads")
        if ads:
            if not ads.get("campaign") or not ads.get("landing_page"):
                errors.append(f"niche {key!r} ads need campaign and landing_page")
            ad_groups = ads.get("ad_groups") or {}
            if not ad_groups:
                errors.append(f"niche {key!r} ads need at least one ad group")
            for group_name, group in ad_groups.items():
                keywords = group.get("keywords") or []
                if not keywords:
                    errors.append(f"niche {key!r} ad group {group_name!r} needs keywords")
                if len(keywords) != len(set(k.lower() for k in keywords)):
                    errors.append(f"niche {key!r} ad group {group_name!r} has duplicate keywords")
            headlines = ads.get("headlines") or []
            descriptions = ads.get("descriptions") or []
            if not 3 <= len(headlines) <= 15:
                errors.append(f"niche {key!r} needs 3-15 ad headlines")
            if not 2 <= len(descriptions) <= 4:
                errors.append(f"niche {key!r} needs 2-4 ad descriptions")
            for value in headlines:
                if len(value) > ADS_HEADLINE_LIMIT:
                    errors.append(
                        f"niche {key!r} headline exceeds {ADS_HEADLINE_LIMIT} characters: {value!r}"
                    )
            for value in descriptions:
                if len(value) > ADS_DESCRIPTION_LIMIT:
                    errors.append(
                        f"niche {key!r} description exceeds {ADS_DESCRIPTION_LIMIT} characters: {value!r}"
                    )

    resources = config.get("resources") or {}
    resource_paths: dict[str, str] = {}
    for key, resource in resources.items():
        niche_key = resource.get("niche")
        if niche_key not in niches:
            errors.append(f"resource {key!r} has unknown niche {niche_key!r}")
            continue
        if resource.get("status") not in VALID_RESOURCE_STATUSES:
            errors.append(f"resource {key!r} has invalid status {resource.get('status')!r}")
        if not resource.get("owner"):
            errors.append(f"resource {key!r} needs an owner")
        path = str(resource.get("path", "")).strip()
        if not path.startswith("/resources/"):
            errors.append(f"resource {key!r} path must start with /resources/")
        if path in paths or path in resource_paths:
            errors.append(f"resource {key!r} has duplicate path {path!r}")
        resource_paths[path] = key
        title = str(resource.get("title", ""))
        description = str(resource.get("meta_description", ""))
        headline = str(resource.get("headline", ""))
        if not title or len(title) > SEO_TITLE_LIMIT:
            errors.append(f"resource {key!r} title must be 1-{SEO_TITLE_LIMIT} characters")
        if not description or len(description) > SEO_DESCRIPTION_LIMIT:
            errors.append(
                f"resource {key!r} meta_description must be 1-{SEO_DESCRIPTION_LIMIT} characters"
            )
        if not headline or len(headline) > 110:
            errors.append(f"resource {key!r} headline must be 1-110 characters")
        parent = str(resource.get("parent_path", ""))
        expected_parent = str(niches[niche_key].get("page_path", ""))
        if parent != expected_parent:
            errors.append(
                f"resource {key!r} parent_path must match its niche page: {parent!r} != {expected_parent!r}"
            )
        page_copy = str(resource.get("page_copy", ""))
        if not page_copy or not _repo_path(page_copy).is_file():
            errors.append(f"resource {key!r} page_copy does not exist: {page_copy}")
        else:
            copy_text = _repo_path(page_copy).read_text()
            expected = {
                "URL": path,
                "SEO title": title,
                "Meta description": description,
                "Parent page": parent,
            }
            for label, value in expected.items():
                actual = _page_setting(copy_text, label)
                if actual != value:
                    errors.append(
                        f"resource {key!r} page_copy {label} mismatch: {actual!r} != {value!r}"
                    )

    allowed_related = set(paths) | set(resource_paths) | {
        "/",
        "/services",
        "/bulk-merch-orders",
        "/online-stores",
        "/client-gifting",
        "/event-merchandise",
    }
    for key, resource in resources.items():
        for related in resource.get("related_paths", []):
            if related not in allowed_related:
                errors.append(f"resource {key!r} has unknown related path {related!r}")

    for niche_key, niche in niches.items():
        if niche.get("status") in DEDICATED_STATUSES and not any(
            resource.get("niche") == niche_key for resource in resources.values()
        ):
            errors.append(f"dedicated niche {niche_key!r} needs at least one resource")

    return errors


def validate_hubspot_config(config: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if config.get("schema_version") != "1.0.0":
        errors.append("HubSpot schema_version must be 1.0.0")
    guardrails = config.get("guardrails") or {}
    if guardrails.get("review_only") is not True:
        errors.append("HubSpot review_only must remain true")
    if guardrails.get("create_deal_after_human_qualification") is not True:
        errors.append("HubSpot deals must remain gated by human qualification")
    if guardrails.get("overwrite_first_touch") is not False:
        errors.append("HubSpot first-touch overwrite must remain false")

    groups = config.get("groups") or {}
    for object_type in HUBSPOT_OBJECTS:
        group = groups.get(object_type) or {}
        if not group.get("name") or not group.get("label"):
            errors.append(f"HubSpot {object_type} needs a property group name and label")

    option_sets = config.get("option_sets") or {}
    seen: set[tuple[str, str]] = set()
    properties = config.get("properties") or []
    if not properties:
        errors.append("HubSpot property plan is empty")
    for index, prop in enumerate(properties):
        prefix = f"HubSpot property #{index + 1}"
        object_type = prop.get("object_type")
        name = str(prop.get("name", ""))
        if object_type not in HUBSPOT_OBJECTS:
            errors.append(f"{prefix} has invalid object_type {object_type!r}")
        if not name.startswith("ca_"):
            errors.append(f"{prefix} name must start with ca_: {name!r}")
        identity = (str(object_type), name)
        if identity in seen:
            errors.append(f"duplicate HubSpot property {object_type}.{name}")
        seen.add(identity)
        if not prop.get("label") or not prop.get("description"):
            errors.append(f"{prefix} needs label and description")
        if prop.get("type") not in HUBSPOT_TYPES:
            errors.append(f"{prefix} has invalid type {prop.get('type')!r}")
        if prop.get("field_type") not in HUBSPOT_FIELD_TYPES:
            errors.append(f"{prefix} has invalid field_type {prop.get('field_type')!r}")
        option_set = prop.get("option_set")
        if prop.get("type") == "enumeration" and option_set not in option_sets:
            errors.append(f"{prefix} needs a valid option_set")
        if prop.get("type") != "enumeration" and option_set:
            errors.append(f"{prefix} cannot use option_set with type {prop.get('type')!r}")
    return errors


def validate_intake_schema(schema: dict[str, Any], hubspot: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if schema.get("schema_version") != "1.0.0":
        errors.append("Intake schema_version must be 1.0.0")

    contact_properties = {
        prop["name"]: prop
        for prop in hubspot.get("properties", [])
        if prop.get("object_type") == "contacts"
    }
    known_properties = set(contact_properties) | NATIVE_CONTACT_PROPERTIES
    fields = schema.get("fields") or {}
    required = set(schema.get("required_fields") or [])
    unknown_required = sorted(required - set(fields))
    if unknown_required:
        errors.append(f"Intake required_fields are undefined: {', '.join(unknown_required)}")

    mappings: list[str] = []
    for name, definition in fields.items():
        crm_property = str(definition.get("crm_property", ""))
        if not crm_property:
            errors.append(f"Intake field {name!r} needs crm_property")
            continue
        mappings.append(crm_property)
        if crm_property not in known_properties:
            errors.append(f"Intake field {name!r} maps to unknown contact property {crm_property!r}")
            continue
        prop = contact_properties.get(crm_property)
        field_type = definition.get("type")
        if field_type == "file" and prop and prop.get("field_type") != "file":
            errors.append(f"Intake file field {name!r} must map to a HubSpot file property")
        if field_type in {"enum", "multi_enum"} and prop:
            option_set = hubspot.get("option_sets", {}).get(prop.get("option_set"), {})
            unknown_values = sorted(set(definition.get("values", [])) - set(option_set))
            if unknown_values:
                errors.append(
                    f"Intake field {name!r} has values missing from HubSpot: {', '.join(unknown_values)}"
                )

    hidden = schema.get("hidden_attribution_fields") or []
    hidden_map = schema.get("hidden_attribution_property_map") or {}
    if set(hidden) != set(hidden_map):
        missing = sorted(set(hidden) - set(hidden_map))
        extra = sorted(set(hidden_map) - set(hidden))
        if missing:
            errors.append(f"Hidden attribution mappings missing: {', '.join(missing)}")
        if extra:
            errors.append(f"Hidden attribution mappings are unused: {', '.join(extra)}")
    for name in hidden:
        crm_property = str(hidden_map.get(name, ""))
        mappings.append(crm_property)
        if crm_property not in contact_properties:
            errors.append(
                f"Hidden attribution field {name!r} maps to unknown custom contact property {crm_property!r}"
            )
        elif contact_properties[crm_property].get("form_field") is not True:
            errors.append(f"Hidden attribution property {crm_property!r} must be usable in forms")

    duplicates = sorted({item for item in mappings if item and mappings.count(item) > 1})
    if duplicates:
        errors.append(f"Intake CRM mappings must be unique: {', '.join(duplicates)}")
    if fields.get("marketing_consent", {}).get("crm_property") != "ca_marketing_consent":
        errors.append("Marketing consent must map to ca_marketing_consent")
    if fields.get("inquiry_response_consent", {}).get("crm_property") != "ca_inquiry_response_consent":
        errors.append("Inquiry response consent must map to ca_inquiry_response_consent")
    return errors


def validate_nurture_config(config: dict[str, Any], inbound: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if config.get("schema_version") != "1.0.0":
        errors.append("Nurture schema_version must be 1.0.0")
    guardrails = config.get("guardrails") or {}
    required_true = (
        "review_only",
        "explicit_marketing_consent_required",
        "subscribed_email_status_required",
        "transactional_response_is_not_marketing_consent",
        "human_qualification_required_before_deal",
        "suppress_active_sales_conversations",
        "skip_past_fixed_dates",
        "unsubscribe_link_required",
    )
    for name in required_true:
        if guardrails.get(name) is not True:
            errors.append(f"Nurture guardrail {name} must remain true")
    for name in ("auto_quote", "auto_promise_timeline", "auto_accept_order"):
        if guardrails.get(name) is not False:
            errors.append(f"Nurture guardrail {name} must remain false")

    if not config.get("enrollment_contract"):
        errors.append("Nurture enrollment_contract is required")
    suppressions = config.get("global_suppressions") or []
    suppression_ids = [str(item.get("id", "")) for item in suppressions]
    missing_suppressions = sorted(REQUIRED_NURTURE_SUPPRESSIONS - set(suppression_ids))
    if missing_suppressions:
        errors.append(f"Nurture suppressions missing: {', '.join(missing_suppressions)}")
    if len(suppression_ids) != len(set(suppression_ids)):
        errors.append("Nurture suppression ids must be unique")
    for item in suppressions:
        if not item.get("condition") or not item.get("action"):
            errors.append(f"Nurture suppression {item.get('id')!r} needs condition and action")

    workflow_ids: set[str] = set()
    for workflow in config.get("workflows") or []:
        workflow_id = str(workflow.get("id", ""))
        if not workflow_id or workflow_id in workflow_ids:
            errors.append("Nurture workflows need unique ids")
        workflow_ids.add(workflow_id)
        if workflow.get("status") != "draft":
            errors.append(f"Nurture workflow {workflow_id!r} must remain draft")
        for field in ("type", "owner", "approval_gate", "trigger"):
            if not str(workflow.get(field, "")).strip():
                errors.append(f"Nurture workflow {workflow_id!r} needs {field}")
        if not workflow.get("required_conditions") or not workflow.get("actions"):
            errors.append(f"Nurture workflow {workflow_id!r} needs conditions and actions")

    programs = config.get("programs") or {}
    dedicated = {
        key
        for key, niche in inbound.get("niches", {}).items()
        if niche.get("status") in DEDICATED_STATUSES
    }
    if set(programs) != dedicated:
        errors.append(
            "Nurture programs must cover exactly the dedicated niches: "
            + ", ".join(sorted(dedicated))
        )
    campaigns: set[str] = set()
    for niche_key, program in programs.items():
        prefix = f"Nurture program {niche_key!r}"
        if niche_key not in inbound.get("niches", {}):
            continue
        if program.get("status") != "draft":
            errors.append(f"{prefix} must remain draft")
        if program.get("owner") != inbound["niches"][niche_key].get("owner"):
            errors.append(f"{prefix} owner must match the niche owner")
        mode = program.get("timing_mode")
        if mode not in NURTURE_TIMING_MODES:
            errors.append(f"{prefix} has invalid timing_mode {mode!r}")
        campaign = str(program.get("campaign", ""))
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", campaign):
            errors.append(f"{prefix} campaign must be lowercase and hyphenated")
        if campaign in campaigns:
            errors.append(f"{prefix} campaign must be unique")
        campaigns.add(campaign)

        steps = program.get("steps") or []
        if len(steps) < 4:
            errors.append(f"{prefix} needs at least four useful touches")
        step_ids: set[str] = set()
        timing_values: list[Any] = []
        for step in steps:
            step_id = str(step.get("id", ""))
            if not step_id or step_id in step_ids:
                errors.append(f"{prefix} needs unique step ids")
            step_ids.add(step_id)
            for field in ("intent", "subject", "body", "cta_label"):
                if not str(step.get(field, "")).strip():
                    errors.append(f"{prefix} step {step_id!r} needs {field}")
            if len(str(step.get("subject", ""))) > 120:
                errors.append(f"{prefix} step {step_id!r} subject exceeds 120 characters")

            resource_key = step.get("resource_key")
            cta_path = step.get("cta_path")
            if bool(resource_key) == bool(cta_path):
                errors.append(f"{prefix} step {step_id!r} needs exactly one CTA target")
            if resource_key:
                resource = inbound.get("resources", {}).get(resource_key)
                if not resource:
                    errors.append(f"{prefix} step {step_id!r} has unknown resource {resource_key!r}")
                elif resource.get("niche") != niche_key:
                    errors.append(f"{prefix} step {step_id!r} resource belongs to another niche")
            if cta_path and cta_path != inbound["niches"][niche_key].get("page_path"):
                errors.append(f"{prefix} step {step_id!r} CTA must use its niche commercial page")

            if mode == "fixed_dates":
                send_on = str(step.get("send_on", ""))
                try:
                    timing_values.append(datetime.strptime(send_on, "%Y-%m-%d").date())
                except ValueError:
                    errors.append(f"{prefix} step {step_id!r} needs send_on in YYYY-MM-DD format")
            elif mode == "relative_days":
                delay = step.get("delay_days")
                if not isinstance(delay, int) or delay < 0:
                    errors.append(f"{prefix} step {step_id!r} needs a non-negative delay_days")
                else:
                    timing_values.append(delay)
        if timing_values and timing_values != sorted(timing_values):
            errors.append(f"{prefix} timing must be chronological")
        if len(timing_values) != len(set(timing_values)):
            errors.append(f"{prefix} timing values must be unique")
    return errors


def validate_asset_config(config: dict[str, Any], inbound: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if config.get("schema_version") != "1.0.0":
        errors.append("Asset schema_version must be 1.0.0")
    guardrails = config.get("guardrails") or {}
    for name in (
        "review_only",
        "public_actions_require_approval",
        "currently_public_does_not_equal_reuse_approved",
        "written_permission_required_for_customer_identity",
        "written_permission_required_for_people_and_minors",
        "stock_or_generated_media_cannot_be_customer_proof",
        "generated_customer_logos_are_prohibited",
        "accessible_html_cannot_be_replaced_by_text_in_images",
        "descriptive_alt_text_required",
    ):
        if guardrails.get(name) is not True:
            errors.append(f"Asset guardrail {name} must remain true")

    assets = config.get("asset_library") or []
    asset_by_id: dict[str, dict[str, Any]] = {}
    for index, asset in enumerate(assets):
        prefix = f"Asset #{index + 1}"
        asset_id = str(asset.get("id", ""))
        if not asset_id or asset_id in asset_by_id:
            errors.append(f"{prefix} needs a unique id")
        asset_by_id[asset_id] = asset
        if asset.get("permission_status") not in ASSET_PERMISSION_STATUSES:
            errors.append(f"{prefix} has invalid permission_status")
        if not str(asset.get("source_url", "")).startswith("https://"):
            errors.append(f"{prefix} source_url must use https")
        if not str(asset.get("source_page", "")).startswith("https://"):
            errors.append(f"{prefix} source_page must use https")
        for field in ("kind", "current_filename", "current_alt", "content_summary"):
            if not str(asset.get(field, "")).strip():
                errors.append(f"{prefix} needs {field}")
        for field in ("contains_people", "contains_minors", "contains_customer_brand"):
            if not isinstance(asset.get(field), bool):
                errors.append(f"{prefix} {field} must be boolean")
        unknown_niches = sorted(
            set(asset.get("candidate_niches", [])) - set(inbound.get("niches", {}))
        )
        if unknown_niches:
            errors.append(f"{prefix} has unknown candidate niches: {', '.join(unknown_niches)}")
        if asset.get("permission_status") == "approved" and not str(
            asset.get("approval_evidence", "")
        ).strip():
            errors.append(f"{prefix} is approved without evidence")

    proof_records = config.get("proof_records") or []
    proof_by_id: dict[str, dict[str, Any]] = {}
    for index, proof in enumerate(proof_records):
        prefix = f"Proof record #{index + 1}"
        proof_id = str(proof.get("id", ""))
        if not proof_id or proof_id in proof_by_id:
            errors.append(f"{prefix} needs a unique id")
        proof_by_id[proof_id] = proof
        if proof.get("niche") not in inbound.get("niches", {}):
            errors.append(f"{prefix} has unknown niche {proof.get('niche')!r}")
        if proof.get("permission_status") not in ASSET_PERMISSION_STATUSES:
            errors.append(f"{prefix} has invalid permission_status")
        if not str(proof.get("source_url", "")).startswith("https://"):
            errors.append(f"{prefix} source_url must use https")
        for field in ("person", "role", "organization"):
            if not str(proof.get(field, "")).strip():
                errors.append(f"{prefix} needs {field}")
        if proof.get("permission_status") == "approved" and not str(
            proof.get("approval_evidence", "")
        ).strip():
            errors.append(f"{prefix} is approved without evidence")

    dedicated = {
        key
        for key, niche in inbound.get("niches", {}).items()
        if niche.get("status") in DEDICATED_STATUSES
    }
    commercial = config.get("commercial_pages") or {}
    expected_pages = dedicated | {"services"}
    if set(commercial) != expected_pages:
        errors.append(
            "Asset commercial_pages must cover services and every dedicated niche: "
            + ", ".join(sorted(expected_pages))
        )

    def validate_slots(
        slots: list[dict[str, Any]], required: set[str], prefix: str, niche_key: str
    ) -> None:
        slot_ids = [str(slot.get("id", "")) for slot in slots]
        if set(slot_ids) != required or len(slot_ids) != len(required):
            errors.append(f"{prefix} must contain exactly these slots: {', '.join(sorted(required))}")
        for slot in slots:
            slot_id = str(slot.get("id", ""))
            slot_prefix = f"{prefix} slot {slot_id!r}"
            status = slot.get("status")
            if status not in ASSET_SLOT_STATUSES:
                errors.append(f"{slot_prefix} has invalid status {status!r}")
            candidates = slot.get("candidate_assets") or []
            proof_ids = slot.get("proof_ids") or []
            asset_file = str(slot.get("asset_file", "")).strip()
            if status == "candidate" and not (candidates or proof_ids):
                errors.append(f"{slot_prefix} candidate status needs an asset or proof record")
            if status == "brief_ready" and not str(slot.get("brief", "")).strip():
                errors.append(f"{slot_prefix} brief_ready status needs a production brief")
            for asset_id in candidates:
                asset = asset_by_id.get(asset_id)
                if not asset:
                    errors.append(f"{slot_prefix} has unknown asset {asset_id!r}")
                elif niche_key != "shared" and niche_key not in asset.get("candidate_niches", []):
                    errors.append(f"{slot_prefix} uses asset {asset_id!r} outside its candidate niches")
            for proof_id in proof_ids:
                proof = proof_by_id.get(proof_id)
                if not proof:
                    errors.append(f"{slot_prefix} has unknown proof {proof_id!r}")
                elif niche_key != "shared" and proof.get("niche") != niche_key:
                    errors.append(f"{slot_prefix} uses proof {proof_id!r} from another niche")
            for field in ("format", "brief", "alt_text_draft", "approval_gate"):
                if not str(slot.get(field, "")).strip():
                    errors.append(f"{slot_prefix} needs {field}")
            if status == "approved" and not str(slot.get("approval_evidence", "")).strip():
                errors.append(f"{slot_prefix} is approved without evidence")
            if asset_file and not (
                asset_file.startswith("https://") or _repo_path(asset_file).is_file()
            ):
                errors.append(f"{slot_prefix} asset_file does not exist or use https")
            if status == "approved" and not (asset_file or candidates or proof_ids):
                errors.append(f"{slot_prefix} is approved without an asset_file or approved source")
            if status == "approved":
                for asset_id in candidates:
                    if asset_by_id[asset_id].get("permission_status") != "approved":
                        errors.append(f"{slot_prefix} uses unapproved asset {asset_id!r}")
                for proof_id in proof_ids:
                    if proof_by_id[proof_id].get("permission_status") != "approved":
                        errors.append(f"{slot_prefix} uses unapproved proof {proof_id!r}")

    for page_key, page in commercial.items():
        prefix = f"Asset page {page_key!r}"
        expected_niche = "shared" if page_key == "services" else page_key
        if page.get("niche") != expected_niche:
            errors.append(f"{prefix} niche must be {expected_niche!r}")
        expected_owner = (
            "ryan" if page_key == "services" else inbound["niches"][page_key].get("owner")
        )
        if page.get("owner") != expected_owner:
            errors.append(f"{prefix} owner must be {expected_owner!r}")
        expected_path = (
            "/services"
            if page_key == "services"
            else str(inbound["niches"][page_key].get("page_path", ""))
        )
        if page.get("path") != expected_path:
            errors.append(f"{prefix} path must be {expected_path!r}")
        if page.get("status") not in ASSET_PAGE_STATUSES:
            errors.append(f"{prefix} has invalid status {page.get('status')!r}")
        source_file = str(page.get("source_file", ""))
        if not source_file or not _repo_path(source_file).is_file():
            errors.append(f"{prefix} source_file does not exist: {source_file}")
        elif _page_setting(_repo_path(source_file).read_text(), "URL") != expected_path:
            errors.append(f"{prefix} source_file URL does not match {expected_path!r}")
        validate_slots(
            page.get("slots") or [], REQUIRED_COMMERCIAL_ASSET_SLOTS, prefix, expected_niche
        )
        if page.get("status") == "approved":
            if not str(page.get("approval_evidence", "")).strip():
                errors.append(f"{prefix} is approved without evidence")
            if any(slot.get("status") != "approved" for slot in page.get("slots", [])):
                errors.append(f"{prefix} is approved while an asset slot is not approved")

    template = config.get("resource_template") or {}
    if template.get("status") != "draft":
        errors.append("Asset resource_template defaults must remain draft")
    validate_slots(
        template.get("slots") or [],
        REQUIRED_RESOURCE_ASSET_SLOTS,
        "Asset resource template",
        "shared",
    )
    overrides = config.get("resource_overrides") or {}
    if set(overrides) != set(inbound.get("resources", {})):
        errors.append("Asset resource_overrides must cover every configured resource")
    template_by_id = {slot["id"]: slot for slot in template.get("slots", [])}
    for resource_key, resource in inbound.get("resources", {}).items():
        override = overrides.get(resource_key) or {}
        prefix = f"Asset resource {resource_key!r}"
        if override.get("status") not in ASSET_PAGE_STATUSES:
            errors.append(f"{prefix} has invalid status {override.get('status')!r}")
        slot_overrides = override.get("slots") or {}
        unknown_slots = sorted(set(slot_overrides) - set(template_by_id))
        if unknown_slots:
            errors.append(f"{prefix} has unknown slot overrides: {', '.join(unknown_slots)}")
        merged_slots = []
        for slot_id, template_slot in template_by_id.items():
            merged = dict(template_slot)
            merged.update(slot_overrides.get(slot_id) or {})
            merged_slots.append(merged)
        validate_slots(merged_slots, REQUIRED_RESOURCE_ASSET_SLOTS, prefix, resource["niche"])
        if override.get("status") == "approved":
            if not str(override.get("approval_evidence", "")).strip():
                errors.append(f"{prefix} is approved without evidence")
            if any(slot.get("status") != "approved" for slot in merged_slots):
                errors.append(f"{prefix} is approved while an asset slot is not approved")
    return errors


def validate_measurement_config(config: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if config.get("schema_version") != "1.0.0":
        errors.append("Measurement schema_version must be 1.0.0")
    guardrails = config.get("guardrails") or {}
    for name in (
        "review_only",
        "no_contact_pii_in_analytics",
        "form_submit_attempt_is_not_conversion",
        "raw_inquiry_is_not_primary_ad_conversion",
        "human_qualification_required_for_primary_lead_conversion",
        "revenue_requires_quickbooks_reconciliation",
        "consent_behavior_must_be_tested",
    ):
        if guardrails.get(name) is not True:
            errors.append(f"Measurement guardrail {name} must remain true")

    gates = config.get("activation_gates") or []
    gate_ids: set[str] = set()
    for gate in gates:
        gate_id = str(gate.get("id", ""))
        if not gate_id or gate_id in gate_ids:
            errors.append("Measurement activation gates need unique ids")
        gate_ids.add(gate_id)
        if not gate.get("owner"):
            errors.append(f"Measurement gate {gate_id!r} needs an owner")
        if gate.get("complete") is True and not str(gate.get("evidence", "")).strip():
            errors.append(f"Measurement gate {gate_id!r} is complete without evidence")

    variables = config.get("data_layer_variables") or []
    variable_names = [str(item.get("name", "")) for item in variables]
    variable_keys = [str(item.get("key", "")) for item in variables]
    if len(variable_names) != len(set(variable_names)) or len(variable_keys) != len(set(variable_keys)):
        errors.append("Measurement data-layer variable names and keys must be unique")
    for item in variables:
        if not item.get("name") or not str(item.get("key", "")).startswith("ca_"):
            errors.append("Measurement data-layer variables need a name and ca_ key")
        if item.get("type") != "string":
            errors.append(f"Measurement variable {item.get('key')!r} must use string type")

    forbidden = set(config.get("forbidden_analytics_parameters") or [])
    client_events = config.get("client_events") or {}
    server_events = config.get("server_events") or {}
    all_events = {**client_events, **server_events}
    if set(client_events) & set(server_events):
        errors.append("Measurement client and server event names must be unique")
    for event_name, event in all_events.items():
        prefix = f"Measurement event {event_name!r}"
        if not re.fullmatch(r"[a-z][a-z0-9_]*", event_name):
            errors.append(f"{prefix} must use lowercase snake_case")
        if event.get("status") not in MEASUREMENT_EVENT_STATUSES:
            errors.append(f"{prefix} has invalid status {event.get('status')!r}")
        for field in ("owner", "trigger"):
            if not str(event.get(field, "")).strip():
                errors.append(f"{prefix} needs {field}")
        parameters = event.get("parameters") or []
        if len(parameters) != len(set(parameters)):
            errors.append(f"{prefix} has duplicate parameters")
        pii = sorted(set(parameters) & forbidden)
        if pii:
            errors.append(f"{prefix} includes forbidden PII parameters: {', '.join(pii)}")
        for parameter in parameters:
            if parameter not in STANDARD_ANALYTICS_PARAMETERS and not str(parameter).startswith("ca_"):
                errors.append(f"{prefix} has invalid parameter {parameter!r}")
        if event.get("conversion_level") not in MEASUREMENT_CONVERSION_LEVELS:
            errors.append(f"{prefix} has invalid conversion_level")
        if not isinstance(event.get("key_event"), bool):
            errors.append(f"{prefix} key_event must be boolean")
    for event_name, event in client_events.items():
        missing_variables = sorted(set(event.get("parameters", [])) - set(variable_keys))
        if missing_variables:
            errors.append(
                f"Measurement client event {event_name!r} lacks GTM variables: "
                + ", ".join(missing_variables)
            )
    if client_events.get("form_submit_attempt", {}).get("key_event") is not False:
        errors.append("form_submit_attempt must not be a key event")
    if client_events.get("inquiry_submit", {}).get("conversion_level") != "secondary":
        errors.append("inquiry_submit must remain a secondary conversion")
    if server_events.get("qualified_inbound_lead", {}).get("conversion_level") != "primary":
        errors.append("qualified_inbound_lead must remain the primary lead conversion")
    if server_events.get("inbound_revenue", {}).get("source_system") != "quickbooks_reconciled":
        errors.append("inbound_revenue must require QuickBooks reconciliation")

    runtime_path = (
        ROOT
        / "pillars"
        / "3-online-presence"
        / "inbound"
        / "implementation"
        / "squarespace-attribution.js"
    )
    runtime_events = set(re.findall(r'track\("([a-z0-9_]+)"', runtime_path.read_text()))
    if runtime_events != set(client_events):
        missing = sorted(set(client_events) - runtime_events)
        extra = sorted(runtime_events - set(client_events))
        if missing:
            errors.append(f"Browser runtime is missing configured events: {', '.join(missing)}")
        if extra:
            errors.append(f"Browser runtime emits unconfigured events: {', '.join(extra)}")

    policy = config.get("google_ads_conversion_policy") or {}
    if policy.get("bidding_primary") != "qualified_inbound_lead":
        errors.append("Google Ads bidding_primary must remain qualified_inbound_lead")
    policy_events = {
        policy.get("bidding_primary"),
        *(policy.get("observation_only") or []),
        *(policy.get("never_import") or []),
    }
    unknown_policy = sorted(item for item in policy_events if item and item not in all_events)
    if unknown_policy:
        errors.append(f"Google Ads policy references unknown events: {', '.join(unknown_policy)}")
    if not policy.get("enable_only_after"):
        errors.append("Google Ads conversion policy needs enable_only_after gates")
    return errors


def validate_partner_config(config: dict[str, Any], inbound: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    if config.get("schema_version") != "1.0.0":
        errors.append("Partner schema_version must be 1.0.0")
    guardrails = config.get("guardrails") or {}
    for name in (
        "draft_only",
        "human_approval_required",
        "no_paid_placement_without_attribution_plan",
        "no_customer_or_member_data_purchase",
    ):
        if guardrails.get(name) is not True:
            errors.append(f"Partner guardrail {name} must remain true")

    targets = config.get("targets") or []
    if not targets:
        errors.append("Partner target registry is empty")
        return errors
    seen: set[str] = set()
    for index, target in enumerate(targets):
        prefix = f"Partner target #{index + 1}"
        target_id = str(target.get("id", ""))
        if not target_id or target_id in seen:
            errors.append(f"{prefix} needs a unique id")
        seen.add(target_id)
        if target.get("niche") not in inbound.get("niches", {}):
            errors.append(f"{prefix} has unknown niche {target.get('niche')!r}")
        if target.get("resource_key") not in inbound.get("resources", {}):
            errors.append(f"{prefix} has unknown resource_key {target.get('resource_key')!r}")
        url = str(target.get("official_url", ""))
        if not url.startswith("https://"):
            errors.append(f"{prefix} official_url must use https")
        if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(target.get("source_checked", ""))):
            errors.append(f"{prefix} needs source_checked in YYYY-MM-DD format")
        if target.get("source_status") not in PARTNER_SOURCE_STATUSES:
            errors.append(f"{prefix} has invalid source_status {target.get('source_status')!r}")
        if target.get("priority") not in {"P1", "P2", "P3"}:
            errors.append(f"{prefix} has invalid priority {target.get('priority')!r}")
        if not isinstance(target.get("fit_score"), int) or not 1 <= target["fit_score"] <= 5:
            errors.append(f"{prefix} fit_score must be an integer from 1 to 5")
        if target.get("status") not in PARTNER_STATUSES:
            errors.append(f"{prefix} has invalid status {target.get('status')!r}")
        for field in (
            "organization",
            "program",
            "motion",
            "cost_evidence",
            "pitch_angle",
            "decision_gate",
            "next_action",
            "owner",
        ):
            if not str(target.get(field, "")).strip():
                errors.append(f"{prefix} needs {field}")
        utm_source = str(target.get("utm_source", ""))
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", utm_source):
            errors.append(f"{prefix} utm_source must be lowercase and hyphenated")
    return errors


def _gate_result(name: str, source: str, gate: dict[str, Any]) -> GateResult:
    return GateResult(
        name=name,
        source=source,
        complete=gate.get("complete") is True,
        owner=str(gate.get("owner", "")),
        evidence=str(gate.get("evidence", "")),
    )


def readiness(config: dict[str, Any], niche_key: str, channel: str) -> list[GateResult]:
    if channel not in CHANNELS:
        raise ValueError(f"unknown channel {channel!r}")
    niche = config["niches"][niche_key]
    results: list[GateResult] = []

    if channel in {"site", "organic", "paid"}:
        results.append(
            GateResult(
                name="public_release_approved",
                source="guardrail",
                complete=config["guardrails"].get("draft_only") is False,
                owner="ryan",
                evidence="Set draft_only=false only after a human launch decision.",
            )
        )
        results.append(
            GateResult(
                name="offer_approved",
                source="niche",
                complete=niche.get("offer_approved") is True,
                owner=str(niche.get("owner", "")),
                evidence="Offer label and delivery terms approved for public use.",
            )
        )
        page_copy = str(niche.get("page_copy", "")).strip()
        results.append(
            GateResult(
                name="page_copy_exists",
                source="repository",
                complete=bool(page_copy and _repo_path(page_copy).is_file()),
                owner=str(niche.get("owner", "")),
                evidence=page_copy,
            )
        )

    for name, gate in config.get("shared_gates", {}).items():
        if channel in gate.get("required_for", []):
            results.append(_gate_result(name, "shared", gate))
    for name, gate in niche.get("gates", {}).items():
        if channel in gate.get("required_for", []):
            results.append(_gate_result(name, "niche", gate))

    if channel == "paid":
        results.append(
            GateResult(
                name="paid_campaign_definition_exists",
                source="repository",
                complete=bool(niche.get("ads")),
                owner=str(niche.get("owner", "")),
                evidence=str((niche.get("ads") or {}).get("campaign", "")),
            )
        )
        geo = str((niche.get("ads") or {}).get("geo", ""))
        results.append(
            GateResult(
                name="paid_geography_confirmed",
                source="niche",
                complete=bool(geo and "[CONFIRM]" not in geo),
                owner="ryan",
                evidence=geo,
            )
        )

    if channel == "organic":
        niche_resources = [
            resource
            for resource in config.get("resources", {}).values()
            if resource.get("niche") == niche_key
        ]
        existing_resources = [
            resource
            for resource in niche_resources
            if _repo_path(str(resource.get("page_copy", ""))).is_file()
        ]
        results.append(
            GateResult(
                name="resource_copy_exists",
                source="repository",
                complete=bool(niche_resources and len(existing_resources) == len(niche_resources)),
                owner=str(niche.get("owner", "")),
                evidence=", ".join(resource.get("path", "") for resource in existing_resources),
            )
        )

    return results


def audit_data(
    config: dict[str, Any], niche_filter: str | None = None, channel_filter: str | None = None
) -> dict[str, Any]:
    data: dict[str, Any] = {"schema_version": config["schema_version"], "niches": {}}
    niche_keys = [niche_filter] if niche_filter else list(config["niches"])
    channels = [channel_filter] if channel_filter else list(CHANNELS)

    for key in niche_keys:
        niche = config["niches"][key]
        if niche.get("status") == "shared_only" and not niche_filter:
            continue
        item = {
            "label": niche.get("label"),
            "status": niche.get("status"),
            "priority": niche.get("priority"),
            "channels": {},
        }
        for channel in channels:
            gates = readiness(config, key, channel)
            blockers = [asdict(gate) for gate in gates if not gate.complete]
            item["channels"][channel] = {
                "ready": not blockers,
                "gate_count": len(gates),
                "blocker_count": len(blockers),
                "blockers": blockers,
            }
        data["niches"][key] = item
    return data


def _print_audit(data: dict[str, Any], verbose: bool) -> None:
    print("Creative Alternatives inbound launch preflight")
    print("Niche             Channel   Result       Blockers")
    print("----------------  --------  -----------  --------")
    for key, niche in data["niches"].items():
        for channel, result in niche["channels"].items():
            status = "READY" if result["ready"] else "BLOCKED"
            print(f"{key[:16]:16}  {channel:8}  {status:11}  {result['blocker_count']}")
            if verbose:
                for blocker in result["blockers"]:
                    print(
                        f"  - {blocker['name']} [{blocker['source']}; owner: {blocker['owner'] or 'unassigned'}]"
                    )


def _write_csv(path: Path, columns: list[str], rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)


def render_metadata(config: dict[str, Any], output: Path) -> int:
    rows = []
    for key, niche in sorted(config["niches"].items(), key=lambda item: item[1]["priority"]):
        if not niche.get("page_path"):
            continue
        rows.append(
            {
                "priority": niche["priority"],
                "niche_key": key,
                "niche": niche["label"],
                "status": niche["status"],
                "path": niche["page_path"],
                "title": niche.get("title", ""),
                "meta_description": niche.get("meta_description", ""),
                "offer_id": niche.get("offer_id", ""),
                "offer_label": niche.get("offer_label", ""),
                "owner": niche.get("owner", ""),
                "page_copy": niche.get("page_copy", ""),
            }
        )
    _write_csv(
        output / "page-metadata.csv",
        [
            "priority",
            "niche_key",
            "niche",
            "status",
            "path",
            "title",
            "meta_description",
            "offer_id",
            "offer_label",
            "owner",
            "page_copy",
        ],
        rows,
    )
    return len(rows)


def render_form_map(config: dict[str, Any], schema_path: Path, output: Path) -> int:
    schema = json.loads(schema_path.read_text())
    rows: list[dict[str, Any]] = []
    required = set(schema.get("required_fields", []))
    for name, definition in schema.get("fields", {}).items():
        rows.append(
            {
                "form_field": name,
                "crm_property": definition.get("crm_property", ""),
                "data_attribute": f"data-ca-field={name}",
                "type": definition.get("type", "string"),
                "required": name in required or definition.get("required") is True,
                "hidden": False,
                "allowed_values": ";".join(definition.get("values", [])),
            }
        )
    attribution_map = schema.get("hidden_attribution_property_map", {})
    for name in schema.get("hidden_attribution_fields", []):
        rows.append(
            {
                "form_field": name,
                "crm_property": attribution_map.get(name, ""),
                "data_attribute": f"data-ca-field={name}",
                "type": "string",
                "required": False,
                "hidden": True,
                "allowed_values": "",
            }
        )
    _write_csv(
        output / "form-field-map.csv",
        [
            "form_field",
            "crm_property",
            "data_attribute",
            "type",
            "required",
            "hidden",
            "allowed_values",
        ],
        rows,
    )
    return len(rows)


def render_ads(config: dict[str, Any], output: Path) -> tuple[int, int]:
    common_columns = [
        "Campaign",
        "Campaign type",
        "Status",
        "Ad group",
        "Keyword",
        "Match type",
        "Ad type",
        "Final URL",
    ]
    headline_columns = [f"Headline {index}" for index in range(1, 16)]
    description_columns = [f"Description {index}" for index in range(1, 5)]
    columns = common_columns + headline_columns + description_columns
    rows: list[dict[str, Any]] = []
    negative_rows: list[dict[str, Any]] = []

    for niche in config["niches"].values():
        ads = niche.get("ads")
        if not ads:
            continue
        campaign = ads["campaign"]
        rows.append({"Campaign": campaign, "Campaign type": "Search", "Status": "Paused"})
        for group_name, group in ads["ad_groups"].items():
            rows.append({"Campaign": campaign, "Ad group": group_name, "Status": "Paused"})
            for keyword in group["keywords"]:
                for match_type in ("Exact", "Phrase"):
                    rows.append(
                        {
                            "Campaign": campaign,
                            "Ad group": group_name,
                            "Keyword": keyword,
                            "Match type": match_type,
                            "Status": "Paused",
                            "Final URL": ads["landing_page"],
                        }
                    )
            ad_row = {
                "Campaign": campaign,
                "Ad group": group_name,
                "Ad type": "Responsive search ad",
                "Status": "Paused",
                "Final URL": ads["landing_page"],
            }
            for index, value in enumerate(ads["headlines"], start=1):
                ad_row[f"Headline {index}"] = value
            for index, value in enumerate(ads["descriptions"], start=1):
                ad_row[f"Description {index}"] = value
            rows.append(ad_row)
        for negative in config.get("shared_negative_keywords", []):
            negative_rows.append(
                {
                    "Campaign": campaign,
                    "Negative keyword": negative,
                    "Match type": "Broad",
                    "Status": "Paused",
                }
            )

    _write_csv(output / "google-ads-editor-proposal.csv", columns, rows)
    _write_csv(
        output / "google-ads-negative-keywords.csv",
        ["Campaign", "Negative keyword", "Match type", "Status"],
        negative_rows,
    )
    return len(rows), len(negative_rows)


def _hubspot_options(config: dict[str, Any], prop: dict[str, Any]) -> list[dict[str, Any]]:
    if prop["type"] == "bool":
        return [
            {"label": "Yes", "value": "true", "displayOrder": 0, "hidden": False},
            {"label": "No", "value": "false", "displayOrder": 1, "hidden": False},
        ]
    option_values = config["option_sets"].get(prop.get("option_set"), {})
    return [
        {
            "label": label,
            "value": value,
            "displayOrder": index,
            "hidden": False,
        }
        for index, (value, label) in enumerate(option_values.items())
    ]


def render_hubspot(config: dict[str, Any], output: Path) -> int:
    option_sets = config["option_sets"]
    groups = config["groups"]
    rows: list[dict[str, Any]] = []
    api_properties: list[dict[str, Any]] = []

    for prop in config["properties"]:
        options = _hubspot_options(config, prop)
        rows.append(
            {
                "object_type": prop["object_type"],
                "group_name": groups[prop["object_type"]]["name"],
                "name": prop["name"],
                "label": prop["label"],
                "type": prop["type"],
                "field_type": prop["field_type"],
                "form_field": prop.get("form_field", False),
                "option_set": prop.get("option_set", ""),
                "options": ";".join(f"{item['value']}={item['label']}" for item in options),
                "description": prop["description"],
            }
        )
        api_properties.append(
            {
                "object_type": prop["object_type"],
                "endpoint": f"/crm/v3/properties/{prop['object_type']}",
                "payload": {
                    "groupName": groups[prop["object_type"]]["name"],
                    "name": prop["name"],
                    "label": prop["label"],
                    "type": prop["type"],
                    "fieldType": prop["field_type"],
                    "description": prop["description"],
                    "formField": prop.get("form_field", False),
                    "hidden": False,
                    "displayOrder": -1,
                    "hasUniqueValue": False,
                    "options": options,
                },
            }
        )

    _write_csv(
        output / "hubspot-property-plan.csv",
        [
            "object_type",
            "group_name",
            "name",
            "label",
            "type",
            "field_type",
            "form_field",
            "option_set",
            "options",
            "description",
        ],
        rows,
    )
    api_plan = {
        "review_only": True,
        "warning": "Human review required. This file does not create properties or workflows.",
        "groups": [
            {
                "object_type": object_type,
                "endpoint": f"/crm/v3/properties/{object_type}/groups",
                "payload": {
                    "name": group["name"],
                    "label": group["label"],
                    "displayOrder": -1,
                },
            }
            for object_type, group in groups.items()
        ],
        "properties": api_properties,
    }
    (output / "hubspot-api-plan.json").write_text(json.dumps(api_plan, indent=2) + "\n")
    return len(rows)


def render_resources(config: dict[str, Any], output: Path) -> tuple[int, int, int]:
    base_url = "https://www.creativealternatives.com"
    metadata_rows: list[dict[str, Any]] = []
    link_rows: list[dict[str, Any]] = []
    schema_items: list[dict[str, Any]] = []
    niches = config["niches"]
    resources = config.get("resources", {})
    shared_labels = {
        "/": "Creative Alternatives",
        "/services": "Branded Merchandise Services",
        "/bulk-merch-orders": "Bulk Merchandise",
        "/online-stores": "Managed Online Stores",
        "/client-gifting": "Client And Employee Gifting",
        "/event-merchandise": "Event Merchandise",
    }
    path_labels = dict(shared_labels)
    for niche in niches.values():
        if niche.get("page_path"):
            path_labels[niche["page_path"]] = niche["label"]
    for resource in resources.values():
        path_labels[resource["path"]] = resource["headline"].rstrip(".")

    for key, resource in resources.items():
        niche = niches[resource["niche"]]
        metadata_rows.append(
            {
                "resource_key": key,
                "niche_key": resource["niche"],
                "niche": niche["label"],
                "status": resource["status"],
                "path": resource["path"],
                "title": resource["title"],
                "headline": resource["headline"],
                "meta_description": resource["meta_description"],
                "parent_path": resource["parent_path"],
                "cta": resource["cta"],
                "owner": resource["owner"],
                "page_copy": resource["page_copy"],
            }
        )
        link_rows.append(
            {
                "source_path": resource["path"],
                "target_path": resource["parent_path"],
                "relationship": "commercial_parent",
                "anchor_hint": resource["cta"],
                "required": True,
            }
        )
        link_rows.append(
            {
                "source_path": resource["parent_path"],
                "target_path": resource["path"],
                "relationship": "supporting_resource",
                "anchor_hint": resource["headline"].rstrip("."),
                "required": True,
            }
        )
        for related in resource.get("related_paths", []):
            link_rows.append(
                {
                    "source_path": resource["path"],
                    "target_path": related,
                    "relationship": "related",
                    "anchor_hint": path_labels.get(related, related.rsplit("/", 1)[-1].replace("-", " ").title()),
                    "required": False,
                }
            )

        canonical = base_url + resource["path"]
        schema_items.append(
            {
                "resource_key": key,
                "path": resource["path"],
                "article": {
                    "@context": "https://schema.org",
                    "@type": "Article",
                    "headline": resource["headline"].rstrip("."),
                    "description": resource["meta_description"],
                    "mainEntityOfPage": {"@type": "WebPage", "@id": canonical},
                    "url": canonical,
                    "about": {"@type": "Thing", "name": niche["label"]},
                    "author": {"@type": "Organization", "name": "Creative Alternatives"},
                    "publisher": {"@type": "Organization", "name": "Creative Alternatives"},
                },
                "breadcrumb": {
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        {
                            "@type": "ListItem",
                            "position": 1,
                            "name": "Home",
                            "item": base_url + "/",
                        },
                        {
                            "@type": "ListItem",
                            "position": 2,
                            "name": "Resources",
                            "item": base_url + "/resources",
                        },
                        {
                            "@type": "ListItem",
                            "position": 3,
                            "name": resource["headline"].rstrip("."),
                            "item": canonical,
                        },
                    ],
                },
                "publish_requirements": [
                    "Add approved image and image schema when available",
                    "Add datePublished and dateModified at publication",
                    "Confirm visible author/publisher details match markup",
                    "Validate rendered markup before indexing",
                ],
            }
        )

    _write_csv(
        output / "resource-metadata.csv",
        [
            "resource_key",
            "niche_key",
            "niche",
            "status",
            "path",
            "title",
            "headline",
            "meta_description",
            "parent_path",
            "cta",
            "owner",
            "page_copy",
        ],
        metadata_rows,
    )
    _write_csv(
        output / "internal-links.csv",
        ["source_path", "target_path", "relationship", "anchor_hint", "required"],
        link_rows,
    )
    (output / "structured-data-plan.json").write_text(
        json.dumps(
            {
                "review_only": True,
                "warning": "Complete publish requirements and validate against rendered pages.",
                "resources": schema_items,
            },
            indent=2,
        )
        + "\n"
    )
    return len(metadata_rows), len(link_rows), len(schema_items)


def render_partners(
    partners: dict[str, Any], inbound: dict[str, Any], output: Path
) -> tuple[int, int]:
    columns = [
        "id",
        "niche",
        "organization",
        "program",
        "motion",
        "official_url",
        "source_checked",
        "source_status",
        "priority",
        "fit_score",
        "cost_evidence",
        "resource_key",
        "resource_path",
        "pitch_angle",
        "decision_gate",
        "next_action",
        "owner",
        "status",
        "utm_source",
    ]
    rows: list[dict[str, Any]] = []
    for target in partners["targets"]:
        row = dict(target)
        row["resource_path"] = inbound["resources"][target["resource_key"]]["path"]
        rows.append(row)
    rows.sort(key=lambda row: (row["priority"], -row["fit_score"], row["niche"], row["organization"]))
    _write_csv(output / "partnership-tracker.csv", columns, rows)

    by_niche: dict[str, list[dict[str, Any]]] = {}
    for row in rows:
        by_niche.setdefault(row["niche"], []).append(row)
    priority_counts = {
        priority: sum(1 for row in rows if row["priority"] == priority)
        for priority in ("P1", "P2", "P3")
    }
    lines = [
        "# Generated Partnership Scorecard",
        "",
        "> Draft-only. No outreach or spend is approved by this file.",
        "",
        f"- Targets: **{len(rows)}**",
        f"- P1: **{priority_counts['P1']}**",
        f"- P2: **{priority_counts['P2']}**",
        f"- P3: **{priority_counts['P3']}**",
        "",
        "## By Niche",
        "",
        "| Niche | Targets | P1 | P2 | P3 |",
        "|---|---:|---:|---:|---:|",
    ]
    for niche, niche_rows in sorted(by_niche.items()):
        lines.append(
            f"| {inbound['niches'][niche]['label']} | {len(niche_rows)} | "
            f"{sum(1 for row in niche_rows if row['priority'] == 'P1')} | "
            f"{sum(1 for row in niche_rows if row['priority'] == 'P2')} | "
            f"{sum(1 for row in niche_rows if row['priority'] == 'P3')} |"
        )
    lines.extend(
        [
            "",
            "## P1 Validation Queue",
            "",
            "| Organization | Program | Resource | Next action |",
            "|---|---|---|---|",
        ]
    )
    for row in rows:
        if row["priority"] == "P1":
            lines.append(
                f"| {row['organization']} | {row['program']} | `{row['resource_path']}` | {row['next_action']} |"
            )
    lines.extend(
        [
            "",
            "## Approval Rule",
            "",
            "Move a target beyond `research` only after a human reviews the current terms, audience, "
            "category conflicts, content rights, expected lead path, cost, and attribution plan.",
            "",
        ]
    )
    (output / "partnership-scorecard.md").write_text("\n".join(lines))
    return len(rows), priority_counts["P1"]


def render_nurture(
    nurture: dict[str, Any], inbound: dict[str, Any], output: Path
) -> tuple[int, int, int]:
    workflow_rows: list[dict[str, Any]] = []
    for workflow in nurture["workflows"]:
        workflow_rows.append(
            {
                "id": workflow["id"],
                "type": workflow["type"],
                "status": workflow["status"],
                "owner": workflow["owner"],
                "approval_gate": workflow["approval_gate"],
                "trigger": workflow["trigger"],
                "required_conditions": " | ".join(workflow["required_conditions"]),
                "actions": " | ".join(workflow["actions"]),
                "customer_message": workflow.get("customer_message", ""),
            }
        )
    _write_csv(
        output / "hubspot-workflow-plan.csv",
        [
            "id",
            "type",
            "status",
            "owner",
            "approval_gate",
            "trigger",
            "required_conditions",
            "actions",
            "customer_message",
        ],
        workflow_rows,
    )

    email_rows: list[dict[str, Any]] = []
    base_url = "https://www.creativealternatives.com"
    lines = [
        "# Generated Nurture Copy Deck",
        "",
        "> Review-only. Every marketing send requires explicit consent, subscribed email status, "
        "and a final human review in HubSpot.",
        "",
        "## Global Enrollment Contract",
        "",
    ]
    lines.extend(f"- {condition}" for condition in nurture["enrollment_contract"])
    lines.extend(["", "## Global Suppressions", ""])
    for suppression in nurture["global_suppressions"]:
        lines.append(f"- **{suppression['id']}**: {suppression['condition']}. {suppression['action']}.")

    for niche_key, program in sorted(
        nurture["programs"].items(), key=lambda item: inbound["niches"][item[0]]["priority"]
    ):
        lines.extend(
            [
                "",
                f"## {program['label']}",
                "",
                f"Owner: `{program['owner']}`  ",
                f"Campaign: `{program['campaign']}`  ",
                f"Timing: `{program['timing_mode']}`",
                "",
            ]
        )
        for order, step in enumerate(program["steps"], start=1):
            resource_key = step.get("resource_key", "")
            if resource_key:
                path = inbound["resources"][resource_key]["path"]
            else:
                path = step["cta_path"]
            query = urlencode(
                {
                    "utm_source": "hubspot",
                    "utm_medium": "email",
                    "utm_campaign": program["campaign"],
                    "utm_content": step["id"],
                }
            )
            cta_url = f"{base_url}{path}?{query}"
            timing = step.get("send_on", step.get("delay_days", ""))
            email_rows.append(
                {
                    "niche": niche_key,
                    "program": program["label"],
                    "status": program["status"],
                    "owner": program["owner"],
                    "campaign": program["campaign"],
                    "timing_mode": program["timing_mode"],
                    "step_order": order,
                    "step_id": step["id"],
                    "send_on": step.get("send_on", ""),
                    "delay_days": step.get("delay_days", ""),
                    "intent": step["intent"],
                    "subject": step["subject"],
                    "body": step["body"],
                    "cta_label": step["cta_label"],
                    "cta_url": cta_url,
                    "resource_key": resource_key,
                }
            )
            timing_label = (
                f"Send on {timing}" if program["timing_mode"] == "fixed_dates" else f"Delay {timing} days"
            )
            lines.extend(
                [
                    f"### {order}. {step['subject']}",
                    "",
                    f"**Timing:** {timing_label}  ",
                    f"**Intent:** {step['intent']}",
                    "",
                    step["body"],
                    "",
                    f"**CTA:** [{step['cta_label']}]({cta_url})",
                    "",
                ]
            )

    _write_csv(
        output / "nurture-email-plan.csv",
        [
            "niche",
            "program",
            "status",
            "owner",
            "campaign",
            "timing_mode",
            "step_order",
            "step_id",
            "send_on",
            "delay_days",
            "intent",
            "subject",
            "body",
            "cta_label",
            "cta_url",
            "resource_key",
        ],
        email_rows,
    )
    lines.extend(
        [
            "## Activation Rule",
            "",
            "Keep every workflow and email in draft until the form, subscription state, routing, "
            "suppression, unsubscribe, active-deal removal, and end-to-end test all pass.",
            "",
        ]
    )
    (output / "nurture-copy-deck.md").write_text("\n".join(lines))
    return len(workflow_rows), len(nurture["programs"]), len(email_rows)


def _markdown_sections(path: Path) -> list[dict[str, Any]]:
    text = path.read_text()
    matches = list(re.finditer(r"^## (.+)$", text, flags=re.MULTILINE))
    sections: list[dict[str, Any]] = []
    for index, match in enumerate(matches):
        start = match.end()
        end = matches[index + 1].start() if index + 1 < len(matches) else len(text)
        content = text[start:end].strip()
        sections.append(
            {
                "heading": match.group(1).strip(),
                "content": content,
                "character_count": len(content),
            }
        )
    return sections


def _section_block_type(heading: str) -> str:
    normalized = heading.lower()
    if normalized == "page settings":
        return "page_settings"
    if normalized == "hero":
        return "hero"
    if normalized == "proof bar":
        return "stats_strip"
    if normalized == "faq":
        return "accordion"
    if "form" in normalized:
        return "form_embed"
    if normalized == "cta" or normalized.endswith(" cta") or normalized == "final cta":
        return "cta"
    return "rich_text"


def render_assets_and_pages(
    assets: dict[str, Any], inbound: dict[str, Any], output: Path
) -> tuple[int, int, int, int, int, int]:
    asset_rows = [dict(item) for item in assets["asset_library"]]
    for row in asset_rows:
        row["candidate_niches"] = ";".join(row.get("candidate_niches", []))
    _write_csv(
        output / "asset-library.csv",
        [
            "id",
            "kind",
            "source_page",
            "source_url",
            "current_filename",
            "current_alt",
            "content_summary",
            "candidate_niches",
            "contains_people",
            "contains_minors",
            "contains_customer_brand",
            "permission_status",
            "approval_evidence",
        ],
        asset_rows,
    )
    proof_rows = [dict(item) for item in assets["proof_records"]]
    _write_csv(
        output / "proof-permission-register.csv",
        [
            "id",
            "niche",
            "person",
            "role",
            "organization",
            "source_url",
            "permission_status",
            "approval_evidence",
        ],
        proof_rows,
    )

    pages: list[dict[str, Any]] = []
    commercial = assets["commercial_pages"]
    commercial_order = ["services"] + [
        key
        for key, _ in sorted(
            (
                (key, niche)
                for key, niche in inbound["niches"].items()
                if niche.get("status") in DEDICATED_STATUSES
            ),
            key=lambda item: item[1]["priority"],
        )
    ]
    for page_key in commercial_order:
        page = commercial[page_key]
        pages.append(
            {
                "page_key": page_key,
                "niche": page["niche"],
                "owner": page["owner"],
                "page_kind": "commercial",
                "path": page["path"],
                "source_file": page["source_file"],
                "status": page["status"],
                "approval_evidence": page.get("approval_evidence", ""),
                "slots": [dict(slot) for slot in page["slots"]],
            }
        )
    for resource_key, resource in inbound.get("resources", {}).items():
        headline = resource["headline"].rstrip(".")
        template = assets["resource_template"]
        override = assets["resource_overrides"][resource_key]
        slot_overrides = override.get("slots") or {}
        slots: list[dict[str, Any]] = []
        for source_slot in template["slots"]:
            slot = dict(source_slot)
            slot.update(slot_overrides.get(slot["id"]) or {})
            slot["brief"] = slot["brief"].format(headline=headline)
            slot["alt_text_draft"] = slot["alt_text_draft"].format(headline=headline)
            slots.append(slot)
        pages.append(
            {
                "page_key": f"resource:{resource_key}",
                "niche": resource["niche"],
                "owner": resource["owner"],
                "page_kind": "resource",
                "path": resource["path"],
                "source_file": resource["page_copy"],
                "status": override["status"],
                "approval_evidence": override.get("approval_evidence", ""),
                "slots": slots,
            }
        )

    queue_rows: list[dict[str, Any]] = []
    build_rows: list[dict[str, Any]] = []
    package_pages: list[dict[str, Any]] = []
    ready_pages = 0
    for page in pages:
        slots_by_id = {slot["id"]: slot for slot in page["slots"]}
        for slot in page["slots"]:
            queue_rows.append(
                {
                    "page_key": page["page_key"],
                    "niche": page["niche"],
                    "owner": page["owner"],
                    "page_kind": page["page_kind"],
                    "path": page["path"],
                    "slot": slot["id"],
                    "status": slot["status"],
                    "candidate_assets": ";".join(slot.get("candidate_assets", [])),
                    "proof_ids": ";".join(slot.get("proof_ids", [])),
                    "asset_file": slot.get("asset_file", ""),
                    "format": slot["format"],
                    "brief": slot["brief"],
                    "alt_text_draft": slot["alt_text_draft"],
                    "approval_gate": slot["approval_gate"],
                    "approval_evidence": slot.get("approval_evidence", ""),
                }
            )

        source_path = _repo_path(page["source_file"])
        sections = _markdown_sections(source_path)
        support_assigned = False
        inline_assigned = False
        package_sections: list[dict[str, Any]] = []
        for order, section in enumerate(sections, start=1):
            heading = section["heading"]
            normalized = heading.lower()
            block_type = _section_block_type(heading)
            asset_slot = ""
            if block_type == "hero":
                asset_slot = "hero"
            elif page["page_kind"] == "commercial" and "proof" in normalized:
                asset_slot = "proof"
            elif (
                page["page_kind"] == "commercial"
                and block_type == "rich_text"
                and not support_assigned
            ):
                asset_slot = "product_or_process"
                support_assigned = True
            elif page["page_kind"] == "resource" and block_type == "rich_text":
                tool_words = ("table", "worksheet", "calendar", "checklist", "timeline", "matrix")
                if not inline_assigned and any(word in normalized for word in tool_words):
                    asset_slot = "inline_tool"
                    inline_assigned = True
            approval_gate = slots_by_id.get(asset_slot, {}).get("approval_gate", "")
            row = {
                "page_key": page["page_key"],
                "niche": page["niche"],
                "owner": page["owner"],
                "page_kind": page["page_kind"],
                "path": page["path"],
                "source_file": page["source_file"],
                "section_order": order,
                "section_heading": heading,
                "block_type": block_type,
                "asset_slot": asset_slot,
                "approval_gate": approval_gate,
                "character_count": section["character_count"],
                "publish_state": "Draft",
            }
            build_rows.append(row)
            package_sections.append(dict(row))
        if page["page_kind"] == "resource" and not inline_assigned:
            for row in build_rows:
                if row["page_key"] == page["page_key"] and row["block_type"] == "rich_text":
                    row["asset_slot"] = "inline_tool"
                    row["approval_gate"] = slots_by_id["inline_tool"]["approval_gate"]
                    for package_row in package_sections:
                        if package_row["section_order"] == row["section_order"]:
                            package_row.update(
                                {
                                    "asset_slot": "inline_tool",
                                    "approval_gate": slots_by_id["inline_tool"]["approval_gate"],
                                }
                            )
                            break
                    break

        blockers = [
            f"asset slot {slot['id']} is {slot['status']}"
            for slot in page["slots"]
            if slot["status"] != "approved"
        ]
        if page["status"] != "approved":
            blockers.insert(0, f"page package status is {page['status']}")
        publish_ready = not blockers
        if publish_ready:
            ready_pages += 1
        package_pages.append(
            {
                **page,
                "sections": package_sections,
                "approved_slot_count": sum(
                    slot["status"] == "approved" for slot in page["slots"]
                ),
                "slot_count": len(page["slots"]),
                "publish_ready": publish_ready,
                "blockers": blockers,
            }
        )

    _write_csv(
        output / "asset-production-queue.csv",
        [
            "page_key",
            "niche",
            "owner",
            "page_kind",
            "path",
            "slot",
            "status",
            "candidate_assets",
            "proof_ids",
            "asset_file",
            "format",
            "brief",
            "alt_text_draft",
            "approval_gate",
            "approval_evidence",
        ],
        queue_rows,
    )
    _write_csv(
        output / "squarespace-page-build.csv",
        [
            "page_key",
            "niche",
            "owner",
            "page_kind",
            "path",
            "source_file",
            "section_order",
            "section_heading",
            "block_type",
            "asset_slot",
            "approval_gate",
            "character_count",
            "publish_state",
        ],
        build_rows,
    )
    (output / "squarespace-page-packages.json").write_text(
        json.dumps(
            {
                "review_only": True,
                "warning": "Candidate and brief-ready assets are not approved for public use.",
                "pages": package_pages,
            },
            indent=2,
        )
        + "\n"
    )

    lines = [
        "# Generated Asset And Page Readiness",
        "",
        "> Candidate material is not permission. A page is ready only when the package and every slot are approved with evidence.",
        "",
        f"- Pages: **{len(pages)}**",
        f"- Asset slots: **{len(queue_rows)}**",
        f"- Approved slots: **{sum(row['status'] == 'approved' for row in queue_rows)}**",
        f"- Publish-ready pages: **{ready_pages}**",
        "",
        "| Page | Owner | Kind | Approved slots | Total slots | Result |",
        "|---|---|---|---:|---:|---|",
    ]
    for page in package_pages:
        result = "READY" if page["publish_ready"] else "BLOCKED"
        lines.append(
            f"| `{page['path']}` | {page['owner']} | {page['page_kind']} | {page['approved_slot_count']} | "
            f"{page['slot_count']} | {result} |"
        )
    lines.extend(
        [
            "",
            "## Permission Queue",
            "",
            "Current public gallery images and testimonials remain `confirm_reuse` until written approval evidence is recorded.",
            "",
            "## Production Rule",
            "",
            "Use real CA work for customer proof. Editorial graphics may support resources, but cannot impersonate customer results or use generated customer logos.",
            "",
        ]
    )
    (output / "asset-readiness.md").write_text("\n".join(lines))
    return (
        len(asset_rows),
        len(proof_rows),
        len(pages),
        len(queue_rows),
        len(build_rows),
        ready_pages,
    )


def render_measurement(config: dict[str, Any], output: Path) -> tuple[int, int, int, int]:
    event_rows: list[dict[str, Any]] = []
    for event_type, events in (
        ("client", config["client_events"]),
        ("server", config["server_events"]),
    ):
        for event_name, event in events.items():
            event_rows.append(
                {
                    "event_name": event_name,
                    "event_type": event_type,
                    "status": event["status"],
                    "owner": event["owner"],
                    "source_system": event.get(
                        "source_system", "squarespace-attribution.js"
                    ),
                    "trigger": event["trigger"],
                    "parameters": ";".join(event["parameters"]),
                    "key_event": event["key_event"],
                    "conversion_level": event["conversion_level"],
                }
            )
    _write_csv(
        output / "ga4-event-plan.csv",
        [
            "event_name",
            "event_type",
            "status",
            "owner",
            "source_system",
            "trigger",
            "parameters",
            "key_event",
            "conversion_level",
        ],
        event_rows,
    )

    variable_rows = [
        {
            "variable_name": item["name"],
            "data_layer_key": item["key"],
            "variable_type": "Data Layer Variable",
            "data_type": item["type"],
            "version": 2,
            "status": "draft",
        }
        for item in config["data_layer_variables"]
    ]
    _write_csv(
        output / "gtm-variable-plan.csv",
        [
            "variable_name",
            "data_layer_key",
            "variable_type",
            "data_type",
            "version",
            "status",
        ],
        variable_rows,
    )

    policy = config["google_ads_conversion_policy"]
    observations = set(policy.get("observation_only", []))
    never = set(policy.get("never_import", []))
    import_rows: list[dict[str, Any]] = []
    for row in event_rows:
        event_name = row["event_name"]
        if event_name == policy["bidding_primary"]:
            ads_role = "primary_bidding"
        elif event_name in observations:
            ads_role = "observation_only"
        elif event_name in never:
            ads_role = "never_import"
        else:
            ads_role = "not_planned"
        import_rows.append(
            {
                "event_name": event_name,
                "event_type": row["event_type"],
                "source_system": row["source_system"],
                "ads_role": ads_role,
                "status": "draft",
                "required_identifier": (
                    "stable CRM event id plus eligible click identifier"
                    if row["event_type"] == "server"
                    else "not applicable"
                ),
                "activation_rule": " | ".join(policy["enable_only_after"]),
            }
        )
    _write_csv(
        output / "google-ads-conversion-import-plan.csv",
        [
            "event_name",
            "event_type",
            "source_system",
            "ads_role",
            "status",
            "required_identifier",
            "activation_rule",
        ],
        import_rows,
    )

    gates = config["activation_gates"]
    complete_gates = sum(gate.get("complete") is True for gate in gates)
    deployment = {
        "review_only": True,
        "runtime": "pillars/3-online-presence/inbound/implementation/squarespace-attribution.js",
        "client_event_count": len(config["client_events"]),
        "server_event_count": len(config["server_events"]),
        "data_layer_variables": config["data_layer_variables"],
        "client_events": config["client_events"],
        "server_events": config["server_events"],
        "activation_gates": gates,
        "google_ads_conversion_policy": policy,
        "forbidden_analytics_parameters": config["forbidden_analytics_parameters"],
    }
    (output / "measurement-deployment.json").write_text(
        json.dumps(deployment, indent=2) + "\n"
    )
    lines = [
        "# Generated Measurement Readiness",
        "",
        "> Review-only. No GTM tag, GA4 key event, or Google Ads conversion is activated by this package.",
        "",
        f"- Browser events: **{len(config['client_events'])}**",
        f"- CRM/revenue events: **{len(config['server_events'])}**",
        f"- GTM data-layer variables: **{len(variable_rows)}**",
        f"- Activation gates complete: **{complete_gates}/{len(gates)}**",
        "",
        "## Conversion Hierarchy",
        "",
        "- Primary bidding conversion: `qualified_inbound_lead` after human qualification.",
        "- Secondary browser conversion: `inquiry_submit` only after persisted submission.",
        "- Diagnostic only: `form_submit_attempt`; never use it for bidding.",
        "- Revenue: `inbound_revenue` only after QuickBooks reconciliation.",
        "",
        "## Open Activation Gates",
        "",
    ]
    for gate in gates:
        if gate.get("complete") is not True:
            lines.append(f"- [ ] `{gate['id']}` - owner: {gate['owner']}")
    lines.extend(
        [
            "",
            "## Runtime Contract",
            "",
            "The validator requires exact parity between configured browser events and literal `track()` calls in the attribution runtime. It also rejects forbidden contact PII from every event parameter list.",
            "",
        ]
    )
    (output / "measurement-readiness.md").write_text("\n".join(lines))
    return len(event_rows), len(variable_rows), len(gates), complete_gates


def _hubspot_property_payload(config: dict[str, Any], prop: dict[str, Any]) -> dict[str, Any]:
    return {
        "groupName": config["groups"][prop["object_type"]]["name"],
        "name": prop["name"],
        "label": prop["label"],
        "type": prop["type"],
        "fieldType": prop["field_type"],
        "description": prop["description"],
        "formField": prop.get("form_field", False),
        "hidden": False,
        "displayOrder": -1,
        "hasUniqueValue": False,
        "options": _hubspot_options(config, prop),
    }


def _hubspot_property_update_payload(
    config: dict[str, Any], prop: dict[str, Any]
) -> dict[str, Any]:
    payload = _hubspot_property_payload(config, prop)
    payload.pop("name", None)
    payload.pop("type", None)
    payload.pop("hasUniqueValue", None)
    return payload


def _hubspot_property_drift(
    config: dict[str, Any], prop: dict[str, Any], existing: dict[str, Any]
) -> tuple[list[str], list[str]]:
    incompatible: list[str] = []
    drift: list[str] = []
    if existing.get("type") != prop.get("type"):
        incompatible.append("type")
    desired = _hubspot_property_update_payload(config, prop)
    for key in ("label", "description", "groupName", "fieldType", "formField"):
        if existing.get(key) != desired.get(key):
            drift.append(key)
    desired_options = {
        item["value"]: (item["label"], item.get("hidden", False))
        for item in desired.get("options", [])
    }
    existing_options = {
        item["value"]: (item["label"], item.get("hidden", False))
        for item in existing.get("options", [])
    }
    if desired_options != existing_options:
        drift.append("options")
    return incompatible, drift


def cmd_hubspot_apply(args: argparse.Namespace) -> int:
    from dotenv import load_dotenv
    import os
    import requests

    config = load_config(Path(args.hubspot))
    errors = validate_hubspot_config(config)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    if args.apply and args.confirm != "APPLY_HUBSPOT_PROPERTIES":
        print("ERROR: --apply requires --confirm APPLY_HUBSPOT_PROPERTIES", file=sys.stderr)
        return 1

    load_dotenv(ROOT / ".env")
    token = os.getenv("HUBSPOT_PRIVATE_APP_TOKEN", "").strip()
    if not token:
        print("ERROR: HUBSPOT_PRIVATE_APP_TOKEN is not configured", file=sys.stderr)
        return 1

    objects = sorted(HUBSPOT_OBJECTS) if args.object == "all" else [args.object]
    session = requests.Session()
    session.headers.update({"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    base = "https://api.hubapi.com"
    blocked = 0
    created = 0
    updated = 0
    existing = 0

    for object_type in objects:
        props_response = session.get(f"{base}/crm/v3/properties/{object_type}", timeout=30)
        groups_response = session.get(f"{base}/crm/v3/properties/{object_type}/groups", timeout=30)
        if not props_response.ok or not groups_response.ok:
            status = props_response.status_code if not props_response.ok else groups_response.status_code
            print(f"BLOCKED {object_type}: HubSpot returned {status}; required object scope is missing")
            blocked += 1
            continue

        existing_properties = {
            prop["name"]: prop for prop in props_response.json().get("results", [])
        }
        existing_groups = {
            group["name"]: group for group in groups_response.json().get("results", [])
        }
        group = config["groups"][object_type]
        object_properties = [
            prop for prop in config["properties"] if prop["object_type"] == object_type
        ]
        missing = [prop for prop in object_properties if prop["name"] not in existing_properties]
        matching = [prop for prop in object_properties if prop["name"] in existing_properties]
        drifted: list[tuple[dict[str, Any], list[str]]] = []
        incompatible: list[tuple[dict[str, Any], list[str]]] = []
        for prop in matching:
            bad, drift = _hubspot_property_drift(config, prop, existing_properties[prop["name"]])
            if bad:
                incompatible.append((prop, bad))
            elif drift:
                drifted.append((prop, drift))
        print(
            f"{object_type}: group={'existing' if group['name'] in existing_groups else 'missing'}, "
            f"properties={len(matching)} existing/{len(missing)} missing/{len(drifted)} updates"
        )
        existing += len(matching)
        for prop, fields in incompatible:
            print(
                f"ERROR: incompatible existing property {object_type}.{prop['name']} "
                f"({', '.join(fields)})",
                file=sys.stderr,
            )
        if incompatible:
            return 1
        if not args.apply:
            for prop in missing:
                print(f"  PLAN create {object_type}.{prop['name']}")
            for prop, fields in drifted:
                print(f"  PLAN update {object_type}.{prop['name']} ({', '.join(fields)})")
            continue

        if group["name"] not in existing_groups:
            response = session.post(
                f"{base}/crm/v3/properties/{object_type}/groups",
                json={"name": group["name"], "label": group["label"], "displayOrder": -1},
                timeout=30,
            )
            if not response.ok:
                print(
                    f"ERROR: could not create {object_type} group ({response.status_code})",
                    file=sys.stderr,
                )
                return 1
            print(f"  CREATED group {object_type}.{group['name']}")

        for prop in missing:
            response = session.post(
                f"{base}/crm/v3/properties/{object_type}",
                json=_hubspot_property_payload(config, prop),
                timeout=30,
            )
            if not response.ok:
                message = ""
                try:
                    message = response.json().get("message", "")
                except ValueError:
                    message = response.text[:300]
                print(
                    f"ERROR: could not create {object_type}.{prop['name']} "
                    f"({response.status_code}): {message}",
                    file=sys.stderr,
                )
                return 1
            created += 1
            print(f"  CREATED {object_type}.{prop['name']}")

        for prop, fields in drifted:
            response = session.patch(
                f"{base}/crm/v3/properties/{object_type}/{prop['name']}",
                json=_hubspot_property_update_payload(config, prop),
                timeout=30,
            )
            if not response.ok:
                message = ""
                try:
                    message = response.json().get("message", "")
                except ValueError:
                    message = response.text[:300]
                print(
                    f"ERROR: could not update {object_type}.{prop['name']} "
                    f"({response.status_code}): {message}",
                    file=sys.stderr,
                )
                return 1
            updated += 1
            print(f"  UPDATED {object_type}.{prop['name']} ({', '.join(fields)})")

    action = "applied" if args.apply else "planned"
    print(
        f"HubSpot {action}: {created} created, {updated} updated, "
        f"{existing} already present, {blocked} blocked objects"
    )
    return 2 if blocked else 0


def render_readiness(config: dict[str, Any], output: Path) -> int:
    data = audit_data(config)
    lines = [
        "# Generated Inbound Readiness",
        "",
        "> Generated from `config/ca_inbound.yaml`. Do not mark a gate complete without evidence.",
        "",
        "| Niche | Channel | Status | Open gates |",
        "|---|---|---:|---:|",
    ]
    count = 0
    for niche in data["niches"].values():
        for channel, result in niche["channels"].items():
            status = "READY" if result["ready"] else "BLOCKED"
            lines.append(f"| {niche['label']} | {channel} | {status} | {result['blocker_count']} |")
            count += 1
    lines.extend(["", "## Open gates", ""])
    for niche in data["niches"].values():
        lines.append(f"### {niche['label']}")
        lines.append("")
        seen: set[str] = set()
        for channel, result in niche["channels"].items():
            for blocker in result["blockers"]:
                key = f"{blocker['source']}:{blocker['name']}"
                if key in seen:
                    continue
                seen.add(key)
                lines.append(
                    f"- [ ] `{blocker['name']}` - owner: {blocker['owner'] or 'unassigned'}; affects: "
                    + ", ".join(
                        candidate
                        for candidate, channel_result in niche["channels"].items()
                        if any(
                            item["name"] == blocker["name"] and item["source"] == blocker["source"]
                            for item in channel_result["blockers"]
                        )
                    )
                )
        lines.append("")
    output.mkdir(parents=True, exist_ok=True)
    (output / "launch-readiness.md").write_text("\n".join(lines) + "\n")
    (output / "launch-readiness.json").write_text(json.dumps(data, indent=2) + "\n")
    return count


def cmd_validate(args: argparse.Namespace) -> int:
    config = load_config(Path(args.config))
    hubspot = load_config(Path(args.hubspot))
    partners = load_config(Path(args.partners))
    nurture = load_config(Path(args.nurture))
    assets = load_config(Path(args.assets))
    measurement = load_config(Path(args.measurement))
    schema = json.loads(Path(args.schema).read_text())
    errors = (
        validate_config(config)
        + validate_hubspot_config(hubspot)
        + validate_intake_schema(schema, hubspot)
        + validate_partner_config(partners, config)
        + validate_nurture_config(nurture, config)
        + validate_asset_config(assets, config)
        + validate_measurement_config(measurement)
    )
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    print(f"valid: {args.config}")
    print(f"valid: {args.hubspot}")
    print(f"valid: {args.partners}")
    print(f"valid: {args.nurture}")
    print(f"valid: {args.assets}")
    print(f"valid: {args.measurement}")
    print(f"valid: {args.schema}")
    return 0


def cmd_audit(args: argparse.Namespace) -> int:
    config = load_config(Path(args.config))
    errors = validate_config(config)
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    if args.niche and args.niche not in config["niches"]:
        print(f"unknown niche {args.niche!r}", file=sys.stderr)
        return 1
    data = audit_data(config, args.niche, args.channel)
    if args.json:
        print(json.dumps(data, indent=2))
    else:
        _print_audit(data, args.verbose)
    blocked = any(
        not result["ready"]
        for niche in data["niches"].values()
        for result in niche["channels"].values()
    )
    return 2 if blocked else 0


def cmd_render(args: argparse.Namespace) -> int:
    config = load_config(Path(args.config))
    hubspot = load_config(Path(args.hubspot))
    partners = load_config(Path(args.partners))
    nurture = load_config(Path(args.nurture))
    assets = load_config(Path(args.assets))
    measurement = load_config(Path(args.measurement))
    schema = json.loads(Path(args.schema).read_text())
    errors = (
        validate_config(config)
        + validate_hubspot_config(hubspot)
        + validate_intake_schema(schema, hubspot)
        + validate_partner_config(partners, config)
        + validate_nurture_config(nurture, config)
        + validate_asset_config(assets, config)
        + validate_measurement_config(measurement)
    )
    if errors:
        for error in errors:
            print(f"ERROR: {error}", file=sys.stderr)
        return 1
    output = Path(args.output)
    metadata_count = render_metadata(config, output)
    form_count = render_form_map(config, Path(args.schema), output)
    ads_count, negative_count = render_ads(config, output)
    hubspot_count = render_hubspot(hubspot, output)
    resource_count, link_count, schema_count = render_resources(config, output)
    partner_count, p1_partner_count = render_partners(partners, config, output)
    workflow_count, nurture_program_count, nurture_email_count = render_nurture(
        nurture, config, output
    )
    (
        asset_count,
        proof_count,
        page_package_count,
        asset_slot_count,
        page_section_count,
        ready_page_count,
    ) = render_assets_and_pages(assets, config, output)
    (
        measurement_event_count,
        gtm_variable_count,
        measurement_gate_count,
        complete_measurement_gate_count,
    ) = render_measurement(measurement, output)
    readiness_count = render_readiness(config, output)
    print(f"rendered to {output}")
    print(f"  page metadata: {metadata_count}")
    print(f"  form mappings: {form_count}")
    print(f"  ads proposal rows: {ads_count}")
    print(f"  negative keyword rows: {negative_count}")
    print(f"  HubSpot property rows: {hubspot_count}")
    print(f"  resource metadata rows: {resource_count}")
    print(f"  internal link rows: {link_count}")
    print(f"  structured data entries: {schema_count}")
    print(f"  partnership targets: {partner_count} ({p1_partner_count} P1)")
    print(f"  HubSpot workflow drafts: {workflow_count}")
    print(f"  nurture programs: {nurture_program_count}")
    print(f"  nurture email drafts: {nurture_email_count}")
    print(f"  current-site asset candidates: {asset_count}")
    print(f"  proof permission records: {proof_count}")
    print(f"  page production packages: {page_package_count}")
    print(f"  asset production slots: {asset_slot_count}")
    print(f"  Squarespace section rows: {page_section_count}")
    print(f"  publish-ready page packages: {ready_page_count}")
    print(f"  measurement events: {measurement_event_count}")
    print(f"  GTM variables: {gtm_variable_count}")
    print(
        f"  measurement activation gates: {complete_measurement_gate_count}/"
        f"{measurement_gate_count} complete"
    )
    print(f"  readiness checks: {readiness_count}")
    print("all ad entities remain Paused; no external systems were changed")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="CA inbound implementation generator and fail-closed launch preflight"
    )
    parser.add_argument("--config", default=str(DEFAULT_CONFIG))
    parser.add_argument("--hubspot", default=str(DEFAULT_HUBSPOT))
    parser.add_argument("--partners", default=str(DEFAULT_PARTNERS))
    parser.add_argument("--nurture", default=str(DEFAULT_NURTURE))
    parser.add_argument("--assets", default=str(DEFAULT_ASSETS))
    parser.add_argument("--measurement", default=str(DEFAULT_MEASUREMENT))
    parser.add_argument("--schema", default=str(DEFAULT_SCHEMA))
    sub = parser.add_subparsers(dest="command", required=True)

    validate = sub.add_parser("validate", help="validate machine-readable strategy and gates")
    validate.set_defaults(func=cmd_validate)

    audit = sub.add_parser("audit", help="show launch readiness; exits 2 while blocked")
    audit.add_argument("--niche")
    audit.add_argument("--channel", choices=CHANNELS)
    audit.add_argument("--json", action="store_true")
    audit.add_argument("--verbose", action="store_true")
    audit.set_defaults(func=cmd_audit)

    render = sub.add_parser("render", help="render paused/review-only implementation files")
    render.add_argument("--output", default=str(DEFAULT_OUTPUT))
    render.set_defaults(func=cmd_render)

    hubspot = sub.add_parser(
        "hubspot-apply",
        help="inspect or idempotently create HubSpot property groups/properties",
    )
    hubspot.add_argument("--object", choices=["all", *sorted(HUBSPOT_OBJECTS)], default="all")
    hubspot.add_argument("--apply", action="store_true")
    hubspot.add_argument("--confirm")
    hubspot.set_defaults(func=cmd_hubspot_apply)
    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    sys.exit(args.func(args))


if __name__ == "__main__":
    main()
