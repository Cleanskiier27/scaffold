"""
tests/test_submission.py — Unit tests for NASA / University of Alabama Proposal Generator.
"""

import unittest

from src.core.services import DigitalTwinEngine, NASAApplicationScanner
from src.core.submission_generator import SubmissionGenerator


class TestSubmissionGenerator(unittest.TestCase):
    def test_generate_dossier_with_results(self) -> None:
        batch = DigitalTwinEngine.create_artemis_30day_crew_batch()
        sim_res = DigitalTwinEngine().simulate(batch)
        scanner = NASAApplicationScanner()
        scan_rep = scanner.scan_resume("Alexander Mercer, MS Aerospace Engineering. Expert in ISRU and ECLSS.")

        dossier = SubmissionGenerator.generate_dossier(
            project_title="Test LunaRecycle Proposal",
            team_name="Aegis ISRU Team",
            lead_author="Alexander Mercer",
            track="Phase 2: Integrated Prototype",
            simulation_result=sim_res,
            scan_report=scan_rep,
        )

        self.assertEqual(dossier.project_title, "Test LunaRecycle Proposal")
        self.assertIn("Specific Energy (kWh/kg)", dossier.swap_c_budget)
        self.assertGreater(len(dossier.safety_hazard_analysis), 0)
        self.assertGreater(len(dossier.compliance_rubric_checklist), 0)

        markdown = SubmissionGenerator.export_markdown(dossier)
        self.assertIn("# Test LunaRecycle Proposal", markdown)
        self.assertIn("The University of Alabama College of Engineering", markdown)
        self.assertIn("SWaP-C", markdown)


if __name__ == "__main__":
    unittest.main()
