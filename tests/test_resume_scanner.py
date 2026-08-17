"""
tests/test_resume_scanner.py — Unit tests for NASA Resume & Application Scanner.
"""

import unittest
from pathlib import Path

from src.core.exceptions import ResumeParsingError
from src.core.services import NASAApplicationScanner


class TestNASAApplicationScanner(unittest.TestCase):
    def setUp(self) -> None:
        self.scanner = NASAApplicationScanner()
        sample_path = Path("examples/sample_resume_nasa_engineer.txt")
        if sample_path.exists():
            self.sample_text = sample_path.read_text(encoding="utf-8")
        else:
            self.sample_text = """
            JANE DOE, MS Aerospace Engineering
            Email: jane.doe@alumni.ua.edu | (256) 555-0100
            Experience with NASA SP-2016-6105, ISRU, regolith sintering, ECLSS closed-loop systems.
            Designed melt extrusion testbed achieving 92% mass recovery.
            """

    def test_scan_sample_resume(self) -> None:
        report = self.scanner.scan_resume(self.sample_text)

        self.assertIsNotNone(report)
        self.assertGreater(report.overall_match_score, 50.0)
        self.assertGreater(report.ats_compatibility_score, 60.0)
        self.assertEqual(len(report.competencies), 5)
        self.assertGreater(len(report.matched_keywords), 3)
        self.assertGreater(len(report.tailored_bullet_points), 0)
        self.assertTrue("University of Alabama" in report.university_of_alabama_notes)

    def test_short_resume_raises_error(self) -> None:
        with self.assertRaises(ResumeParsingError):
            self.scanner.scan_resume("Too short")

    def test_competency_evaluations(self) -> None:
        report = self.scanner.scan_resume(self.sample_text)
        isru_comp = next((c for c in report.competencies if c.category == "isru_waste_recycling"), None)
        self.assertIsNotNone(isru_comp)
        self.assertGreater(isru_comp.score_pct, 0.0)


if __name__ == "__main__":
    unittest.main()
