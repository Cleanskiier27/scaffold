"""
tests/test_api.py — Integration tests for REST API endpoints and Web Application.
"""

import unittest
from src.web.app import create_app


class TestAPIEndpoints(unittest.TestCase):
    def setUp(self) -> None:
        self.app = create_app()
        self.client = self.app.test_client()

    def test_status_endpoint(self) -> None:
        res = self.client.get("/api/status")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertEqual(data["status"], "operational")
        self.assertIn("University of Alabama", data["partnership"])

    def test_scenarios_endpoint(self) -> None:
        res = self.client.get("/api/scenarios")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("artemis_30day_crew4", data)

    def test_simulate_endpoint(self) -> None:
        payload = {
            "scenario": "artemis_30day_crew4",
            "technology": "MELT_FILAMENT_EXTRUSION",
            "operating_temp_c": 195.0,
        }
        res = self.client.post("/api/simulate", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertIn("mass_recovery_yield_pct", data["result"])

    def test_sample_resume_endpoint(self) -> None:
        res = self.client.get("/api/sample-resume")
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertIn("ALEXANDER V. MERCER", data["sample_resume"])

    def test_scan_resume_endpoint(self) -> None:
        payload = {
            "text": "ALEXANDER V. MERCER, MS Aerospace University of Alabama. Expert in ISRU, melt extrusion, NASA SP-2016-6105.",
            "target_role": "NASA LunaRecycle Challenge Systems Lead"
        }
        res = self.client.post("/api/scan-resume", json=payload)
        self.assertEqual(res.status_code, 200)
        data = res.get_json()
        self.assertTrue(data["success"])
        self.assertGreater(data["report"]["overall_match_score"], 0)

    def test_web_index_route(self) -> None:
        res = self.client.get("/")
        self.assertEqual(res.status_code, 200)
        self.assertIn(b"LUNARECYCLE", res.data)


if __name__ == "__main__":
    unittest.main()
