"""
src/api/routes.py — REST API endpoints for LunaRecycle Digital Twin & NASA Application Scanner.
"""

from __future__ import annotations

import traceback
from typing import Any, Dict
from flask import Blueprint, jsonify, request

from src.core.exceptions import DomainError, InvalidWasteStreamError, ThermalConstraintViolationError
from src.core.models import (
    LunarEnvironmentConfig,
    ProcessParameters,
    ProcessTechnology,
    WasteInputBatch,
    WasteItem,
    WasteStreamType,
)
from src.core.services import DigitalTwinEngine, NASAApplicationScanner
from src.core.submission_generator import SubmissionGenerator

api_bp = Blueprint("api", __name__, url_prefix="/api")

twin_engine = DigitalTwinEngine()
resume_scanner = NASAApplicationScanner()


@api_bp.route("/status", methods=["GET"])
def get_status() -> Any:
    """Return system readiness, mission parameters, and API health."""
    return jsonify({
        "status": "operational",
        "system": "LunaRecycle-OS Engine",
        "version": "1.0.0",
        "partnership": "NASA Centennial Challenges & The University of Alabama College of Engineering",
        "supported_technologies": [t.value for t in ProcessTechnology],
        "supported_waste_streams": [w.value for w in WasteStreamType],
    })


@api_bp.route("/scenarios", methods=["GET"])
def get_scenarios() -> Any:
    """Return pre-configured Artemis lunar mission waste scenarios."""
    scenarios = DigitalTwinEngine.get_reference_scenarios()
    payload = {}
    for key, batch in scenarios.items():
        payload[key] = {
            "name": batch.name,
            "mission_context": batch.mission_context,
            "total_mass_kg": round(batch.total_mass_kg, 2),
            "polymer_mass_kg": round(batch.polymer_mass_kg, 2),
            "moisture_mass_kg": round(batch.moisture_mass_kg, 2),
            "items_count": len(batch.items),
            "items": [
                {
                    "name": item.name,
                    "stream_type": item.stream_type.value,
                    "mass_kg": item.mass_kg,
                    "polymer_fraction": item.polymer_fraction,
                    "melting_temp_c": item.melting_temp_c,
                }
                for item in batch.items
            ],
        }
    return jsonify(payload)


@api_bp.route("/simulate", methods=["POST"])
def run_simulation() -> Any:
    """
    Run digital twin physics simulation for waste batch.
    Accepts scenario name or custom waste items & operating parameters.
    """
    data = request.get_json(silent=True) or {}
    scenario_name = data.get("scenario")

    try:
        # 1. Resolve waste batch
        if scenario_name and scenario_name in DigitalTwinEngine.get_reference_scenarios():
            batch = DigitalTwinEngine.get_reference_scenarios()[scenario_name]
        elif "items" in data:
            items = []
            for it in data["items"]:
                items.append(
                    WasteItem(
                        name=it.get("name", "Custom Waste Item"),
                        stream_type=WasteStreamType(it.get("stream_type", WasteStreamType.PACKAGING_POLYMERS.value)),
                        mass_kg=float(it.get("mass_kg", 5.0)),
                        polymer_fraction=float(it.get("polymer_fraction", 0.9)),
                        moisture_fraction=float(it.get("moisture_fraction", 0.05)),
                        melting_temp_c=float(it.get("melting_temp_c", 160.0)),
                    )
                )
            batch = WasteInputBatch(
                name=data.get("name", "Custom Lunar Waste Batch"),
                items=items,
                mission_context=data.get("mission_context", "Custom Surface Run"),
            )
        else:
            batch = DigitalTwinEngine.create_artemis_30day_crew_batch()

        # 2. Resolve parameters
        tech_val = data.get("technology", ProcessTechnology.MELT_FILAMENT_EXTRUSION.value)
        params = ProcessParameters(
            technology=ProcessTechnology(tech_val),
            operating_temp_c=float(data.get("operating_temp_c", 195.0)),
            chamber_pressure_kpa=float(data.get("chamber_pressure_kpa", 101.3)),
            throughput_kg_per_hr=float(data.get("throughput_kg_per_hr", 1.5)),
            power_draw_kw=float(data.get("power_draw_kw", 1.2)),
            regolith_blend_ratio=float(data.get("regolith_blend_ratio", 0.75)),
            vacuum_degassing=bool(data.get("vacuum_degassing", True)),
        )

        env = LunarEnvironmentConfig(
            surface_temp_k=float(data.get("surface_temp_k", 180.0)),
            gravity_m_s2=float(data.get("gravity_m_s2", 1.622)),
        )

        # 3. Simulate
        res = twin_engine.simulate(batch=batch, params=params, env=env)

        return jsonify({
            "success": True,
            "result": {
                "batch_name": res.batch_name,
                "technology": res.technology.value,
                "input_mass_kg": res.input_mass_kg,
                "solid_product_mass_kg": res.solid_product_mass_kg,
                "gas_volatiles_mass_kg": res.gas_volatiles_mass_kg,
                "recovered_water_kg": res.recovered_water_kg,
                "residual_char_mass_kg": res.residual_char_mass_kg,
                "mass_recovery_yield_pct": res.mass_recovery_yield_pct,
                "total_energy_consumed_kwh": res.total_energy_consumed_kwh,
                "specific_energy_kwh_per_kg": res.specific_energy_kwh_per_kg,
                "process_duration_hours": res.process_duration_hours,
                "end_products": res.end_products,
                "lunar_feasibility_score": res.lunar_feasibility_score,
                "trl_level": res.trl_level,
                "launch_cost_savings_usd": res.launch_cost_savings_usd,
                "hazard_mitigation_score": res.hazard_mitigation_score,
                "telemetry_timeline": res.telemetry_timeline,
            }
        })

    except DomainError as err:
        return jsonify({"success": False, "error": err.message, "code": err.code}), 400
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc), "trace": traceback.format_exc()}), 500


@api_bp.route("/scan-resume", methods=["POST"])
def scan_resume() -> Any:
    """
    Analyze resume content against NASA Aerospace & LunaRecycle Challenge rubric.
    """
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    target_role = data.get("target_role", "NASA LunaRecycle Challenge Systems Lead")

    if not text.strip():
        return jsonify({"success": False, "error": "Resume text is empty."}), 400

    try:
        report = resume_scanner.scan_resume(text=text, target_role=target_role)

        return jsonify({
            "success": True,
            "report": {
                "candidate_name": report.candidate_name,
                "overall_match_score": report.overall_match_score,
                "ats_compatibility_score": report.ats_compatibility_score,
                "luna_challenge_alignment_score": report.luna_challenge_alignment_score,
                "rubric_scores": report.rubric_scores,
                "matched_keywords": report.matched_keywords,
                "missing_critical_keywords": report.missing_critical_keywords,
                "strengths": report.strengths,
                "gap_remediations": report.gap_remediations,
                "tailored_bullet_points": report.tailored_bullet_points,
                "university_of_alabama_notes": report.university_of_alabama_notes,
                "competencies": [
                    {
                        "category": c.category,
                        "name": c.competency_name,
                        "score_pct": c.score_pct,
                        "matched": c.matched_keywords,
                        "missing": c.missing_keywords,
                        "feedback": c.feedback,
                    }
                    for c in report.competencies
                ]
            }
        })
    except DomainError as err:
        return jsonify({"success": False, "error": err.message, "code": err.code}), 400
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@api_bp.route("/generate-submission", methods=["POST"])
def generate_submission() -> Any:
    """
    Generate formal NASA / University of Alabama proposal package.
    """
    data = request.get_json(silent=True) or {}
    project_title = data.get("project_title", "LunaRecycle-OS: Autonomous Closed-Loop Lunar Waste Processor")
    team_name = data.get("team_name", "Aegis Lunar ISRU Team")
    lead_author = data.get("lead_author", "Lead Systems Engineer")
    track = data.get("track", "Phase 1: Digital Twin & Phase 2: Integrated Prototype")

    try:
        # Run baseline simulation for benchmarks
        batch = DigitalTwinEngine.create_artemis_30day_crew_batch()
        sim_res = twin_engine.simulate(batch=batch)

        # Scan sample profile if resume text provided
        resume_text = data.get("resume_text", "")
        scan_rep = resume_scanner.scan_resume(resume_text) if resume_text.strip() else None

        dossier = SubmissionGenerator.generate_dossier(
            project_title=project_title,
            team_name=team_name,
            lead_author=lead_author,
            track=track,
            simulation_result=sim_res,
            scan_report=scan_rep,
        )

        markdown_content = SubmissionGenerator.export_markdown(dossier)

        return jsonify({
            "success": True,
            "dossier": {
                "project_title": dossier.project_title,
                "team_name": dossier.team_name,
                "lead_author": dossier.lead_author,
                "track": dossier.track,
                "executive_summary": dossier.executive_summary,
                "system_architecture": dossier.system_architecture,
                "physics_thermal_narrative": dossier.physics_thermal_narrative,
                "swap_c_budget": dossier.swap_c_budget,
                "safety_hazard_analysis": dossier.safety_hazard_analysis,
                "simulation_benchmarks": dossier.simulation_benchmarks,
                "candidate_qualifications_summary": dossier.candidate_qualifications_summary,
                "compliance_rubric_checklist": dossier.compliance_rubric_checklist,
            },
            "markdown": markdown_content,
        })
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)}), 500


@api_bp.route("/sample-resume", methods=["GET"])
def get_sample_resume() -> Any:
    """Return preloaded sample NASA aerospace resume."""
    sample_text = """ALEXANDER V. MERCER
Huntsville, AL | (256) 555-0194 | a.mercer@alumni.ua.edu | linkedin.com/in/avmercer-aerospace
U.S. Citizen | Security Clearance: Secret Eligible

PROFESSIONAL OBJECTIVE
Senior Aerospace Systems Engineer seeking to lead the NASA LunaRecycle Challenge Phase 2 demonstration in partnership with The University of Alabama, delivering autonomous closed-loop solid waste recycling, ISRU polymer regolith sintering, and digital twin simulation systems for Artemis lunar infrastructure.

EDUCATION
Master of Science in Aerospace Engineering, Focus: Space Propulsion & ISRU Materials
The University of Alabama, Tuscaloosa, AL | GPA: 3.92 / 4.00
Bachelor of Science in Mechanical Engineering, Minor in Computer Science
Auburn University, Auburn, AL | Magna Cum Laude

CORE COMPETENCIES & TECHNICAL SKILLS
• Space Domain: In-Situ Resource Utilization (ISRU), ECLSS Closed-Loop Systems, Lunar Regolith Beneficiation, Thermal Vacuum (T-Vac) Testing, Microgravity Fluidics (0.166g)
• Materials & Processing: Thermoplastic Extrusion, Polymer Pyrolysis, Regolith Sintering, 3D Additive Manufacturing (FDM/FFF), Outgassing Characterization (ASTM E595)
• Systems Engineering: NASA SP-2016-6105, ConOps Development, SWaP-C Optimization, FMEA / Hazard Analysis, Requirements Verification & Validation (V&V), TRL Progression
• Digital Twin & Software: Python (NumPy, SciPy), MATLAB/Simulink, Ansys Thermal FEA, SolidWorks, Sensor Telemetry Fusion, Anomaly Detection Algorithms

PROFESSIONAL EXPERIENCE
Senior Systems & ISRU Research Engineer | Cislunar Advanced Systems Inc., Huntsville, AL | 2023 – Present
• Spearheaded systems engineering and physics-based digital twin modeling for a 50 kg/month lunar waste recycling unit, achieving 93.5% mass recovery efficiency and reducing specific power to 0.92 kWh/kg.
• Executed thermal-vacuum finite element analyses simulating extreme lunar surface diurnal cycles (-130°C to +120°C), eliminating thermal runaway risks in high-temperature polymer extrusion barrels.
• Formulated novel sintered regolith-thermoplastic composite formulation (75% Lunar Highlands simulant, 25% waste polymer film), producing interlocking radiation shielding tiles with 38 MPa compressive strength.
• Directed SWaP-C trade studies for NASA Artemis habitation outfitting, projecting $1.85M in Earth-to-Moon launch payload mass savings per 180-day crew mission.

Graduate Research Assistant | Space Technologies & Materials Lab, University of Alabama | 2021 – 2023
• Collaborated with NASA Marshall Space Flight Center (MSFC) on closed-loop life support (ECLSS) solid waste gasification, recovering 98% moisture from organic crew packaging.
• Built automated sensor telemetry pipeline in Python/Simulink to monitor off-gas pressure spikes during vacuum degassing, increasing process autonomy and lowering astronaut crew intervention to <0.05 hrs/kg.
• Authored 3 peer-reviewed conference publications (AIAA SciTech, ASCEND) on autonomous ISRU manufacturing and microgravity thermoplastic rheology.

AWARDS & CERTIFICATIONS
• Winner, University of Alabama College of Engineering Space Innovation Grant (2023)
• NASA Systems Engineering Certificate of Excellence (NASA SP-2016-6105 compliant)
• Certified SolidWorks Professional (CSWP) & INCOSE ASEP Candidate
"""
    return jsonify({"sample_resume": sample_text})
