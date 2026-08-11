import json
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PREVIEW = ROOT / "staging" / "camp-inbound"


class DocumentParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self._in_title = False
        self.meta = {}
        self.links = []
        self.canonical = ""
        self.ids = set()
        self.form_names = set()
        self.schemas = []
        self._schema = None

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "title":
            self._in_title = True
        if tag == "meta" and values.get("name"):
            self.meta[values["name"]] = values.get("content", "")
        if tag == "link" and values.get("rel") == "canonical":
            self.canonical = values.get("href", "")
        if tag == "a" and values.get("href"):
            self.links.append(values["href"])
        if values.get("id"):
            self.ids.add(values["id"])
        if tag in {"input", "select", "textarea"} and values.get("name"):
            self.form_names.add(values["name"])
        if tag == "script" and values.get("type") == "application/ld+json":
            self._schema = []

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        if tag == "script" and self._schema is not None:
            self.schemas.append(json.loads("".join(self._schema)))
            self._schema = None

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._schema is not None:
            self._schema.append(data)


def parse(name):
    parser = DocumentParser()
    parser.feed((PREVIEW / name).read_text())
    parser.close()
    return parser


class CampPreviewTests(unittest.TestCase):
    def test_expected_pages_exist(self):
        for name in ("index.html", "planning-calendar.html", "store-vs-bulk.html"):
            self.assertTrue((PREVIEW / name).is_file(), name)

    def test_staging_pages_are_noindex_and_canonicalized(self):
        expected = {
            "index.html": "/summer-camp-merchandise",
            "planning-calendar.html": "/resources/camp-merchandise-planning-calendar",
            "store-vs-bulk.html": "/resources/camp-store-vs-bulk-order",
        }
        for name, suffix in expected.items():
            page = parse(name)
            self.assertEqual("noindex,nofollow", page.meta["robots"])
            self.assertEqual(f"https://www.creativealternatives.com{suffix}", page.canonical)
            self.assertTrue(page.title)
            self.assertTrue(page.meta["description"])

    def test_resources_have_article_schema(self):
        for name in ("planning-calendar.html", "store-vs-bulk.html"):
            page = parse(name)
            self.assertEqual("Article", page.schemas[0]["@type"])
            self.assertEqual(page.canonical, page.schemas[0]["mainEntityOfPage"])

    def test_commercial_page_links_to_both_resources(self):
        page = parse("index.html")
        self.assertIn("planning-calendar.html", page.links)
        self.assertIn("store-vs-bulk.html", page.links)
        self.assertIn("plan", page.ids)

    def test_preview_form_contains_minimum_qualification_fields(self):
        page = parse("index.html")
        required = {
            "first_name",
            "last_name",
            "email",
            "organization",
            "planning",
            "needed",
            "quantity",
            "message",
        }
        self.assertEqual(required, page.form_names)


if __name__ == "__main__":
    unittest.main()
