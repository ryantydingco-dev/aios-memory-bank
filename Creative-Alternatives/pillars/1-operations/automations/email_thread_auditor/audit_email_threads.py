#!/usr/bin/env python3
"""Audit saved email/order-thread evidence for backend workflow coverage."""

from __future__ import annotations

import argparse
import csv
from dataclasses import dataclass
from datetime import date
from email import policy
from email.parser import BytesParser
from pathlib import Path
import re


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_EVIDENCE_ROOT = WORKSPACE_ROOT / "context/import/backend-audit"
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"

TEXT_SUFFIXES = {".txt", ".md", ".eml", ".html", ".htm", ".csv"}
IGNORED_NAMES = {"readme.md", ".ds_store", "manifest.csv"}


@dataclass(frozen=True)
class Signal:
    key: str
    label: str
    patterns: tuple[str, ...]
    required: bool
    why_it_matters: str
    next_step: str


SIGNALS = [
    Signal(
        key="customer_request",
        label="Customer request",
        patterns=(
            r"\blooking for\b",
            r"\bcan you\b",
            r"\bwe need\b",
            r"\bneed\b",
            r"\bquote\b",
            r"\bestimate\b",
            r"\border\b",
            r"\binterested in\b",
        ),
        required=True,
        why_it_matters="Shows what the customer actually asked for.",
        next_step="Save the original request thread, call note, or intake summary.",
    ),
    Signal(
        key="product_details",
        label="Product details",
        patterns=(
            r"\bsku\b",
            r"\bitem\b",
            r"\bproduct\b",
            r"\bshirt\b",
            r"\bt[- ]?shirt\b",
            r"\bpolo\b",
            r"\bhat\b",
            r"\bcap\b",
            r"\bhoodie\b",
            r"\bjacket\b",
            r"\blanyard\b",
            r"\bmug\b",
            r"\btote\b",
        ),
        required=True,
        why_it_matters="Prevents quoting or ordering the wrong product.",
        next_step="Save the customer/product requirements or vendor item notes.",
    ),
    Signal(
        key="quantity_details",
        label="Quantity / size / color details",
        patterns=(
            r"\bqty\b",
            r"\bquantity\b",
            r"\bquantities\b",
            r"\bpieces\b",
            r"\bpcs\b",
            r"\bunits\b",
            r"\bsizes?\b",
            r"\bcolors?\b",
            r"\b\d+\s*(pcs|pieces|units|shirts|hats|mugs|bags)\b",
        ),
        required=True,
        why_it_matters="Prevents PO, proof, and invoice mismatches.",
        next_step="Capture quantity plus size/color breakdown in the order packet.",
    ),
    Signal(
        key="needed_by_date",
        label="Needed-by / event date",
        patterns=(
            r"\bneeded by\b",
            r"\bneed by\b",
            r"\bin hand\b",
            r"\bin-hand\b",
            r"\bevent date\b",
            r"\bdue date\b",
            r"\bship by\b",
            r"\bdeliver by\b",
            r"\bdelivery date\b",
            r"\b\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?\b",
        ),
        required=True,
        why_it_matters="Drives rush risk, vendor follow-up, and customer expectations.",
        next_step="Add the needed-by date to the open-order tracker.",
    ),
    Signal(
        key="customer_approval",
        label="Customer approval",
        patterns=(
            r"\bapproved\b",
            r"\bapprove\b",
            r"\bapproval\b",
            r"\bgo ahead\b",
            r"\blooks good\b",
            r"\bsounds good\b",
            r"\bconfirmed\b",
            r"\bconfirm\b",
        ),
        required=True,
        why_it_matters="Shows what CA is authorized to order or produce.",
        next_step="Save customer approval in the order packet and tracker.",
    ),
    Signal(
        key="proof_or_artwork",
        label="Proof / artwork",
        patterns=(
            r"\bproof\b",
            r"\bartwork\b",
            r"\bart file\b",
            r"\blogo\b",
            r"\bvector\b",
            r"\bembroidery\b",
            r"\bscreen print\b",
            r"\bdigital mockup\b",
            r"\bmockup\b",
        ),
        required=True,
        why_it_matters="Prevents wrong-art and wrong-version mistakes.",
        next_step="Save approved proof/artwork location and version notes.",
    ),
    Signal(
        key="vendor_or_po",
        label="Vendor / PO handoff",
        patterns=(
            r"\bpo\b",
            r"\bp\.o\.\b",
            r"\bpurchase order\b",
            r"\bvendor\b",
            r"\bprinter\b",
            r"\bdecorator\b",
            r"\bsanmar\b",
            r"\bs&s\b",
            r"\bs and s\b",
            r"\balphabroder\b",
            r"\bviking\b",
            r"\bdiamond graphics\b",
            r"\bpennant\b",
            r"\bhit promotional\b",
        ),
        required=True,
        why_it_matters="Connects customer approval to production execution.",
        next_step="Save PO/vendor order, vendor confirmation, and cost evidence.",
    ),
    Signal(
        key="tracking_shipping",
        label="Shipping / tracking",
        patterns=(
            r"\btracking\b",
            r"\bshipped\b",
            r"\bshipment\b",
            r"\bdelivery\b",
            r"\bdelivered\b",
            r"\bups\b",
            r"\bfedex\b",
            r"\busps\b",
            r"\beta\b",
        ),
        required=True,
        why_it_matters="Answers order-status questions and can trigger invoicing.",
        next_step="Save tracking or delivery evidence in the order packet.",
    ),
    Signal(
        key="invoice_payment",
        label="Invoice / payment",
        patterns=(
            r"\binvoice\b",
            r"\binvoiced\b",
            r"\bpayment\b",
            r"\bpaid\b",
            r"\bdeposit\b",
            r"\bbalance due\b",
            r"\bach\b",
            r"\bcheck\b",
            r"\bcredit card\b",
        ),
        required=True,
        why_it_matters="Connects fulfillment to cash collection and reconciliation.",
        next_step="Save invoice/payment/deposit evidence or QuickBooks reference.",
    ),
    Signal(
        key="job_id",
        label="Internal job/order ID",
        patterns=(
            r"\bCA-\d{4}-\d{4}\b",
            r"\bjob\s*(?:id|#|number)\b",
            r"\border\s*(?:id|#|number)\b",
            r"\bproject\s*(?:id|#|number)\b",
        ),
        required=False,
        why_it_matters="Lets QuickBooks, email, PO, proof, shipping, and invoice records connect.",
        next_step="Add the `CA-YYYY-####` internal job ID to the tracker and subject line convention.",
    ),
    Signal(
        key="attachment_reference",
        label="Attachment / file reference",
        patterns=(
            r"\battached\b",
            r"\battachment\b",
            r"\bsee file\b",
            r"\blink\b",
            r"\bdrive\b",
            r"\bdropbox\b",
            r"\bpdf\b",
            r"\b\.ai\b",
            r"\b\.eps\b",
            r"\b\.png\b",
            r"\b\.jpg\b",
        ),
        required=False,
        why_it_matters="Shows where proof, art, PO, or quote files may live.",
        next_step="Copy important attachments or links into the order packet.",
    ),
]


def relative(path: Path) -> str:
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def clean(value: object) -> str:
    return str(value or "").strip()


def default_evidence_dir() -> Path:
    today_dir = DEFAULT_EVIDENCE_ROOT / date.today().isoformat()
    if today_dir.exists():
        return today_dir
    dated_dirs = sorted(path for path in DEFAULT_EVIDENCE_ROOT.glob("????-??-??") if path.is_dir())
    if dated_dirs:
        return dated_dirs[-1]
    return today_dir


def text_from_eml(path: Path) -> str:
    with path.open("rb") as f:
        message = BytesParser(policy=policy.default).parse(f)

    headers = [
        f"Subject: {clean(message.get('subject'))}",
        f"From: {clean(message.get('from'))}",
        f"To: {clean(message.get('to'))}",
        f"Date: {clean(message.get('date'))}",
    ]
    parts: list[str] = headers

    if message.is_multipart():
        for part in message.walk():
            content_type = part.get_content_type()
            if content_type in {"text/plain", "text/html"}:
                try:
                    parts.append(clean(part.get_content()))
                except (LookupError, UnicodeDecodeError):
                    continue
    else:
        try:
            parts.append(clean(message.get_content()))
        except (LookupError, UnicodeDecodeError):
            pass

    attachments = []
    for part in message.iter_attachments():
        filename = clean(part.get_filename())
        if filename:
            attachments.append(filename)
    if attachments:
        parts.append("Attachments: " + ", ".join(attachments))

    return "\n".join(parts)


def read_text(path: Path) -> tuple[str, str]:
    if path.suffix.lower() == ".eml":
        try:
            return text_from_eml(path), ""
        except Exception as exc:  # noqa: BLE001 - report unreadable evidence, do not fail the audit.
            return "", f"Could not parse .eml file: {exc}"

    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            text = path.read_text(encoding=encoding)
            break
        except UnicodeDecodeError:
            continue
    else:
        return "", "Could not decode text evidence."

    if path.suffix.lower() in {".html", ".htm"}:
        text = re.sub(r"<script\b[^<]*(?:(?!</script>)<[^<]*)*</script>", " ", text, flags=re.IGNORECASE)
        text = re.sub(r"<style\b[^<]*(?:(?!</style>)<[^<]*)*</style>", " ", text, flags=re.IGNORECASE)
        text = re.sub(r"<[^>]+>", " ", text)
    return text, ""


def evidence_files(evidence_dir: Path) -> list[Path]:
    roots = [
        evidence_dir / "email-threads",
        evidence_dir / "orders",
    ]
    files: list[Path] = []
    for root in roots:
        if not root.exists():
            continue
        for path in root.rglob("*"):
            if not path.is_file():
                continue
            if path.name.lower() in IGNORED_NAMES:
                continue
            files.append(path)
    return sorted(files)


def packet_id(path: Path, evidence_dir: Path) -> str:
    parts = path.relative_to(evidence_dir).parts
    for idx, part in enumerate(parts):
        if part == "orders" and idx + 1 < len(parts):
            return parts[idx + 1]
    if parts and parts[0] == "email-threads":
        return "email-threads"
    return "unknown"


def signal_found(signal: Signal, text: str, path: Path) -> bool:
    haystack = f"{text}\n{path.name}".lower()
    return any(re.search(pattern, haystack, flags=re.IGNORECASE) for pattern in signal.patterns)


def file_rows(evidence_dir: Path) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    for path in evidence_files(evidence_dir):
        suffix = path.suffix.lower()
        pid = packet_id(path, evidence_dir)
        if suffix not in TEXT_SUFFIXES:
            rows.append(
                {
                    "packet_id": pid,
                    "file_path": relative(path),
                    "file_type": suffix or "none",
                    "status": "Present - unsupported file type",
                    "signals_found": "",
                    "missing_required_signals": required_signal_names(),
                    "missing_recommended_signals": recommended_signal_names(),
                    "line_count": "",
                    "character_count": "",
                    "next_step": "Save/export this evidence as .eml, .txt, .md, .html, or .csv for text scanning.",
                }
            )
            continue

        text, warning = read_text(path)
        if warning:
            rows.append(
                {
                    "packet_id": pid,
                    "file_path": relative(path),
                    "file_type": suffix,
                    "status": "Present - unreadable",
                    "signals_found": "",
                    "missing_required_signals": required_signal_names(),
                    "missing_recommended_signals": recommended_signal_names(),
                    "line_count": "",
                    "character_count": "",
                    "next_step": warning,
                }
            )
            continue

        found = [signal.label for signal in SIGNALS if signal_found(signal, text, path)]
        missing_required = [
            signal.label
            for signal in SIGNALS
            if signal.required and not signal_found(signal, text, path)
        ]
        missing_recommended = [
            signal.label
            for signal in SIGNALS
            if not signal.required and not signal_found(signal, text, path)
        ]

        if missing_required:
            status = "Present - missing order signals"
            next_step = "Add the missing order details to this packet or save related thread evidence."
        else:
            status = "Present - complete enough for walkthrough"
            next_step = "Use this thread during the one-order walkthrough."

        rows.append(
            {
                "packet_id": pid,
                "file_path": relative(path),
                "file_type": suffix,
                "status": status,
                "signals_found": "; ".join(found),
                "missing_required_signals": "; ".join(missing_required),
                "missing_recommended_signals": "; ".join(missing_recommended),
                "line_count": len(text.splitlines()),
                "character_count": len(text),
                "next_step": next_step,
            }
        )
    return rows


def required_signal_names() -> str:
    return "; ".join(signal.label for signal in SIGNALS if signal.required)


def recommended_signal_names() -> str:
    return "; ".join(signal.label for signal in SIGNALS if not signal.required)


def packet_rows(evidence_dir: Path, detail_rows: list[dict[str, object]]) -> list[dict[str, object]]:
    expected_packets = [f"order-{idx:02d}" for idx in range(1, 6)]
    actual_packets = sorted({clean(row["packet_id"]) for row in detail_rows if clean(row["packet_id"])})
    packets = expected_packets + [pid for pid in actual_packets if pid not in expected_packets]
    rows: list[dict[str, object]] = []

    for pid in packets:
        packet_details = [row for row in detail_rows if clean(row["packet_id"]) == pid]
        if not packet_details:
            rows.append(
                {
                    "packet_id": pid,
                    "files_scanned": 0,
                    "status": "Missing email/thread evidence",
                    "signals_found": "",
                    "missing_required_signals": required_signal_names(),
                    "missing_recommended_signals": recommended_signal_names(),
                    "next_step": "Save the customer request thread, approval, vendor/PO messages, tracking, and invoice/payment clues for this order.",
                }
            )
            continue

        found_keys: set[str] = set()
        for row in packet_details:
            labels = {label.strip() for label in clean(row["signals_found"]).split(";") if label.strip()}
            for signal in SIGNALS:
                if signal.label in labels:
                    found_keys.add(signal.key)

        missing_required = [signal.label for signal in SIGNALS if signal.required and signal.key not in found_keys]
        missing_recommended = [signal.label for signal in SIGNALS if not signal.required and signal.key not in found_keys]
        supported_count = sum(1 for row in packet_details if "unsupported" not in clean(row["status"]).lower())

        if missing_required:
            status = "Needs more thread evidence"
            next_step = "Collect missing required signals before relying on this order packet."
        elif supported_count == 0:
            status = "Evidence present but not text-scannable"
            next_step = "Save/export evidence as text or .eml."
        else:
            status = "Ready for walkthrough"
            next_step = "Use this packet to map gaps and fill the tracker."

        rows.append(
            {
                "packet_id": pid,
                "files_scanned": len(packet_details),
                "status": status,
                "signals_found": "; ".join(signal.label for signal in SIGNALS if signal.key in found_keys),
                "missing_required_signals": "; ".join(missing_required),
                "missing_recommended_signals": "; ".join(missing_recommended),
                "next_step": next_step,
            }
        )
    return rows


def overall_status(packet_summary: list[dict[str, object]], detail_rows: list[dict[str, object]]) -> str:
    if not detail_rows:
        return "Not ready - no saved email/thread evidence"
    if any(clean(row["status"]) == "Ready for walkthrough" for row in packet_summary):
        return "At least one order thread is ready for walkthrough"
    if any(clean(row["files_scanned"]) != "0" for row in packet_summary):
        return "Evidence present - missing order signals"
    return "Not ready - no saved email/thread evidence"


def write_csv(path: Path, rows: list[dict[str, object]], fields: list[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for row in rows:
            writer.writerow({field: row.get(field, "") for field in fields})


def write_markdown(
    path: Path,
    evidence_dir: Path,
    packet_summary: list[dict[str, object]],
    detail_rows: list[dict[str, object]],
    detail_csv: Path,
    packet_csv: Path,
) -> None:
    status_counts: dict[str, int] = {}
    for row in packet_summary:
        status = clean(row["status"])
        status_counts[status] = status_counts.get(status, 0) + 1

    lines = [
        "# Email Thread Audit",
        "",
        f"- Input folder: `{relative(evidence_dir)}`",
        f"- Detail CSV: `{relative(detail_csv)}`",
        f"- Packet CSV: `{relative(packet_csv)}`",
        f"- Overall status: **{overall_status(packet_summary, detail_rows)}**",
        "",
        "## Summary",
        "",
    ]
    for status in sorted(status_counts):
        lines.append(f"- {status}: {status_counts[status]}")

    lines.extend(
        [
            "",
            "## Order Packet Coverage",
            "",
            "| Packet | Files scanned | Status | Missing required signals | Next step |",
            "|---|---:|---|---|---|",
        ]
    )
    for row in packet_summary:
        lines.append(
            "| {packet_id} | {files_scanned} | {status} | {missing} | {next_step} |".format(
                packet_id=row["packet_id"],
                files_scanned=row["files_scanned"],
                status=row["status"],
                missing=row["missing_required_signals"] or "-",
                next_step=row["next_step"],
            )
        )

    lines.extend(
        [
            "",
            "## Questions To Resolve",
            "",
            "1. Which inboxes receive customer requests, proof approvals, vendor confirmations, tracking, and invoices?",
            "2. Does Kenny's personal/AOL inbox still contain active order evidence?",
            "3. What subject-line or job-ID convention can Maclaine use without slowing the team down?",
            "4. Which thread evidence must be copied into the open-order tracker before an order is considered production-ready?",
            "5. Which customers or vendors should never receive automated follow-up without Kenny/Maclaine approval?",
            "",
            "## Signal Definitions",
            "",
            "| Signal | Required? | Why it matters |",
            "|---|---:|---|",
        ]
    )
    for signal in SIGNALS:
        lines.append(
            f"| {signal.label} | {'Yes' if signal.required else 'No'} | {signal.why_it_matters} |"
        )

    lines.extend(
        [
            "",
            "## Guardrails",
            "",
            "- This auditor only reads files saved into the evidence folder.",
            "- It does not connect to or modify inboxes.",
            "- It does not send customer/vendor-facing messages.",
            "- Missing signals are workflow prompts, not proof that the work was not done.",
            "",
        ]
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--evidence-dir",
        default=str(default_evidence_dir()),
        help="Dated backend evidence folder to scan.",
    )
    parser.add_argument(
        "--output-dir",
        default=str(DEFAULT_OUTPUT_ROOT / f"email-thread-audit-{date.today().isoformat()}"),
        help="Folder to write audit outputs.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    evidence_dir = Path(args.evidence_dir).resolve()
    output_dir = Path(args.output_dir).resolve()

    details = file_rows(evidence_dir)
    packets = packet_rows(evidence_dir, details)

    detail_csv = output_dir / "email-thread-detail.csv"
    packet_csv = output_dir / "email-thread-packet-coverage.csv"
    report_path = output_dir / "email-thread-audit.md"

    write_csv(
        detail_csv,
        details,
        [
            "packet_id",
            "file_path",
            "file_type",
            "status",
            "signals_found",
            "missing_required_signals",
            "missing_recommended_signals",
            "line_count",
            "character_count",
            "next_step",
        ],
    )
    write_csv(
        packet_csv,
        packets,
        [
            "packet_id",
            "files_scanned",
            "status",
            "signals_found",
            "missing_required_signals",
            "missing_recommended_signals",
            "next_step",
        ],
    )
    write_markdown(report_path, evidence_dir, packets, details, detail_csv, packet_csv)

    print(f"Wrote {relative(report_path)}")
    print(f"Wrote {relative(detail_csv)}")
    print(f"Wrote {relative(packet_csv)}")
    print(overall_status(packets, details))


if __name__ == "__main__":
    main()
