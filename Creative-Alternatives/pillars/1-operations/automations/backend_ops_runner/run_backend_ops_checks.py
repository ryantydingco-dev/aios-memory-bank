#!/usr/bin/env python3
"""Run the Creative Alternatives backend ops check cycle."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from datetime import date
from pathlib import Path
import subprocess
import sys


WORKSPACE_ROOT = Path(__file__).resolve().parents[4]
DEFAULT_OUTPUT_ROOT = WORKSPACE_ROOT / "outputs/operations"


@dataclass(frozen=True)
class Step:
    name: str
    command: list[str]
    key_output: Path | None = None


@dataclass
class StepResult:
    name: str
    command: list[str]
    returncode: int
    stdout: str
    stderr: str
    key_output: Path | None

    @property
    def status(self) -> str:
        if self.returncode != 0:
            return "Failed"
        if self.key_output and not self.key_output.exists():
            return "Output missing"
        return "Passed"


def relative(path: Path | None) -> str:
    if path is None:
        return ""
    try:
        return str(path.relative_to(WORKSPACE_ROOT))
    except ValueError:
        return str(path)


def python_cmd(script: str, *args: str) -> list[str]:
    return [sys.executable, script, *args]


def build_steps(run_date: str, skip_audit_packet: bool) -> list[Step]:
    evidence_dir = Path(f"context/import/backend-audit/{run_date}")
    session_intake = evidence_dir / "backend-answer-intake.csv"
    audit_dir = Path(f"outputs/operations/backend-audit-{run_date}")
    answer_dir = Path(f"outputs/operations/backend-answer-summary-{run_date}")
    qb_dir = evidence_dir / "quickbooks"
    qb_output = Path(f"outputs/operations/quickbooks-export-validation-{run_date}")
    email_output = Path(f"outputs/operations/email-thread-audit-{run_date}")
    evidence_output = Path(f"outputs/operations/backend-evidence-audit-{run_date}")
    intake_output = Path(f"outputs/operations/backend-intake-analysis-{run_date}")
    po_output = Path(f"outputs/operations/po-printer-tracker-{run_date}")
    dashboard_output = Path(f"outputs/operations/backend-readiness-dashboard-{run_date}")
    script_output = Path(f"outputs/operations/backend-session-script-{run_date}")

    steps = [
        Step(
            "Create/refresh session intake",
            python_cmd(
                "pillars/1-operations/automations/backend_session_intake/create_backend_session_intake.py",
                "--date",
                run_date,
            ),
            session_intake,
        ),
        Step(
            "Compile backend answers",
            python_cmd(
                "pillars/1-operations/automations/backend_answer_compiler/compile_backend_answers.py",
                "--input",
                str(session_intake),
                "--output-dir",
                str(answer_dir),
            ),
            answer_dir / "backend-answer-summary.md",
        ),
        Step(
            "Validate QuickBooks exports",
            python_cmd(
                "pillars/1-operations/automations/quickbooks_export_validator/validate_quickbooks_exports.py",
                "--quickbooks-dir",
                str(qb_dir),
                "--output-dir",
                str(qb_output),
            ),
            qb_output / "quickbooks-export-validation.md",
        ),
        Step(
            "Audit email/order threads",
            python_cmd(
                "pillars/1-operations/automations/email_thread_auditor/audit_email_threads.py",
                "--evidence-dir",
                str(evidence_dir),
                "--output-dir",
                str(email_output),
            ),
            email_output / "email-thread-audit.md",
        ),
        Step(
            "Audit backend evidence",
            python_cmd(
                "pillars/1-operations/automations/backend_evidence_auditor/audit_backend_evidence.py",
                "--evidence-dir",
                str(evidence_dir),
                "--output-dir",
                str(evidence_output),
            ),
            evidence_output / "backend-evidence-summary.md",
        ),
    ]

    if not skip_audit_packet:
        steps.append(
            Step(
                "Generate backend audit packet",
                python_cmd(
                    "pillars/1-operations/automations/backend_audit_packet/generate_backend_audit_packet.py",
                    "--output-dir",
                    str(audit_dir),
                ),
                audit_dir / "backend-audit-report.md",
            )
        )

    steps.extend(
        [
            Step(
                "Analyze backend intake",
                python_cmd(
                    "pillars/1-operations/automations/backend_intake_analyzer/analyze_backend_intake.py",
                    "--input-dir",
                    str(audit_dir),
                    "--output-dir",
                    str(intake_output),
                ),
                intake_output / "backend-intake-analysis.md",
            ),
            Step(
                "Generate PO/printer tracker",
                python_cmd(
                    "pillars/1-operations/automations/po_printer_tracker/generate_po_printer_tracker.py",
                    "--input-dir",
                    str(audit_dir),
                    "--output-dir",
                    str(po_output),
                ),
                po_output / "po-follow-up-list.md",
            ),
            Step(
                "Generate readiness dashboard",
                python_cmd(
                    "pillars/1-operations/automations/backend_readiness_dashboard/generate_backend_readiness_dashboard.py",
                    "--date",
                    run_date,
                    "--output-dir",
                    str(dashboard_output),
                ),
                dashboard_output / "backend-readiness-dashboard.md",
            ),
            Step(
                "Generate live session script",
                python_cmd(
                    "pillars/1-operations/automations/backend_session_script/generate_backend_session_script.py",
                    "--date",
                    run_date,
                    "--output-dir",
                    str(script_output),
                ),
                script_output / "backend-live-session-script.md",
            ),
        ]
    )
    return steps


def run_step(step: Step) -> StepResult:
    completed = subprocess.run(
        step.command,
        cwd=WORKSPACE_ROOT,
        text=True,
        capture_output=True,
        check=False,
    )
    return StepResult(
        name=step.name,
        command=step.command,
        returncode=completed.returncode,
        stdout=completed.stdout.strip(),
        stderr=completed.stderr.strip(),
        key_output=WORKSPACE_ROOT / step.key_output if step.key_output and not step.key_output.is_absolute() else step.key_output,
    )


def write_log(path: Path, results: list[StepResult]) -> None:
    lines: list[str] = []
    for result in results:
        lines.extend(
            [
                f"## {result.name}",
                "",
                f"Status: {result.status}",
                f"Return code: {result.returncode}",
                f"Command: {' '.join(result.command)}",
                f"Key output: {relative(result.key_output)}",
                "",
                "STDOUT:",
                result.stdout or "(empty)",
                "",
                "STDERR:",
                result.stderr or "(empty)",
                "",
            ]
        )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def write_summary(path: Path, run_date: str, results: list[StepResult], log_path: Path) -> None:
    failed = [result for result in results if result.status != "Passed"]
    dashboard = DEFAULT_OUTPUT_ROOT / f"backend-readiness-dashboard-{run_date}/backend-readiness-dashboard.md"
    actions = DEFAULT_OUTPUT_ROOT / f"backend-readiness-dashboard-{run_date}/backend-next-actions.csv"
    session_script = DEFAULT_OUTPUT_ROOT / f"backend-session-script-{run_date}/backend-live-session-script.md"
    lines = [
        "# Backend Ops Check Run",
        "",
        f"- Run date: {run_date}",
        f"- Overall status: **{'Needs attention' if failed else 'Passed'}**",
        f"- Run log: `{relative(log_path)}`",
        f"- Readiness dashboard: `{relative(dashboard)}`",
        f"- Live session script: `{relative(session_script)}`",
        f"- Next actions CSV: `{relative(actions)}`",
        "",
        "## Step Results",
        "",
        "| Step | Status | Key output |",
        "|---|---|---|",
    ]
    for result in results:
        lines.append(f"| {result.name} | {result.status} | `{relative(result.key_output)}` |")

    lines.extend(["", "## Operator Note", ""])
    if failed:
        lines.append("One or more scripts failed or did not produce its expected output. Open the run log before trusting the dashboard.")
    else:
        lines.append("All backend check scripts completed. The dashboard may still say not build-ready if evidence or answers are missing.")
    lines.extend(
        [
            "",
            "## Guardrails",
            "",
            "- This runner is read-only against QuickBooks, email, customers, and vendors.",
            "- It only refreshes local evidence reports and generated trackers.",
            "- Missing evidence remains a blocker for customer/vendor/money-facing automation.",
            "",
        ]
    )
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines), encoding="utf-8")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--date", default=date.today().isoformat(), help="Session/report date in YYYY-MM-DD format.")
    parser.add_argument(
        "--output-dir",
        default="",
        help="Output folder for runner summary/log. Defaults to outputs/operations/backend-ops-run-YYYY-MM-DD.",
    )
    parser.add_argument(
        "--skip-audit-packet",
        action="store_true",
        help="Skip regenerating backend-audit-YYYY-MM-DD from base QuickBooks starter exports.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    run_date = args.date
    output_dir = Path(args.output_dir) if args.output_dir else DEFAULT_OUTPUT_ROOT / f"backend-ops-run-{run_date}"
    if not output_dir.is_absolute():
        output_dir = WORKSPACE_ROOT / output_dir

    results = [run_step(step) for step in build_steps(run_date, args.skip_audit_packet)]
    log_path = output_dir / "backend-ops-run-log.md"
    summary_path = output_dir / "backend-ops-run-summary.md"
    write_log(log_path, results)
    write_summary(summary_path, run_date, results, log_path)

    for result in results:
        print(f"{result.status}: {result.name}")
    print(f"Wrote {relative(summary_path)}")

    if any(result.status != "Passed" for result in results):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
