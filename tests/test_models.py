"""
tests/test_models.py — Unit tests for domain models and data structures.
"""

import unittest
from src.core.models import (
    LunarEnvironmentConfig,
    ProcessParameters,
    ProcessTechnology,
    ResumeProfile,
    WasteInputBatch,
    WasteItem,
    WasteStreamType,
)


class TestDomainModels(unittest.TestCase):
    def test_waste_item_creation(self) -> None:
        item = WasteItem(
            name="Test Film",
            stream_type=WasteStreamType.PACKAGING_POLYMERS,
            mass_kg=10.0,
            polymer_fraction=0.9,
            melting_temp_c=135.0,
        )
        self.assertEqual(item.name, "Test Film")
        self.assertEqual(item.mass_kg, 10.0)

    def test_waste_item_negative_mass_raises(self) -> None:
        with self.assertRaises(ValueError):
            WasteItem(
                name="Invalid",
                stream_type=WasteStreamType.PACKAGING_POLYMERS,
                mass_kg=-5.0,
            )

    def test_waste_input_batch_properties(self) -> None:
        item1 = WasteItem(name="Item 1", stream_type=WasteStreamType.PACKAGING_POLYMERS, mass_kg=10.0, polymer_fraction=0.8)
        item2 = WasteItem(name="Item 2", stream_type=WasteStreamType.FABRICS_CREW_WEAR, mass_kg=5.0, polymer_fraction=0.5)
        batch = WasteInputBatch(name="Test Batch", items=[item1, item2])

        self.assertEqual(batch.total_mass_kg, 15.0)
        self.assertEqual(batch.polymer_mass_kg, (10.0 * 0.8) + (5.0 * 0.5))
        self.assertEqual(len(batch.mass_by_stream), 2)

    def test_lunar_environment_defaults(self) -> None:
        env = LunarEnvironmentConfig()
        self.assertAlmostEqual(env.gravity_m_s2, 1.622)
        self.assertAlmostEqual(env.ambient_pressure_pa, 1.0e-10)

    def test_resume_profile_defaults(self) -> None:
        prof = ResumeProfile(candidate_name="Test Candidate")
        self.assertEqual(prof.candidate_name, "Test Candidate")
        self.assertIn("NASA", prof.target_role)


if __name__ == "__main__":
    unittest.main()
