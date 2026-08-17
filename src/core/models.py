"""
core/models.py — Domain entities and value objects for LunaRecycle-OS.

Models covering:
- Lunar solid waste streams & materials characterization
- Lunar extreme environment boundary conditions
- Solid waste recycling process parameters & simulation results
- NASA/OPM competency framework & resume application scanner data structures
- Challenge submission package & system trade study representations
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict, List, Optional
from uuid import UUID, uuid4


def _now() -> datetime:
    """Return the current UTC time. Isolated for testability."""
    return datetime.now(tz=timezone.utc)


# ─────────────────────────────────────────────────────────────
# Lunar Waste Stream & Materials Models
# ─────────────────────────────────────────────────────────────

class WasteStreamType(str, Enum):
    """NASA LunaRecycle solid waste category classification."""
    PACKAGING_POLYMERS = "PACKAGING_POLYMERS"          # LDPE, HDPE, PET, multilayer film
    FABRICS_CREW_WEAR = "FABRICS_CREW_WEAR"            # Nomex, cotton, nylon, EVA hygiene wipes
    STRUCTURAL_FOAMS = "STRUCTURAL_FOAMS"              # Polyurethane foam, FDM support scrap, packing dunnage
    FOOD_PACKAGING_ORGANICS = "FOOD_PACKAGING_ORGANICS" # Foil-polymer laminates, dried food residue
    METALLIC_SCRAP = "METALLIC_SCRAP"                  # Aluminum foils, fastener scraps


class ProcessTechnology(str, Enum):
    """Solid waste recycling and manufacturing process options."""
    MELT_FILAMENT_EXTRUSION = "MELT_FILAMENT_EXTRUSION"      # Shredding + extrusion for 3D print feedstock
    SINTERED_REGOLITH_COMPOSITE = "SINTERED_REGOLITH_COMPOSITE" # Polymer matrix + Lunar Regolith brick sintering
    THERMAL_DEPOLYMERIZATION = "THERMAL_DEPOLYMERIZATION"    # Pyrolysis / gasification into syngas + carbon
    CATALYTIC_HYDROGASIFICATION = "CATALYTIC_HYDROGASIFICATION" # Organics to methane + water recovery


@dataclass
class WasteItem:
    """
    Individual solid waste component in a lunar mission payload.
    """
    name: str
    stream_type: WasteStreamType
    mass_kg: float
    polymer_fraction: float = 1.0       # 0.0 - 1.0
    moisture_fraction: float = 0.0      # 0.0 - 1.0
    volatile_fraction: float = 0.15     # 0.0 - 1.0
    ash_fraction: float = 0.05          # 0.0 - 1.0
    density_kg_m3: float = 920.0        # kg/m^3
    specific_heat_j_kg_k: float = 1800.0# J/(kg*K)
    melting_temp_c: float = 135.0       # Melting point in Celsius
    degradation_temp_c: float = 340.0   # Thermal breakdown point in Celsius

    def __post_init__(self) -> None:
        if self.mass_kg < 0:
            raise ValueError("WasteItem mass_kg cannot be negative.")
        total_fractions = (
            self.polymer_fraction + self.moisture_fraction + 
            self.volatile_fraction + self.ash_fraction
        )
        if total_fractions <= 0:
            raise ValueError("Total material fractions must be positive.")


@dataclass
class WasteInputBatch:
    """
    Collection of solid waste items submitted for a recycling mission cycle.
    """
    name: str
    items: List[WasteItem] = field(default_factory=list)
    batch_id: UUID = field(default_factory=uuid4)
    mission_context: str = "Artemis Base Camp 30-Day Crew Rotation"

    @property
    def total_mass_kg(self) -> float:
        return sum(item.mass_kg for item in self.items)

    @property
    def polymer_mass_kg(self) -> float:
        return sum(item.mass_kg * item.polymer_fraction for item in self.items)

    @property
    def moisture_mass_kg(self) -> float:
        return sum(item.mass_kg * item.moisture_fraction for item in self.items)

    @property
    def mass_by_stream(self) -> Dict[str, float]:
        summary: Dict[str, float] = {}
        for item in self.items:
            key = item.stream_type.value
            summary[key] = summary.get(key, 0.0) + item.mass_kg
        return summary


# ─────────────────────────────────────────────────────────────
# Lunar Extreme Environment Configuration
# ─────────────────────────────────────────────────────────────

@dataclass
class LunarEnvironmentConfig:
    """
    Boundary conditions of the lunar surface operational environment.
    """
    gravity_m_s2: float = 1.622                 # Lunar gravity (1/6 Earth g)
    ambient_pressure_pa: float = 1.0e-10        # Lunar ultra-high vacuum
    surface_temp_k: float = 180.0               # Lunar surface temp (40K in PSR to 390K at equator)
    solar_irradiance_w_m2: float = 1361.0       # Solar constant in cislunar space
    dust_abrasion_index: float = 0.08           # Lunar regolith abrasive dust penalty factor
    lunar_night_duration_days: float = 14.0     # Maximum continuous night period
    in_situ_regolith_density_kg_m3: float = 1500.0 # Bulk lunar highland/mare regolith density


# ─────────────────────────────────────────────────────────────
# Process Parameters & Simulation Results
# ─────────────────────────────────────────────────────────────

@dataclass
class ProcessParameters:
    """
    Operational control setpoints for the recycling equipment.
    """
    technology: ProcessTechnology = ProcessTechnology.MELT_FILAMENT_EXTRUSION
    operating_temp_c: float = 195.0             # Chamber/extruder barrel setpoint
    chamber_pressure_kpa: float = 101.3         # Pressurized habitat / sealed chamber (kPa)
    throughput_kg_per_hr: float = 1.5           # Processing rate (kg/hr)
    power_draw_kw: float = 1.2                  # Total electrical draw (kW)
    regolith_blend_ratio: float = 0.0           # 0.0 = pure polymer, 0.7 = 70% regolith matrix
    purge_gas: str = "Recycled N2"
    crew_time_hours_per_kg: float = 0.05        # Autonomous low-crew overhead (hrs/kg)
    vacuum_degassing: bool = True               # Enable lunar vacuum degassing to remove trapped volatiles


@dataclass
class RecyclingResult:
    """
    Complete telemetry, mass balance, energy budget, and product yield from simulation.
    """
    batch_name: str
    technology: ProcessTechnology
    input_mass_kg: float
    solid_product_mass_kg: float
    gas_volatiles_mass_kg: float
    recovered_water_kg: float
    residual_char_mass_kg: float
    mass_recovery_yield_pct: float              # Overall usable mass yield %
    total_energy_consumed_kwh: float
    specific_energy_kwh_per_kg: float           # Key NASA efficiency metric: kWh per kg waste
    process_duration_hours: float
    end_products: Dict[str, float]              # e.g. {"3d_printing_filament_kg": 14.2, "tiles_count": 6}
    lunar_feasibility_score: float              # 0.0 - 100.0
    trl_level: int                              # Technology Readiness Level (1-9)
    launch_cost_savings_usd: float              # Estimated Earth-to-Moon launch payload savings ($50k/kg)
    crew_time_total_hours: float
    hazard_mitigation_score: float              # 0.0 - 100.0
    telemetry_timeline: List[Dict[str, Any]] = field(default_factory=list)
    timestamp: datetime = field(default_factory=_now)


# ─────────────────────────────────────────────────────────────
# NASA Resume & Application Scanner Domain Models
# ─────────────────────────────────────────────────────────────

@dataclass
class CompetencyMatch:
    """
    Evaluation score and evidence for a NASA / Aerospace core competency.
    """
    category: str
    competency_name: str
    score_pct: float                            # 0 - 100%
    matched_keywords: List[str] = field(default_factory=list)
    missing_keywords: List[str] = field(default_factory=list)
    feedback: str = ""
    importance_weight: float = 1.0


@dataclass
class ResumeProfile:
    """
    Structured representation of candidate's aerospace credentials and application.
    """
    candidate_name: str = "Aerospace Candidate"
    email: str = ""
    phone: str = ""
    target_role: str = "NASA LunaRecycle Challenge Systems Lead"
    clearance_status: str = "U.S. Citizen / Eligible"
    total_experience_years: float = 0.0
    education_level: str = "BS/MS STEM"
    extracted_skills: List[str] = field(default_factory=list)
    quantifiable_achievements_count: int = 0
    raw_text: str = ""


@dataclass
class ApplicationScanReport:
    """
    Comprehensive ATS score, NASA rubric scoring, and resume enhancement dossier.
    """
    candidate_name: str
    overall_match_score: float                  # 0 - 100%
    ats_compatibility_score: float              # 0 - 100%
    luna_challenge_alignment_score: float       # 0 - 100%
    competencies: List[CompetencyMatch] = field(default_factory=list)
    rubric_scores: Dict[str, float] = field(default_factory=dict)
    matched_keywords: List[str] = field(default_factory=list)
    missing_critical_keywords: List[str] = field(default_factory=list)
    strengths: List[str] = field(default_factory=list)
    gap_remediations: List[str] = field(default_factory=list)
    tailored_bullet_points: List[str] = field(default_factory=list)
    university_of_alabama_notes: str = ""
    timestamp: datetime = field(default_factory=_now)


# ─────────────────────────────────────────────────────────────
# Official Submission Package Models
# ─────────────────────────────────────────────────────────────

@dataclass
class SubmissionDossier:
    """
    Formal NASA & University of Alabama LunaRecycle Challenge Submission Package.
    """
    project_title: str
    team_name: str
    lead_author: str
    track: str                                  # "Phase 1: Digital Twin" or "Phase 2: Prototype & Twin"
    executive_summary: str
    system_architecture: str
    physics_thermal_narrative: str
    swap_c_budget: Dict[str, Any]               # Size, Weight, Power, Cost
    safety_hazard_analysis: List[Dict[str, str]]
    simulation_benchmarks: Dict[str, Any]
    candidate_qualifications_summary: str
    compliance_rubric_checklist: List[Dict[str, Any]]
    created_at: datetime = field(default_factory=_now)
