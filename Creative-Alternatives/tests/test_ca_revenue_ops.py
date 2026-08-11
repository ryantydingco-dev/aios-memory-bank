import importlib.util
import sys
import tempfile
import unittest
from datetime import date
from pathlib import Path

from openpyxl import Workbook


ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "ca_revenue_ops", ROOT / "scripts" / "ca_revenue_ops.py"
)
ops = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = ops
SPEC.loader.exec_module(ops)


def make_workbook(path: Path, rows):
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = ops.SHEET_NAME
    for _ in range(5):
        sheet.append([])
    sheet.append(ops.REQUIRED_COLUMNS)
    for row in rows:
        sheet.append([row.get(column, "") for column in ops.REQUIRED_COLUMNS])
    workbook.save(path)


class RevenueOpsTests(unittest.TestCase):
    def base_row(self):
        return {
            "record_type": "DATA",
            "opportunity_id": "OPP-001",
            "account": "Synthetic Example Co",
            "relationship": "new_customer",
            "customer_segment": "new_prospect",
            "buyer_role": "HR / People",
            "offer_package": "Onboarding Ready",
            "product_category": "packaging_kitting",
            "lead_source": "cold_email",
            "campaign_id": "SYNTHETIC-CAMPAIGN",
            "first_touch_date": date(2026, 7, 20),
            "stage": "discovery",
            "expected_order_value": 5000,
            "probability_override": "",
            "reorder_flag": "no",
            "next_action": "Confirm audience and date",
            "next_action_due": date(2026, 7, 28),
            "owner": "Ryan",
            "last_touch_date": date(2026, 7, 27),
            "campaign_attribution": "SYNTHETIC-CAMPAIGN",
            "marketing_permission": "not_applicable",
            "approval_status": "draft",
            "system_of_record": "local_tracker",
            "external_record_id": "",
        }

    def test_valid_workbook_and_views(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "tracker.xlsx"
            make_workbook(path, [self.base_row()])
            rows, issues = ops.validate_workbook(path)
            self.assertEqual(1, len(rows))
            self.assertFalse([issue for issue in issues if issue.severity == "error"])
            daily = ops.daily_view(rows, date(2026, 7, 28))
            weekly = ops.weekly_view(rows, date(2026, 7, 28))
            self.assertIn("Synthetic Example Co", daily)
            self.assertIn("$5,000", daily)
            self.assertIn("Weighted pipeline", weekly)

    def test_duplicate_and_missing_actions_are_errors(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "tracker.xlsx"
            first = self.base_row()
            second = dict(self.base_row())
            second["account"] = "Another Synthetic Co"
            second["next_action"] = ""
            second["next_action_due"] = ""
            make_workbook(path, [first, second])
            _, issues = ops.validate_workbook(path)
            messages = [issue.message for issue in issues if issue.severity == "error"]
            self.assertTrue(any("Duplicate" in message for message in messages))
            self.assertTrue(any("needs an action" in message for message in messages))
            self.assertTrue(any("needs a valid due date" in message for message in messages))

    def test_won_requires_value_and_order_date_and_warns_on_qb(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "tracker.xlsx"
            row = self.base_row()
            row.update(
                {
                    "stage": "won",
                    "next_action": "",
                    "next_action_due": "",
                    "order_value": "",
                    "order_date": "",
                    "qb_invoice_id": "",
                }
            )
            make_workbook(path, [row])
            _, issues = ops.validate_workbook(path)
            fields = {(issue.severity, issue.field) for issue in issues}
            self.assertIn(("error", "order_date"), fields)
            self.assertIn(("error", "order_value"), fields)
            self.assertIn(("warning", "qb_invoice_id"), fields)

    def test_mailchimp_requires_subscribed_permission(self):
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "tracker.xlsx"
            row = self.base_row()
            row["lead_source"] = "existing_customer_mailchimp"
            row["marketing_permission"] = "unknown"
            make_workbook(path, [row])
            _, issues = ops.validate_workbook(path)
            self.assertTrue(
                any(
                    issue.field == "marketing_permission" and issue.severity == "error"
                    for issue in issues
                )
            )


if __name__ == "__main__":
    unittest.main()
