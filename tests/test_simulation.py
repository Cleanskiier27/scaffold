"""
tests/test_simulation.py — Unit tests for Digital Twin Physics & Simulation Engine.
"""

import unittest

from src.core.exceptions import InvalidWasteStreamError, ThermalConstraintViolationError
from src.core.models import (
    LunarEnvironmentConfig,
    ProcessParameters,
    ProcessTechnology,
    WasteInputBatch,
    WasteItem,
    WasteStreamType,
)
from src.core.services import DigitalTwinEngine


class TestDigitalTwinSimulation(unittest.TestCase):
    def setUp(self) -> None:
        self.engine = DigitalTwinEngine()
        self.artemis_batch = DigitalTwinEngine.create_artemis_30day_crew_batch()

    def test_reference_scenarios_exist(self) -> None:
        scenarios = DigitalTwinEngine.get_reference_scenarios()
        self.assertIn("artemis_30day_crew4", scenarios)
        self.assertIn("artemis_base_camp_180day", scenarios)
        self.assertIn("regolith_composite_construction", scenarios)
        self.assertGreater(scenarios["artemis_30day_crew4"].total_mass_kg, 20.0)

    def test_melt_extrusion_simulation(self) -> None:
        params = ProcessParameters(
            technology=ProcessTechnology.MELT_FILAMENT_EXTRUSION,
            operating_temp_c=195.0,
            throughput_kg_per_hr=1.5,
            power_draw_kw=1.2,
            vacuum_degassing=True,
        )
        res = self.engine.simulate(self.artemis_batch, params=params)

        self.assertIsNotNone(res)
        self.assertEqual(res.technology, ProcessTechnology.MELT_FILAMENT_EXTRUSION)
        self.assertGreater(res.mass_recovery_yield_pct, 80.0)
        self.assertLess(res.specific_energy_kwh_per_kg, 2.0)
        self.assertGreater(res.launch_cost_savings_usd, 500_000.0)
        self.assertIn("3d_printer_filament_1_75mm_kg", res.end_products)
        self.assertGreater(len(res.telemetry_timeline), 5)

    def test_regolith_sintered_composite_simulation(self) -> None:
        batch = DigitalTwinEngine.create_regolith_sintered_batch()
        params = ProcessParameters(
            technology=ProcessTechnology.SINTERED_REGOLITH_COMPOSITE,
            regolith_blend_ratio=0.75,
        )
        res = self.engine.simulate(batch, params=params)

        self.assertEqual(res.technology, ProcessTechnology.SINTERED_REGOLITH_COMPOSITE)
        self.assertIn("interlocking_lunar_bricks_units", res.end_products)
        self.assertGreater(res.end_products["interlocking_lunar_bricks_units"], 0)

    def test_thermal_depolymerization_simulation(self) -> None:
        params = ProcessParameters(technology=ProcessTechnology.THERMAL_DEPOLYMERIZATION)
        res = self.engine.simulate(self.artemis_batch, params=params)

        self.assertIn("lunar_syngas_ch4_co_h2_kg", res.end_products)
        self.assertGreater(res.solid_product_mass_kg, 0.0)

    def test_empty_batch_raises_error(self) -> None:
        empty_batch = WasteInputBatch(name="Empty Batch", items=[])
        with self.assertRaises(InvalidWasteStreamError):
            self.engine.simulate(empty_batch)

    def test_thermal_violation_raises_error(self) -> None:
        params = ProcessParameters(
            technology=ProcessTechnology.MELT_FILAMENT_EXTRUSION,
            operating_temp_c=550.0,  # Exceeds max degradation
        )
        with self.assertRaises(ThermalConstraintViolationError):
            self.engine.simulate(self.artemis_batch, params=params)


if __name__ == "__main__":
    unittest.main()
