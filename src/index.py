"""
src/index.py — LunaRecycle-OS Unified Application Entry Point.

Supports:
- Web GUI Server: python src/index.py --web [--port 8080]
- Headless Simulation: python src/index.py --simulate [--scenario artemis_30day_crew4]
- NASA Resume Scanner: python src/index.py --scan-resume <path/to/resume.txt>
- Proposal Generator: python src/index.py --generate-submission [--out proposal.md]
"""

from __future__ import annotations

import argparse
import os
import sys
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Ensure workspace root is in sys.path
_workspace_root = str(Path(__file__).resolve().parent.parent)
if _workspace_root not in sys.path:
    sys.path.insert(0, _workspace_root)

from src.core.models import ProcessTechnology
from src.core.services import DigitalTwinEngine, NASAApplicationScanner
from src.core.submission_generator import SubmissionGenerator
from src.utils.config import load_config
from src.utils.logging import configure_logging


def print_banner() -> None:
    banner = """
==============================================================================
  LUNARECYCLE-OS | NASA Centennial Challenges & University of Alabama Suite
  Autonomous Closed-Loop Lunar Solid Waste Recycling & Application Engine
==============================================================================
"""
    print(banner)


def run_cli_simulation(scenario_key: str = "artemis_30day_crew4") -> int:
    print_banner()
    engine = DigitalTwinEngine()
    scenarios = DigitalTwinEngine.get_reference_scenarios()

    if scenario_key not in scenarios:
        print(f"[ERROR] Unknown scenario '{scenario_key}'. Available: {list(scenarios.keys())}")
        return 1

    batch = scenarios[scenario_key]
    print(f">> Loading Scenario: {batch.name}")
    print(f"   * Mission Context: {batch.mission_context}")
    print(f"   * Total Solid Waste Input: {batch.total_mass_kg:.2f} kg ({len(batch.items)} items)")

    res = engine.simulate(batch=batch)

    print("\n==============================================================================")
    print("                      LUNAR DIGITAL TWIN SIMULATION RESULTS                   ")
    print("==============================================================================")
    print(f"   * Technology:              {res.technology.value}")
    print(f"   * Input Mass Processed:    {res.input_mass_kg:.2f} kg")
    print(f"   * Solid Product Yield:     {res.solid_product_mass_kg:.2f} kg")
    print(f"   * Mass Recovery Yield:     {res.mass_recovery_yield_pct:.1f}%")
    print(f"   * Specific Energy:         {res.specific_energy_kwh_per_kg:.2f} kWh/kg")
    print(f"   * Total Energy Consumed:   {res.total_energy_consumed_kwh:.2f} kWh")
    print(f"   * Process Duration:        {res.process_duration_hours:.2f} hours")
    print(f"   * Lunar Feasibility Score: {res.lunar_feasibility_score:.1f} / 100.0 (TRL {res.trl_level})")
    print(f"   * Est. Launch Cost Offset: ${res.launch_cost_savings_usd:,.2f} USD")
    print("------------------------------------------------------------------------------")
    print("   Manufactured Lunar Assets:")
    for k, v in res.end_products.items():
        print(f"     - {k.replace('_', ' ').title()}: {v}")
    print("==============================================================================\n")
    return 0


def run_cli_resume_scan(resume_path: str) -> int:
    print_banner()
    path = Path(resume_path)
    if not path.is_file():
        print(f"[ERROR] Resume file not found: {resume_path}")
        return 1

    content = path.read_text(encoding="utf-8")
    scanner = NASAApplicationScanner()

    print(f">> Scanning Resume: {path.name}")
    report = scanner.scan_resume(content)

    print("\n==============================================================================")
    print(f"         NASA & LUNARECYCLE RESUME AUDIT: {report.candidate_name.upper()}     ")
    print("==============================================================================")
    print(f"   * Overall NASA Match Score:       {report.overall_match_score:.1f}%")
    print(f"   * Aerospace ATS Score:            {report.ats_compatibility_score:.1f}%")
    print(f"   * LunaRecycle Challenge Fit:      {report.luna_challenge_alignment_score:.1f}%")
    print("------------------------------------------------------------------------------")
    print("   NASA Competency Breakdown:")
    for c in report.competencies:
        print(f"     [{c.score_pct:5.1f}%] {c.competency_name}")
    print("------------------------------------------------------------------------------")
    print(f"   Matched Aerospace Keywords ({len(report.matched_keywords)}):")
    print(f"     {', '.join(report.matched_keywords[:12])}")
    print("\n   Missing Recommended Keywords:")
    print(f"     {', '.join(report.missing_critical_keywords[:8])}")
    print("------------------------------------------------------------------------------")
    print("   Tailored NASA STAR-Formatted Bullet Suggestions:")
    for bullet in report.tailored_bullet_points:
        print(f"     {bullet}")
    print("\n   University of Alabama Endorsement Note:")
    print(f"     {report.university_of_alabama_notes}")
    print("==============================================================================\n")
    return 0


def run_cli_generate_submission(out_path: str | None = None) -> int:
    print_banner()
    print(">> Compiling official NASA & University of Alabama Submission Proposal...")
    batch = DigitalTwinEngine.create_artemis_30day_crew_batch()
    res = DigitalTwinEngine().simulate(batch)
    dossier = SubmissionGenerator.generate_dossier(simulation_result=res)
    md = SubmissionGenerator.export_markdown(dossier)

    if out_path:
        Path(out_path).write_text(md, encoding="utf-8")
        print(f"[OK] Submission dossier successfully written to: {out_path}")
    else:
        print("\n" + md)
    return 0


def start_web_server(host: str = "127.0.0.1", port: int = 8080) -> int:
    print_banner()
    from src.web.app import create_app
    app = create_app()
    print(f"[*] LunaRecycle-OS Web Server running at: http://{host}:{port}")
    print("    Press Ctrl+C to stop.")
    app.run(host=host, port=port, debug=False)
    return 0


def main() -> int:
    config = load_config()
    configure_logging(level=config.log_level)

    parser = argparse.ArgumentParser(
        description="LunaRecycle-OS: NASA Centennial Challenges & University of Alabama Suite"
    )
    parser.add_argument("--web", "-w", action="store_true", help="Start web dashboard server")
    parser.add_argument("--host", default="127.0.0.1", help="Web server host interface (default: 127.0.0.1)")
    parser.add_argument("--port", "-p", type=int, default=8080, help="Web server port (default: 8080)")
    parser.add_argument("--simulate", "-s", action="store_true", help="Run lunar physics simulation in CLI")
    parser.add_argument("--scenario", default="artemis_30day_crew4", help="Scenario preset key")
    parser.add_argument("--scan-resume", "-r", type=str, help="Path to resume file to scan")
    parser.add_argument("--generate-submission", "-g", action="store_true", help="Generate full submission proposal")
    parser.add_argument("--out", "-o", type=str, help="Output file path for generated proposal")

    args = parser.parse_args()

    if args.simulate:
        return run_cli_simulation(args.scenario)
    elif args.scan_resume:
        return run_cli_resume_scan(args.scan_resume)
    elif args.generate_submission:
        return run_cli_generate_submission(args.out)
    elif args.web:
        return start_web_server(host=args.host, port=args.port)
    else:
        # Default behavior: run simulation baseline, then launch web server
        run_cli_simulation("artemis_30day_crew4")
        return start_web_server(host=args.host, port=args.port)


if __name__ == "__main__":
    sys.exit(main())
