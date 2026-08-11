import copy
import csv
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location("ca_inbound", ROOT / "scripts" / "ca_inbound.py")
ca_inbound = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = ca_inbound
SPEC.loader.exec_module(ca_inbound)


class InboundConfigTests(unittest.TestCase):
    def setUp(self):
        self.config = ca_inbound.load_config()
        self.hubspot = ca_inbound.load_config(ca_inbound.DEFAULT_HUBSPOT)
        self.partners = ca_inbound.load_config(ca_inbound.DEFAULT_PARTNERS)
        self.nurture = ca_inbound.load_config(ca_inbound.DEFAULT_NURTURE)
        self.assets = ca_inbound.load_config(ca_inbound.DEFAULT_ASSETS)
        self.measurement = ca_inbound.load_config(ca_inbound.DEFAULT_MEASUREMENT)
        self.schema = json.loads(ca_inbound.DEFAULT_SCHEMA.read_text())

    def test_repository_config_is_valid(self):
        self.assertEqual([], ca_inbound.validate_config(self.config))
        self.assertEqual([], ca_inbound.validate_hubspot_config(self.hubspot))
        self.assertEqual([], ca_inbound.validate_intake_schema(self.schema, self.hubspot))
        self.assertEqual([], ca_inbound.validate_partner_config(self.partners, self.config))
        self.assertEqual([], ca_inbound.validate_nurture_config(self.nurture, self.config))
        self.assertEqual([], ca_inbound.validate_asset_config(self.assets, self.config))
        self.assertEqual([], ca_inbound.validate_measurement_config(self.measurement))

    def test_hubspot_boolean_payload_has_required_options(self):
        prop = next(
            item for item in self.hubspot["properties"] if item["name"] == "ca_marketing_consent"
        )
        payload = ca_inbound._hubspot_property_payload(self.hubspot, prop)
        self.assertEqual({"true", "false"}, {item["value"] for item in payload["options"]})

    def test_form_map_uses_native_identity_and_known_custom_properties(self):
        with tempfile.TemporaryDirectory() as tmp:
            count = ca_inbound.render_form_map(
                self.config, ca_inbound.DEFAULT_SCHEMA, Path(tmp)
            )
            self.assertEqual(34, count)
            with (Path(tmp) / "form-field-map.csv").open(newline="") as handle:
                rows = list(csv.DictReader(handle))
            mapping = {row["form_field"]: row["crm_property"] for row in rows}
            self.assertEqual("firstname", mapping["first_name"])
            self.assertEqual("email", mapping["work_email"])
            self.assertEqual("company", mapping["organization"])
            self.assertEqual("ca_primary_niche", mapping["niche"])
            self.assertEqual("ca_landing_page", mapping["landing_page"])

    def test_hidden_attribution_properties_are_available_to_forms(self):
        properties = {
            prop["name"]: prop
            for prop in self.hubspot["properties"]
            if prop["object_type"] == "contacts"
        }
        for name in self.schema["hidden_attribution_property_map"].values():
            self.assertTrue(properties[name]["form_field"], name)

    def test_hubspot_drift_detects_form_availability_without_type_change(self):
        prop = next(
            item for item in self.hubspot["properties"] if item["name"] == "ca_first_touch_source"
        )
        existing = ca_inbound._hubspot_property_payload(self.hubspot, prop)
        existing["formField"] = False
        incompatible, drift = ca_inbound._hubspot_property_drift(self.hubspot, prop, existing)
        self.assertEqual([], incompatible)
        self.assertEqual(["formField"], drift)

    def test_current_camp_paid_launch_fails_closed(self):
        gates = ca_inbound.readiness(self.config, "camp", "paid")
        blockers = {gate.name for gate in gates if not gate.complete}
        self.assertIn("public_release_approved", blockers)
        self.assertIn("budget_approved", blockers)
        self.assertIn("qualified_lead_conversion_tested", blockers)
        self.assertIn("paid_geography_confirmed", blockers)

    def test_complete_gate_requires_evidence(self):
        modified = copy.deepcopy(self.config)
        modified["shared_gates"]["service_area_confirmed"]["complete"] = True
        errors = ca_inbound.validate_config(modified)
        self.assertTrue(any("complete but has no evidence" in error for error in errors))

    def test_public_approval_guardrail_cannot_be_removed(self):
        modified = copy.deepcopy(self.config)
        modified["guardrails"]["public_actions_require_approval"] = False
        errors = ca_inbound.validate_config(modified)
        self.assertIn("public_actions_require_approval must remain true", errors)

    def test_ad_copy_character_limits_are_enforced(self):
        modified = copy.deepcopy(self.config)
        modified["niches"]["camp"]["ads"]["headlines"][0] = "x" * 31
        errors = ca_inbound.validate_config(modified)
        self.assertTrue(any("headline exceeds 30 characters" in error for error in errors))

    def test_page_copy_metadata_drift_is_rejected(self):
        modified = copy.deepcopy(self.config)
        modified["niches"]["camp"]["title"] = "A Different Title"
        errors = ca_inbound.validate_config(modified)
        self.assertTrue(any("page_copy SEO title mismatch" in error for error in errors))

    def test_every_dedicated_niche_has_a_resource(self):
        dedicated = {
            key
            for key, niche in self.config["niches"].items()
            if niche["status"] in ca_inbound.DEDICATED_STATUSES
        }
        covered = {resource["niche"] for resource in self.config["resources"].values()}
        self.assertEqual(dedicated, covered)
        self.assertEqual(8, len(self.config["resources"]))

    def test_resource_manifests_include_links_and_schema(self):
        with tempfile.TemporaryDirectory() as tmp:
            resource_count, link_count, schema_count = ca_inbound.render_resources(
                self.config, Path(tmp)
            )
            self.assertEqual(8, resource_count)
            self.assertGreaterEqual(link_count, 24)
            self.assertEqual(8, schema_count)
            data = json.loads((Path(tmp) / "structured-data-plan.json").read_text())
            self.assertEqual(8, len(data["resources"]))
            for item in data["resources"]:
                self.assertEqual("Article", item["article"]["@type"])
                self.assertEqual("BreadcrumbList", item["breadcrumb"]["@type"])
                self.assertEqual(3, len(item["breadcrumb"]["itemListElement"]))

    def test_resource_parent_drift_is_rejected(self):
        modified = copy.deepcopy(self.config)
        modified["resources"]["law_firm_merch_calendar"]["parent_path"] = "/online-stores"
        errors = ca_inbound.validate_config(modified)
        self.assertTrue(any("parent_path must match its niche page" in error for error in errors))

    def test_partner_registry_is_draft_only_and_resource_backed(self):
        self.assertEqual(20, len(self.partners["targets"]))
        self.assertTrue(self.partners["guardrails"]["draft_only"])
        self.assertTrue(all(target["status"] == "research" for target in self.partners["targets"]))
        self.assertTrue(
            all(target["resource_key"] in self.config["resources"] for target in self.partners["targets"])
        )

    def test_partner_render_has_expected_priority_queue(self):
        with tempfile.TemporaryDirectory() as tmp:
            count, p1_count = ca_inbound.render_partners(
                self.partners, self.config, Path(tmp)
            )
            self.assertEqual(20, count)
            self.assertEqual(10, p1_count)
            with (Path(tmp) / "partnership-tracker.csv").open(newline="") as handle:
                rows = list(csv.DictReader(handle))
            self.assertEqual(20, len(rows))
            self.assertTrue(all(row["status"] == "research" for row in rows))
            self.assertTrue(all(row["resource_path"].startswith("/resources/") for row in rows))

    def test_partner_paid_placement_guardrail_cannot_be_removed(self):
        modified = copy.deepcopy(self.partners)
        modified["guardrails"]["no_paid_placement_without_attribution_plan"] = False
        errors = ca_inbound.validate_partner_config(modified, self.config)
        self.assertTrue(any("must remain true" in error for error in errors))

    def test_nurture_plan_covers_every_dedicated_niche_and_stays_draft(self):
        dedicated = {
            key
            for key, niche in self.config["niches"].items()
            if niche["status"] in ca_inbound.DEDICATED_STATUSES
        }
        self.assertEqual(dedicated, set(self.nurture["programs"]))
        self.assertTrue(
            all(program["status"] == "draft" for program in self.nurture["programs"].values())
        )
        self.assertEqual(
            28,
            sum(len(program["steps"]) for program in self.nurture["programs"].values()),
        )

    def test_nurture_render_has_workflows_and_tagged_email_links(self):
        with tempfile.TemporaryDirectory() as tmp:
            workflow_count, program_count, email_count = ca_inbound.render_nurture(
                self.nurture, self.config, Path(tmp)
            )
            self.assertEqual(5, workflow_count)
            self.assertEqual(7, program_count)
            self.assertEqual(28, email_count)
            with (Path(tmp) / "nurture-email-plan.csv").open(newline="") as handle:
                rows = list(csv.DictReader(handle))
            self.assertTrue(all(row["status"] == "draft" for row in rows))
            self.assertTrue(all("utm_medium=email" in row["cta_url"] for row in rows))

    def test_nurture_consent_guardrail_cannot_be_removed(self):
        modified = copy.deepcopy(self.nurture)
        modified["guardrails"]["explicit_marketing_consent_required"] = False
        errors = ca_inbound.validate_nurture_config(modified, self.config)
        self.assertTrue(any("must remain true" in error for error in errors))

    def test_asset_plan_covers_all_commercial_and_resource_pages(self):
        dedicated = {
            key
            for key, niche in self.config["niches"].items()
            if niche["status"] in ca_inbound.DEDICATED_STATUSES
        }
        self.assertEqual(dedicated | {"services"}, set(self.assets["commercial_pages"]))
        self.assertEqual(8, len(self.config["resources"]))
        self.assertEqual(
            ca_inbound.REQUIRED_RESOURCE_ASSET_SLOTS,
            {slot["id"] for slot in self.assets["resource_template"]["slots"]},
        )

    def test_public_asset_cannot_be_approved_without_permission_evidence(self):
        modified = copy.deepcopy(self.assets)
        modified["asset_library"][0]["permission_status"] = "approved"
        errors = ca_inbound.validate_asset_config(modified, self.config)
        self.assertTrue(any("approved without evidence" in error for error in errors))

    def test_asset_render_has_complete_page_packages_and_no_false_ready_pages(self):
        with tempfile.TemporaryDirectory() as tmp:
            counts = ca_inbound.render_assets_and_pages(
                self.assets, self.config, Path(tmp)
            )
            self.assertEqual((7, 5, 16, 56, 177, 0), counts)
            data = json.loads((Path(tmp) / "squarespace-page-packages.json").read_text())
            self.assertEqual(16, len(data["pages"]))
            self.assertFalse(any(page["publish_ready"] for page in data["pages"]))
            self.assertTrue(all(page["blockers"] for page in data["pages"]))

    def test_squarespace_build_maps_hero_proof_form_and_resource_tool(self):
        with tempfile.TemporaryDirectory() as tmp:
            ca_inbound.render_assets_and_pages(self.assets, self.config, Path(tmp))
            with (Path(tmp) / "squarespace-page-build.csv").open(newline="") as handle:
                rows = list(csv.DictReader(handle))
            camp = [row for row in rows if row["page_key"] == "camp"]
            self.assertTrue(any(row["block_type"] == "hero" and row["asset_slot"] == "hero" for row in camp))
            self.assertTrue(any(row["block_type"] == "accordion" for row in camp))
            self.assertTrue(any(row["block_type"] == "form_embed" for row in camp))
            self.assertTrue(any(row["asset_slot"] == "proof" for row in camp))
            resources = [row for row in rows if row["page_kind"] == "resource"]
            resource_keys = {row["page_key"] for row in resources}
            mapped = {row["page_key"] for row in resources if row["asset_slot"] == "inline_tool"}
            self.assertEqual(resource_keys, mapped)

    def test_measurement_runtime_and_config_have_exact_event_parity(self):
        runtime = (
            ca_inbound.ROOT
            / "pillars"
            / "3-online-presence"
            / "inbound"
            / "implementation"
            / "squarespace-attribution.js"
        ).read_text()
        emitted = set(ca_inbound.re.findall(r'track\("([a-z0-9_]+)"', runtime))
        self.assertEqual(set(self.measurement["client_events"]), emitted)

    def test_measurement_events_exclude_forbidden_contact_pii(self):
        forbidden = set(self.measurement["forbidden_analytics_parameters"])
        events = {
            **self.measurement["client_events"],
            **self.measurement["server_events"],
        }
        for name, event in events.items():
            self.assertFalse(set(event["parameters"]) & forbidden, name)

    def test_measurement_render_has_expected_activation_contract(self):
        with tempfile.TemporaryDirectory() as tmp:
            counts = ca_inbound.render_measurement(self.measurement, Path(tmp))
            self.assertEqual((15, 9, 10, 0), counts)
            with (Path(tmp) / "google-ads-conversion-import-plan.csv").open(newline="") as handle:
                rows = {row["event_name"]: row for row in csv.DictReader(handle)}
            self.assertEqual("primary_bidding", rows["qualified_inbound_lead"]["ads_role"])
            self.assertEqual("observation_only", rows["inquiry_submit"]["ads_role"])
            self.assertEqual("never_import", rows["form_submit_attempt"]["ads_role"])

    def test_measurement_primary_conversion_guardrail_cannot_be_removed(self):
        modified = copy.deepcopy(self.measurement)
        modified["google_ads_conversion_policy"]["bidding_primary"] = "inquiry_submit"
        errors = ca_inbound.validate_measurement_config(modified)
        self.assertTrue(any("must remain qualified_inbound_lead" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
