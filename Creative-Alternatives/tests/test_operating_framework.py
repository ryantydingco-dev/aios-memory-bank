import importlib.util
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "validate_operating_framework.py"
SPEC = importlib.util.spec_from_file_location("validate_operating_framework", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class OperatingFrameworkValidationTest(unittest.TestCase):
    def test_setup_framework_is_valid(self):
        self.assertEqual([], MODULE.validate(strict=False))

    def test_segment_selection_is_not_predecided(self):
        path = ROOT / "operating-system" / "trackers" / "outbound" / "segment-decision-scorecard.csv"
        _, rows = MODULE.read_csv(str(path.relative_to(ROOT)))
        selected = [row for row in rows if row["decision_status"] == "selected"]
        self.assertEqual([], selected)


if __name__ == "__main__":
    unittest.main()
