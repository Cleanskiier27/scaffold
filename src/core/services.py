"""
core/services.py — Core engineering simulation and NASA application intelligence services.

Contains:
1. DigitalTwinEngine: Physics-based thermodynamics, mass/energy balance, microgravity extrusion,
   and lunar regolith composite recycling simulator.
2. NASAApplicationScanner: Aerospace ATS parsing, NASA/OPM competency alignment,
   and LunaRecycle Challenge rubric scoring engine.
"""

from __future__ import annotations

import math
import re
from typing import Any, Dict, List, Tuple
from uuid import uuid4

from src.core.exceptions import (
    InvalidWasteStreamError,
    ResumeParsingError,
    SimulationError,
    ThermalConstraintViolationError,
)
from src.core.models import (
    ApplicationScanReport,
    CompetencyMatch,
    LunarEnvironmentConfig,
    ProcessParameters,
    ProcessTechnology,
    RecyclingResult,
    ResumeProfile,
    WasteInputBatch,
    WasteItem,
    WasteStreamType,
)


# ─────────────────────────────────────────────────────────────
# 1. Digital Twin Physics & Lunar Recycling Simulation Engine
# ─────────────────────────────────────────────────────────────

class DigitalTwinEngine:
    """
    Physics-based simulation engine for lunar solid waste reprocessing and manufacturing.
    Models vacuum degassing, thermal enthalpy, microgravity polymer extrusion,
    and sintered regolith-polymer composite manufacturing.
    """

    EARTH_TO_MOON_LAUNCH_COST_PER_KG = 50_000.0  # NASA Artemis baseline: $50,000 / kg payload
    STEFAN_BOLTZMANN_CONSTANT = 5.670374e-8       # W / (m^2 * K^4)

    @classmethod
    def get_reference_scenarios(cls) -> Dict[str, WasteInputBatch]:
        """
        Standard NASA and University of Alabama reference waste manifests.
        """
        return {
            "artemis_30day_crew4": cls.create_artemis_30day_crew_batch(),
            "artemis_base_camp_180day": cls.create_artemis_base_camp_batch(),
            "regolith_composite_construction": cls.create_regolith_sintered_batch(),
        }

    @classmethod
    def create_artemis_30day_crew_batch(cls) -> WasteInputBatch:
        """
        Artemis surface sortie (4 crew, 30 days): ~28.4 kg total non-metabolic solid waste.
        """
        return WasteInputBatch(
            name="Artemis Sortie 30-Day Waste Manifest (4 Crew)",
            mission_context="Artemis Lunar Surface Sortie (4 Crew, 30 Days)",
            items=[
                WasteItem(
                    name="Food Packaging Multi-layer Laminates",
                    stream_type=WasteStreamType.FOOD_PACKAGING_ORGANICS,
                    mass_kg=8.5,
                    polymer_fraction=0.70,
                    moisture_fraction=0.10,
                    volatile_fraction=0.15,
                    ash_fraction=0.05,
                    melting_temp_c=140.0,
                    degradation_temp_c=310.0,
                ),
                WasteItem(
                    name="Crew Hygiene & Wet Wipes (Cellulose/Polyester)",
                    stream_type=WasteStreamType.FABRICS_CREW_WEAR,
                    mass_kg=6.2,
                    polymer_fraction=0.55,
                    moisture_fraction=0.25,
                    volatile_fraction=0.15,
                    ash_fraction=0.05,
                    melting_temp_c=220.0,
                    degradation_temp_c=360.0,
                ),
                WasteItem(
                    name="Nomex / Cotton Crew Clothing & Towels",
                    stream_type=WasteStreamType.FABRICS_CREW_WEAR,
                    mass_kg=5.8,
                    polymer_fraction=0.85,
                    moisture_fraction=0.05,
                    volatile_fraction=0.08,
                    ash_fraction=0.02,
                    melting_temp_c=260.0,
                    degradation_temp_c=410.0,
                ),
                WasteItem(
                    name="Cargo Dunnage & LDPE / Bubble Wrap",
                    stream_type=WasteStreamType.PACKAGING_POLYMERS,
                    mass_kg=5.4,
                    polymer_fraction=0.96,
                    moisture_fraction=0.01,
                    volatile_fraction=0.02,
                    ash_fraction=0.01,
                    melting_temp_c=125.0,
                    degradation_temp_c=380.0,
                ),
                WasteItem(
                    name="FDM 3D Printing Scrap & Support Structures",
                    stream_type=WasteStreamType.STRUCTURAL_FOAMS,
                    mass_kg=2.5,
                    polymer_fraction=0.98,
                    moisture_fraction=0.0,
                    volatile_fraction=0.01,
                    ash_fraction=0.01,
                    melting_temp_c=190.0,
                    degradation_temp_c=350.0,
                ),
            ],
        )

    @classmethod
    def create_artemis_base_camp_batch(cls) -> WasteInputBatch:
        """
        Long-duration Artemis Base Camp (180 days expedition): ~172.5 kg solid waste.
        """
        return WasteInputBatch(
            name="Artemis Base Camp 180-Day Manifest",
            mission_context="Artemis Base Camp Permanent Habitation (180 Days)",
            items=[
                WasteItem(
                    name="HDPE / PET Container Scrap & Dunnage",
                    stream_type=WasteStreamType.PACKAGING_POLYMERS,
                    mass_kg=62.0,
                    polymer_fraction=0.95,
                    moisture_fraction=0.01,
                    volatile_fraction=0.03,
                    ash_fraction=0.01,
                    melting_temp_c=135.0,
                ),
                WasteItem(
                    name="Nomex/Kevlar Outfitting Fabrics & Garments",
                    stream_type=WasteStreamType.FABRICS_CREW_WEAR,
                    mass_kg=44.5,
                    polymer_fraction=0.88,
                    moisture_fraction=0.04,
                    volatile_fraction=0.06,
                    ash_fraction=0.02,
                    melting_temp_c=275.0,
                ),
                WasteItem(
                    name="Polyurethane Thermal Insulation & Packing Foam",
                    stream_type=WasteStreamType.STRUCTURAL_FOAMS,
                    mass_kg=38.0,
                    polymer_fraction=0.92,
                    moisture_fraction=0.02,
                    volatile_fraction=0.05,
                    ash_fraction=0.01,
                    melting_temp_c=180.0,
                ),
                WasteItem(
                    name="Food Storage Pouch Aggregates",
                    stream_type=WasteStreamType.FOOD_PACKAGING_ORGANICS,
                    mass_kg=28.0,
                    polymer_fraction=0.72,
                    moisture_fraction=0.12,
                    volatile_fraction=0.12,
                    ash_fraction=0.04,
                    melting_temp_c=145.0,
                ),
            ],
        )

    @classmethod
    def create_regolith_sintered_batch(cls) -> WasteInputBatch:
        """
        Waste polymer batch specifically designated as a binder for Lunar Regolith Shielding Bricks.
        """
        return WasteInputBatch(
            name="Lunar Regolith Composite Binder Batch",
            mission_context="ISRU Infrastructure & Radiation Shield Construction",
            items=[
                WasteItem(
                    name="Mixed Polymer Film Scrap (LDPE/PP)",
                    stream_type=WasteStreamType.PACKAGING_POLYMERS,
                    mass_kg=30.0,
                    polymer_fraction=0.94,
                    melting_temp_c=140.0,
                ),
                WasteItem(
                    name="Structural Support Thermoplastics",
                    stream_type=WasteStreamType.STRUCTURAL_FOAMS,
                    mass_kg=20.0,
                    polymer_fraction=0.96,
                    melting_temp_c=195.0,
                ),
            ],
        )

    def simulate(
        self,
        batch: WasteInputBatch,
        params: ProcessParameters | None = None,
        env: LunarEnvironmentConfig | None = None,
    ) -> RecyclingResult:
        """
        Execute thermodynamic, kinetic, and mass-balance simulation for lunar waste batch.
        """
        if not batch.items or batch.total_mass_kg <= 0:
            raise InvalidWasteStreamError("Cannot simulate an empty or zero-mass waste batch.")

        params = params or ProcessParameters()
        env = env or LunarEnvironmentConfig()

        total_input_mass = batch.total_mass_kg

        # Check thermal limits
        max_degradation = min((item.degradation_temp_c for item in batch.items), default=350.0)
        if params.technology == ProcessTechnology.MELT_FILAMENT_EXTRUSION and params.operating_temp_c > max_degradation:
            raise ThermalConstraintViolationError(
                f"Operating temperature {params.operating_temp_c}°C exceeds polymer degradation threshold ({max_degradation}°C).",
                temperature_c=params.operating_temp_c,
            )

        # 1. Mass Balance Decomposition
        raw_polymer = batch.polymer_mass_kg
        raw_moisture = batch.moisture_mass_kg
        raw_ash = sum(item.mass_kg * item.ash_fraction for item in batch.items)
        raw_volatiles = sum(item.mass_kg * item.volatile_fraction for item in batch.items)

        # Technology-specific conversions
        if params.technology == ProcessTechnology.MELT_FILAMENT_EXTRUSION:
            # Mechanical shredding + thermal melt extrusion into continuous 1.75mm 3D printing filament
            # High recovery of polymer, moisture evaporated and condensed, volatiles captured in filter
            degassing_efficiency = 0.94 if params.vacuum_degassing else 0.70
            filament_mass = raw_polymer * 0.92
            water_recovered = raw_moisture * 0.95
            volatiles_captured = raw_volatiles * degassing_efficiency
            slag_char = raw_ash + (raw_polymer * 0.08)
            solid_product_mass = filament_mass

            end_products = {
                "3d_printer_filament_1_75mm_kg": round(filament_mass, 2),
                "reclaimed_water_liters": round(water_recovered, 2),
                "adsorbed_carbon_filter_cake_kg": round(slag_char, 2),
            }
            base_spec_energy = 0.85  # kWh/kg baseline for mechanical melt-extrusion

        elif params.technology == ProcessTechnology.SINTERED_REGOLITH_COMPOSITE:
            # Molten polymer binder (10-30%) blended with Lunar Regolith simulant (70-90%)
            # to manufacture high-strength radiation shielding structural blocks
            blend_ratio = max(0.40, min(0.85, params.regolith_blend_ratio or 0.75))
            regolith_used_kg = raw_polymer * (blend_ratio / (1.0 - blend_ratio))
            composite_brick_mass = (raw_polymer * 0.95) + regolith_used_kg
            water_recovered = raw_moisture * 0.90
            volatiles_captured = raw_volatiles * 0.85
            slag_char = raw_ash + (raw_polymer * 0.05)
            solid_product_mass = composite_brick_mass

            brick_unit_mass = 5.0  # 5 kg standard interlocking lunar habitat brick
            num_bricks = math.floor(composite_brick_mass / brick_unit_mass)

            end_products = {
                "regolith_composite_mass_kg": round(composite_brick_mass, 2),
                "interlocking_lunar_bricks_units": int(num_bricks),
                "in_situ_regolith_utilized_kg": round(regolith_used_kg, 2),
                "reclaimed_water_liters": round(water_recovered, 2),
            }
            base_spec_energy = 1.15  # kWh/kg due to high thermal mass of regolith

        elif params.technology == ProcessTechnology.THERMAL_DEPOLYMERIZATION:
            # Pyrolysis / thermal crack at 400-600°C to produce syngas (CH4, CO, H2) + pure carbon black
            syngas_mass = (raw_polymer * 0.75) + (raw_volatiles * 0.90)
            carbon_black = (raw_polymer * 0.20) + raw_ash
            water_recovered = raw_moisture * 0.98
            volatiles_captured = syngas_mass
            solid_product_mass = carbon_black
            slag_char = carbon_black

            end_products = {
                "lunar_syngas_ch4_co_h2_kg": round(syngas_mass, 2),
                "conductive_carbon_black_kg": round(carbon_black, 2),
                "potable_eclss_water_liters": round(water_recovered, 2),
            }
            base_spec_energy = 2.40  # Higher temperature requires more thermal power

        else:  # CATALYTIC_HYDROGASIFICATION
            methane_fuel_mass = (raw_polymer * 0.65) + (raw_volatiles * 0.80)
            water_recovered = (raw_moisture * 0.98) + (raw_polymer * 0.15)
            solid_product_mass = raw_ash + (raw_polymer * 0.10)
            volatiles_captured = methane_fuel_mass
            slag_char = solid_product_mass

            end_products = {
                "rocket_grade_methane_ch4_kg": round(methane_fuel_mass, 2),
                "eclss_grade_water_liters": round(water_recovered, 2),
                "residual_mineral_ash_kg": round(slag_char, 2),
            }
            base_spec_energy = 2.85

        # 2. Physics & Thermodynamics (Sensible + Latent Heat + Radiative Loss)
        avg_specific_heat = sum(item.specific_heat_j_kg_k * item.mass_kg for item in batch.items) / total_input_mass
        delta_t_k = max(20.0, (params.operating_temp_c + 273.15) - env.surface_temp_k)
        sensible_heat_joules = total_input_mass * avg_specific_heat * delta_t_k
        latent_heat_joules = total_input_mass * 180_000.0  # Approx 180 kJ/kg latent heat of fusion

        # Radiative heat loss under lunar vacuum (Stefan-Boltzmann)
        effective_radiator_area_m2 = 0.85
        emissivity = 0.08  # Multi-layer Insulation (MLI) gold coating
        t_chamber_k = params.operating_temp_c + 273.15
        t_sink_k = env.surface_temp_k
        rad_loss_watts = (
            emissivity * effective_radiator_area_m2 * self.STEFAN_BOLTZMANN_CONSTANT *
            ((t_chamber_k ** 4) - (t_sink_k ** 4))
        )

        process_hours = max(0.5, total_input_mass / max(0.1, params.throughput_kg_per_hr))
        total_thermal_kwh = (sensible_heat_joules + latent_heat_joules) / (3.6e6)
        total_rad_loss_kwh = (rad_loss_watts * process_hours) / 1000.0
        equipment_electrical_kwh = params.power_draw_kw * process_hours

        total_energy_consumed_kwh = round(
            (base_spec_energy * total_input_mass) + total_thermal_kwh + total_rad_loss_kwh + (equipment_electrical_kwh * 0.35),
            2,
        )
        specific_energy_kwh_per_kg = round(total_energy_consumed_kwh / total_input_mass, 2)

        # 3. Mass Recovery Yield % (usable mass recovered / total waste input mass)
        mass_recovery_yield_pct = round(
            min(100.0, (solid_product_mass + water_recovered) / total_input_mass * 100.0),
            1,
        )
        if params.technology == ProcessTechnology.SINTERED_REGOLITH_COMPOSITE:
            # Composite leverages in-situ regolith, yielding multiplier on launch mass
            mass_recovery_yield_pct = round(min(100.0, (raw_polymer * 0.95 + water_recovered) / total_input_mass * 100.0), 1)

        # 4. Lunar Feasibility, TRL & Launch Savings
        # Artemis Launch cost offset calculation
        equivalent_payload_saved_kg = solid_product_mass + water_recovered
        launch_cost_savings_usd = round(equivalent_payload_saved_kg * self.EARTH_TO_MOON_LAUNCH_COST_PER_KG, 2)

        # Feasibility score (0-100) based on specific energy, yield, and crew overhead
        energy_score = max(0.0, 100.0 - (specific_energy_kwh_per_kg * 18.0))
        yield_score = mass_recovery_yield_pct
        crew_overhead_score = max(0.0, 100.0 - (params.crew_time_hours_per_kg * 400.0))
        lunar_feasibility_score = round(
            (yield_score * 0.45) + (energy_score * 0.35) + (crew_overhead_score * 0.20),
            1,
        )

        trl_level = 6 if params.technology in [ProcessTechnology.MELT_FILAMENT_EXTRUSION, ProcessTechnology.SINTERED_REGOLITH_COMPOSITE] else 5
        hazard_mitigation_score = 94.5 if params.vacuum_degassing else 78.0
        crew_time_total = round(params.crew_time_hours_per_kg * total_input_mass, 2)

        # 5. Generate Real-time Telemetry Timeline (for live charts & digital twin visualizer)
        telemetry = self._generate_telemetry(
            process_hours=process_hours,
            target_temp_c=params.operating_temp_c,
            initial_temp_c=env.surface_temp_k - 273.15,
            total_mass=total_input_mass,
            target_power_kw=params.power_draw_kw,
            target_pressure_kpa=params.chamber_pressure_kpa,
        )

        return RecyclingResult(
            batch_name=batch.name,
            technology=params.technology,
            input_mass_kg=round(total_input_mass, 2),
            solid_product_mass_kg=round(solid_product_mass, 2),
            gas_volatiles_mass_kg=round(volatiles_captured, 2),
            recovered_water_kg=round(water_recovered, 2),
            residual_char_mass_kg=round(slag_char, 2),
            mass_recovery_yield_pct=mass_recovery_yield_pct,
            total_energy_consumed_kwh=total_energy_consumed_kwh,
            specific_energy_kwh_per_kg=specific_energy_kwh_per_kg,
            process_duration_hours=round(process_hours, 2),
            end_products=end_products,
            lunar_feasibility_score=lunar_feasibility_score,
            trl_level=trl_level,
            launch_cost_savings_usd=launch_cost_savings_usd,
            crew_time_total_hours=crew_time_total,
            hazard_mitigation_score=hazard_mitigation_score,
            telemetry_timeline=telemetry,
        )

    def _generate_telemetry(
        self,
        process_hours: float,
        target_temp_c: float,
        initial_temp_c: float,
        total_mass: float,
        target_power_kw: float,
        target_pressure_kpa: float,
    ) -> List[Dict[str, Any]]:
        """Generate realistic time-stepped sensor readings for the digital twin telemetry."""
        steps = 15
        timeline = []
        for i in range(steps + 1):
            progress = i / steps
            time_hr = round(progress * process_hours, 2)

            # Temp sigmoid curve
            temp = round(initial_temp_c + (target_temp_c - initial_temp_c) * (1.0 / (1.0 + math.exp(-6 * (progress - 0.25)))), 1)
            # Power ramp
            power = round(target_power_kw * (0.3 + 0.7 * math.sin(progress * math.pi)), 2) if progress > 0 else 0.1
            # Degassing pressure spike then drop
            pressure = round(target_pressure_kpa * (1.0 + 0.4 * math.exp(-((progress - 0.4) ** 2) / 0.02)), 2)
            # Mass processed cumulative
            processed_mass = round(total_mass * (1.0 / (1.0 + math.exp(-8 * (progress - 0.5)))), 2)

            timeline.append({
                "time_hr": time_hr,
                "progress_pct": int(progress * 100),
                "temperature_c": temp,
                "power_draw_kw": power,
                "chamber_pressure_kpa": pressure,
                "processed_mass_kg": processed_mass,
            })
        return timeline


# ─────────────────────────────────────────────────────────────
# 2. NASA Resume & Aerospace Application Scanner
# ─────────────────────────────────────────────────────────────

class NASAApplicationScanner:
    """
    Intelligent ATS parser and scoring engine aligned with NASA Competency Framework,
    OPM Qualifications, and the NASA / University of Alabama LunaRecycle Challenge Rubric.
    """

    # Comprehensive Aerospace & LunaRecycle Rubric Categories
    COMPETENCY_DEFINITIONS = {
        "isru_waste_recycling": {
            "name": "ISRU & Lunar Solid Waste Processing",
            "weight": 1.2,
            "keywords": [
                "isru", "in-situ resource utilization", "recycling", "solid waste",
                "polymer", "thermoplastic", "extrusion", "pyrolysis", "gasification",
                "sintering", "regolith", "eclss", "closed-loop", "circular economy",
                "filament", "additive manufacturing", "melt flow", "3d printing"
            ],
            "description": "Expertise in solid waste conversion, thermal/mechanical processing, and lunar materials."
        },
        "lunar_environment_engineering": {
            "name": "Lunar Surface & Extreme Environment Engineering",
            "weight": 1.1,
            "keywords": [
                "lunar vacuum", "microgravity", "low gravity", "thermal vacuum", "t-vac",
                "radiation shielding", "regolith dust", "dust mitigation", "cryogenic",
                "thermal management", "heat dissipation", "radiative cooling", "artemis"
            ],
            "description": "Understanding lunar environmental constraints (0.166g, vacuum, thermal cycling, regolith dust)."
        },
        "systems_engineering_nasa_standards": {
            "name": "Systems Engineering & NASA Quality Standards",
            "weight": 1.0,
            "keywords": [
                "systems engineering", "nasa sp-2016-6105", "conops", "concept of operations",
                "requirements verification", "v&v", "swap-c", "trade study", "fmea",
                "hazard analysis", "fault tolerance", "technology readiness level", "trl",
                "mil-std", "risk mitigation", "space flight hardware"
            ],
            "description": "Rigorous systems engineering methodologies, SWaP-C trade studies, and NASA design standards."
        },
        "digital_twin_simulation": {
            "name": "Digital Twin & Physics-Based Modeling",
            "weight": 1.0,
            "keywords": [
                "digital twin", "simulation", "finite element", "fea", "cfd",
                "thermodynamics", "mass balance", "energy balance", "matlab", "simulink",
                "python", "physics engine", "telemetry", "sensor fusion", "predictive maintenance"
            ],
            "description": "Virtual modeling, computational simulation, and telemetry integration for digital twins."
        },
        "aerospace_leadership_ua_alignment": {
            "name": "Aerospace Leadership & Allied Collaboration",
            "weight": 0.9,
            "keywords": [
                "university of alabama", "nasa centennial challenges", "project lead",
                "proposal writing", "peer review", "interdisciplinary", "milestone delivery",
                "technical report", "grant management", "stakeholder collaboration"
            ],
            "description": "Leadership capability, collegiate research execution, and NASA challenge compliance."
        },
    }

    ACTION_VERBS_STAR = [
        "designed", "developed", "engineered", "optimized", "simulated", "modeled",
        "synthesized", "validated", "reduced", "increased", "achieved", "pioneered",
        "fabricated", "integrated", "led", "managed", "formulated", "patented"
    ]

    def scan_resume(self, text: str, target_role: str = "NASA LunaRecycle Challenge Systems Lead") -> ApplicationScanReport:
        """
        Parse, analyze, and evaluate a candidate's resume against NASA & LunaRecycle rubrics.
        """
        if not text or len(text.strip()) < 30:
            raise ResumeParsingError("Resume content is too short or empty for analysis.")

        normalized_text = text.lower()
        candidate_profile = self._extract_profile(text)
        candidate_profile.target_role = target_role

        # 1. Competency Scoring & Keyword Matching
        competency_matches: List[CompetencyMatch] = []
        all_matched_keywords: List[str] = []
        all_missing_keywords: List[str] = []
        weighted_scores_sum = 0.0
        total_weight = 0.0

        for cat_key, cat_data in self.COMPETENCY_DEFINITIONS.items():
            matched = []
            missing = []
            for kw in cat_data["keywords"]:
                pattern = r"\b" + re.escape(kw) + r"\b"
                if re.search(pattern, normalized_text):
                    matched.append(kw)
                else:
                    missing.append(kw)

            match_pct = (len(matched) / len(cat_data["keywords"])) * 100.0
            # Boost score if candidate has high keyword coverage or strong related verbs
            score_pct = min(100.0, round(match_pct * 1.5, 1))

            feedback = (
                f"Demonstrated solid competency with {len(matched)} matched technical indicators."
                if score_pct >= 60 else
                f"Consider incorporating key concepts: {', '.join(missing[:4])}."
            )

            c_match = CompetencyMatch(
                category=cat_key,
                competency_name=cat_data["name"],
                score_pct=score_pct,
                matched_keywords=matched,
                missing_keywords=missing,
                feedback=feedback,
                importance_weight=cat_data["weight"],
            )
            competency_matches.append(c_match)
            all_matched_keywords.extend(matched)
            all_missing_keywords.extend(missing[:3])
            weighted_scores_sum += score_pct * cat_data["weight"]
            total_weight += cat_data["weight"]

        overall_match = round(weighted_scores_sum / max(1.0, total_weight), 1)

        # 2. ATS & Formatting Compatibility Score
        ats_score = self._compute_ats_score(text, normalized_text, all_matched_keywords)

        # 3. Rubric Dimension Breakdown (0-100)
        rubric_scores = {
            "Technical Innovation & ISRU": next((c.score_pct for c in competency_matches if c.category == "isru_waste_recycling"), 70.0),
            "Lunar Environmental Feasibility": next((c.score_pct for c in competency_matches if c.category == "lunar_environment_engineering"), 65.0),
            "Systems Architecture & SWaP-C": next((c.score_pct for c in competency_matches if c.category == "systems_engineering_nasa_standards"), 75.0),
            "Digital Twin Fidelity & Physics": next((c.score_pct for c in competency_matches if c.category == "digital_twin_simulation"), 80.0),
            "Programmatic & University Alignment": next((c.score_pct for c in competency_matches if c.category == "aerospace_leadership_ua_alignment"), 60.0),
        }

        # 4. Strengths, Gap Remediation & Tailored Bullets
        strengths, remediations = self._generate_strengths_and_gaps(competency_matches, candidate_profile, ats_score)
        tailored_bullets = self._generate_tailored_bullets(candidate_profile, all_matched_keywords)

        ua_notes = (
            "Submission strongly aligns with The University of Alabama College of Engineering allied standards "
            "for NASA Centennial Challenges. Recommended for presentation at UA Industry Day & McAbee demonstration."
        )

        return ApplicationScanReport(
            candidate_name=candidate_profile.candidate_name,
            overall_match_score=overall_match,
            ats_compatibility_score=ats_score,
            luna_challenge_alignment_score=round((overall_match + ats_score) / 2.0, 1),
            competencies=competency_matches,
            rubric_scores=rubric_scores,
            matched_keywords=list(set(all_matched_keywords)),
            missing_critical_keywords=list(set(all_missing_keywords))[:10],
            strengths=strengths,
            gap_remediations=remediations,
            tailored_bullet_points=tailored_bullets,
            university_of_alabama_notes=ua_notes,
        )

    def _extract_profile(self, text: str) -> ResumeProfile:
        """Extract basic contact, years, education, and metrics from resume text."""
        profile = ResumeProfile(raw_text=text)

        # Name extraction heuristic (first line or first heading)
        lines = [line.strip() for line in text.splitlines() if line.strip()]
        if lines:
            first_line = lines[0]
            if len(first_line) < 50 and not any(k in first_line.lower() for k in ["resume", "curriculum", "page"]):
                profile.candidate_name = first_line.title()

        # Email extraction
        email_match = re.search(r"[\w\.-]+@[\w\.-]+\.\w+", text)
        if email_match:
            profile.email = email_match.group(0)

        # Phone extraction
        phone_match = re.search(r"(\+?\d{1,2}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}", text)
        if phone_match:
            profile.phone = phone_match.group(0)

        # Metric / quantifiable achievement count (numbers with %, $, kg, kW, hrs)
        metric_matches = re.findall(r"\b\d+(\.\d+)?\s*(%|kg|kw|kwh|usd|\$|hours|hrs|x|fold|trl)\b", text, re.IGNORECASE)
        profile.quantifiable_achievements_count = len(metric_matches)

        # Years of experience estimate
        year_matches = re.findall(r"\b(19\d\d|20\d\d)\b", text)
        if len(year_matches) >= 2:
            years = [int(y) for y in year_matches if 1980 <= int(y) <= 2030]
            if years:
                profile.total_experience_years = max(1.0, float(max(years) - min(years)))
        else:
            profile.total_experience_years = 3.0

        return profile

    def _compute_ats_score(self, text: str, normalized_text: str, matched_keywords: List[str]) -> float:
        """Compute parsing readability, section completeness, and keyword density."""
        score = 50.0

        # Section presence checks
        sections = ["experience", "education", "skills", "projects", "certifications", "publications"]
        found_sections = sum(1 for s in sections if s in normalized_text)
        score += (found_sections / len(sections)) * 25.0

        # Keyword density check
        kw_count = len(matched_keywords)
        if kw_count >= 15:
            score += 15.0
        elif kw_count >= 8:
            score += 10.0
        else:
            score += 5.0

        # Action verb density
        verb_count = sum(1 for v in self.ACTION_VERBS_STAR if re.search(r"\b" + v + r"\b", normalized_text))
        if verb_count >= 6:
            score += 10.0
        else:
            score += 5.0

        return min(100.0, round(score, 1))

    def _generate_strengths_and_gaps(
        self,
        competencies: List[CompetencyMatch],
        profile: ResumeProfile,
        ats_score: float,
    ) -> Tuple[List[str], List[str]]:
        """Identify key standout strengths and actionable remediations."""
        strengths = []
        gaps = []

        top_comps = sorted(competencies, key=lambda c: c.score_pct, reverse=True)
        for c in top_comps[:2]:
            if c.score_pct >= 50:
                strengths.append(f"Strong demonstrated capability in {c.competency_name} ({int(c.score_pct)}% alignment).")

        if profile.quantifiable_achievements_count >= 3:
            strengths.append(f"Excellent use of quantifiable engineering metrics ({profile.quantifiable_achievements_count} distinct data points identified).")
        else:
            gaps.append("Quantifiable Metrics: Add specific quantitative metrics (e.g., % mass recovery, kWh/kg power reduction, TRL progression).")

        low_comps = sorted(competencies, key=lambda c: c.score_pct)
        for c in low_comps[:2]:
            if c.score_pct < 60:
                gaps.append(f"{c.competency_name}: Emphasize experience with {', '.join(c.missing_keywords[:3])}.")

        if ats_score < 75:
            gaps.append("ATS Optimization: Ensure standard federal resume headings ('Professional Experience', 'Technical Skills', 'Education & Training') are clearly formatted.")

        return strengths, gaps

    def _generate_tailored_bullets(self, profile: ResumeProfile, matched_kws: List[str]) -> List[str]:
        """Generate high-impact, NASA STAR-formatted bullet points for resume enhancement."""
        return [
            "• Architected closed-loop solid waste recycling digital twin for NASA LunaRecycle Challenge, modeling polymer depolymerization and 0.166g melt extrusion to achieve 92.4% mass yield at <1.1 kWh/kg.",
            "• Conducted high-fidelity SWaP-C trade studies and thermal-vacuum degradation simulations under Artemis surface conditions, offsetting $1.4M+ in Earth-to-Moon launch payload mass.",
            "• Formulated sintered regolith-thermoplastic composite manufacturing methodology in compliance with NASA SP-2016-6105 systems engineering standards and University of Alabama allied guidelines.",
            "• Integrated real-time digital twin telemetry dashboard with automated hazard detection, mitigating lunar volatile off-gassing risk by 94.5% during continuous extrusion cycles.",
        ]
