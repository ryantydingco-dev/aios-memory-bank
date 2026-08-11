import csv
import importlib.util
import sqlite3
import sys
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SPEC = importlib.util.spec_from_file_location(
    "ca_inbound_metrics", ROOT / "scripts" / "ca_inbound_metrics.py"
)
metrics = importlib.util.module_from_spec(SPEC)
assert SPEC.loader
sys.modules[SPEC.name] = metrics
SPEC.loader.exec_module(metrics)


class InboundMetricsTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.conn = metrics.connect(self.root / "test.db")
        metrics.init_schema(self.conn)

    def tearDown(self):
        self.conn.close()
        self.tmp.cleanup()

    def write_csv(self, name, rows):
        path = self.root / name
        fieldnames = list(dict.fromkeys(key for row in rows for key in row))
        with path.open("w", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(rows)
        return path

    def seed_cohort(self):
        inquiries = self.write_csv(
            "inquiries.csv",
            [
                {
                    "ca_inquiry_id": "I1",
                    "ca_inquiry_date": "2026-07-02T10:00:00-04:00",
                    "ca_niche": "camp",
                    "ca_qualification_status": "qualified",
                    "ca_latest_touch_source": "google",
                    "ca_latest_touch_medium": "cpc",
                    "ca_latest_touch_campaign": "2027-camps",
                    "ca_response_due": "2026-07-02T17:00:00-04:00",
                    "first_response_at": "2026-07-02T12:00:00-04:00",
                },
                {
                    "ca_inquiry_id": "I2",
                    "ca_inquiry_date": "2026-07-03",
                    "ca_niche": "camp",
                    "ca_qualification_status": "no_fit",
                    "ca_no_fit_reason": "single_item_consumer",
                    "ca_latest_touch_source": "acacamps.org",
                    "ca_response_due": "",
                    "first_response_at": "",
                },
                {
                    "ca_inquiry_id": "I3",
                    "ca_inquiry_date": "2026-07-04",
                    "ca_niche": "law_firm",
                    "ca_qualification_status": "qualified",
                    "ca_latest_touch_source": "google",
                    "ca_latest_touch_medium": "organic",
                    "ca_latest_touch_campaign": "",
                    "ca_response_due": "2026-07-05",
                    "first_response_at": "",
                },
            ],
        )
        deals = self.write_csv(
            "deals.csv",
            [
                {
                    "hs_object_id": "D1",
                    "ca_inquiry_id": "I1",
                    "createdate": "2026-07-02",
                    "dealstage": "Closed Won",
                    "ca_quote_value": "5000",
                    "won": "true",
                    "new_customer": "true",
                    "ca_closed_revenue": "4500",
                    "ca_quickbooks_customer_id": "QB-C1",
                    "ca_quickbooks_order_invoice_id": "INV-1",
                },
                {
                    "hs_object_id": "D2",
                    "ca_inquiry_id": "I3",
                    "createdate": "2026-07-05",
                    "dealstage": "Quote Delivered",
                    "ca_quote_value": "3000",
                    "won": "false",
                    "new_customer": "false",
                    "ca_closed_revenue": "",
                    "ca_quickbooks_customer_id": "",
                    "ca_quickbooks_order_invoice_id": "",
                },
            ],
        )
        spend = self.write_csv(
            "spend.csv",
            [
                {
                    "date": "2026-07-02",
                    "channel": "google",
                    "campaign": "2027-camps",
                    "niche": "camp",
                    "spend": "100",
                    "clicks": "10",
                    "impressions": "100",
                },
                {
                    "date": "2026-07-04",
                    "channel": "google",
                    "campaign": "law-organic-support",
                    "niche": "law_firm",
                    "spend": "50",
                    "clicks": "5",
                    "impressions": "50",
                },
            ],
        )
        metrics.ingest_csv(self.conn, "inquiries", inquiries)
        metrics.ingest_csv(self.conn, "deals", deals)
        metrics.ingest_csv(self.conn, "spend", spend)

    def test_import_and_cohort_report(self):
        self.seed_cohort()
        report = metrics.generate_report(self.conn, "2026-07-01", "2026-07-31")
        self.assertIn("| Inquiries | 3 |", report)
        self.assertIn("| Qualified leads | 2 |", report)
        self.assertIn("| Quotes | 2 |", report)
        self.assertIn("| Wins | 1 |", report)
        self.assertIn("| New customers | 1 |", report)
        self.assertIn("| Reconciled closed revenue | $4,500 |", report)
        self.assertIn("| Tracked spend | $150 |", report)
        self.assertIn("| Cost per qualified lead | $75 |", report)
        self.assertIn("Overdue inquiries without first response: **1**", report)
        self.assertIn("single_item_consumer: 1", report)

    def test_upsert_does_not_duplicate_inquiries(self):
        self.seed_cohort()
        inquiries_path = self.root / "inquiries.csv"
        metrics.ingest_csv(self.conn, "inquiries", inquiries_path)
        count = self.conn.execute("SELECT COUNT(*) FROM inbound_inquiries").fetchone()[0]
        self.assertEqual(3, count)

    def test_missing_required_field_is_rejected(self):
        path = self.write_csv(
            "bad.csv",
            [{"inquiry_id": "I1", "inquiry_date": "2026-07-01", "niche": "camp"}],
        )
        with self.assertRaises(ValueError):
            metrics.ingest_csv(self.conn, "inquiries", path)

    def test_schema_stores_no_contact_pii_columns(self):
        columns = {
            row[1] for row in self.conn.execute("PRAGMA table_info(inbound_inquiries)").fetchall()
        }
        self.assertFalse({"email", "first_name", "last_name", "phone"} & columns)


if __name__ == "__main__":
    unittest.main()
