/**
 * LunaRecycle-OS — Frontend Application Engine
 * NASA Centennial Challenges & University of Alabama Suite
 */

document.addEventListener("DOMContentLoaded", () => {
    initAuthPortal();
    initTabs();
    initSimulationControls();
    initResumeScanner();
    initSubmissionDossier();

    // Run initial baseline simulation
    runSimulation();
});

/* ─────────────────────────────────────────────────────────────
   0. Obscure Loading & Classified Sign-In Gateway
   ───────────────────────────────────────────────────────────── */
function initAuthPortal() {
    const overlay = document.getElementById("obscure-auth-overlay");
    const btnAuth = document.getElementById("btn-authenticate-portal");
    const btnLock = document.getElementById("btn-lock-screen");
    const terminalLogs = document.getElementById("auth-terminal-logs");

    if (!overlay || !btnAuth) return;

    btnAuth.addEventListener("click", () => {
        btnAuth.disabled = true;
        btnAuth.innerHTML = "<span>⏳ DECRYPTING ACCESS TOKENS...</span>";

        const extraLine = document.createElement("p");
        extraLine.className = "log-line text-green";
        extraLine.textContent = `[AUTH_SUCCESS] Session Established: ${new Date().toISOString()} // 0.166G DIGITAL TWIN ACTIVE`;
        terminalLogs.appendChild(extraLine);

        setTimeout(() => {
            overlay.classList.add("hidden");
            btnAuth.disabled = false;
            btnAuth.innerHTML = "<span>⚡ ENTER MISSION COMMAND DASHBOARD</span>";
        }, 600);
    });

    if (btnLock) {
        btnLock.addEventListener("click", () => {
            overlay.classList.remove("hidden");
        });
    }
}

/* ─────────────────────────────────────────────────────────────
   1. Tab Navigation
   ───────────────────────────────────────────────────────────── */
function initTabs() {
    const tabs = document.querySelectorAll(".nav-tab");
    const panes = document.querySelectorAll(".tab-pane");

    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            panes.forEach(p => p.classList.remove("active"));

            tab.classList.add("active");
            const targetPane = document.getElementById(tab.dataset.tab);
            if (targetPane) {
                targetPane.classList.add("active");
            }
        });
    });
}

/* ─────────────────────────────────────────────────────────────
   2. Digital Twin & Simulation Controller
   ───────────────────────────────────────────────────────────── */
function initSimulationControls() {
    const scenarioSelect = document.getElementById("scenario-select");
    const techSelect = document.getElementById("tech-select");
    const regolithRow = document.getElementById("regolith-row");
    const regolithSlider = document.getElementById("regolith-ratio");
    const regolithVal = document.getElementById("regolith-ratio-val");

    const slidePack = document.getElementById("slide-packaging");
    const slideFab = document.getElementById("slide-fabrics");
    const slideFoam = document.getElementById("slide-foams");

    const valPack = document.getElementById("val-packaging");
    const valFab = document.getElementById("val-fabrics");
    const valFoam = document.getElementById("val-foams");
    const totalMassEl = document.getElementById("total-manifest-mass");

    // Slider updates
    function updateMassLabels() {
        const p = parseFloat(slidePack.value);
        const f = parseFloat(slideFab.value);
        const m = parseFloat(slideFoam.value);
        valPack.textContent = `${p.toFixed(1)} kg`;
        valFab.textContent = `${f.toFixed(1)} kg`;
        valFoam.textContent = `${m.toFixed(1)} kg`;
        const total = (p + f + m).toFixed(1);
        totalMassEl.textContent = `${total} kg Total`;
    }

    [slidePack, slideFab, slideFoam].forEach(slider => {
        slider.addEventListener("input", () => {
            scenarioSelect.value = "custom";
            updateMassLabels();
        });
    });

    // Scenario preset selection
    scenarioSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        if (val === "artemis_30day_crew4") {
            slidePack.value = 8.5;
            slideFab.value = 12.0;
            slideFoam.value = 7.9;
            techSelect.value = "MELT_FILAMENT_EXTRUSION";
        } else if (val === "artemis_base_camp_180day") {
            slidePack.value = 62.0;
            slideFab.value = 72.5;
            slideFoam.value = 38.0;
            techSelect.value = "MELT_FILAMENT_EXTRUSION";
        } else if (val === "regolith_composite_construction") {
            slidePack.value = 30.0;
            slideFab.value = 5.0;
            slideFoam.value = 15.0;
            techSelect.value = "SINTERED_REGOLITH_COMPOSITE";
        }
        updateMassLabels();
        toggleRegolithVisibility();
    });

    // Tech select toggle
    function toggleRegolithVisibility() {
        if (techSelect.value === "SINTERED_REGOLITH_COMPOSITE") {
            regolithRow.style.display = "block";
        } else {
            regolithRow.style.display = "none";
        }
    }
    techSelect.addEventListener("change", toggleRegolithVisibility);

    regolithSlider.addEventListener("input", () => {
        regolithVal.textContent = `${regolithSlider.value}% Regolith / ${100 - regolithSlider.value}% Waste Polymer`;
    });

    // Run Simulation button
    document.getElementById("btn-run-simulation").addEventListener("click", runSimulation);
}

async function runSimulation() {
    const simTag = document.getElementById("sim-status-tag");
    simTag.textContent = "COMPUTING PHYSICS...";
    simTag.className = "badge";

    const scenario = document.getElementById("scenario-select").value;
    const tech = document.getElementById("tech-select").value;
    const temp = parseFloat(document.getElementById("operating-temp").value) || 195;
    const throughput = parseFloat(document.getElementById("throughput-rate").value) || 1.5;
    const power = parseFloat(document.getElementById("power-kw").value) || 1.2;
    const regolithRatio = parseFloat(document.getElementById("regolith-ratio").value) / 100.0;
    const vacuumDegas = document.getElementById("chk-vacuum-degas").checked;

    const payload = {
        technology: tech,
        operating_temp_c: temp,
        throughput_kg_per_hr: throughput,
        power_draw_kw: power,
        regolith_blend_ratio: regolithRatio,
        vacuum_degassing: vacuumDegas,
    };

    if (scenario !== "custom") {
        payload.scenario = scenario;
    } else {
        const p = parseFloat(document.getElementById("slide-packaging").value);
        const f = parseFloat(document.getElementById("slide-fabrics").value);
        const m = parseFloat(document.getElementById("slide-foams").value);
        payload.items = [
            { name: "Packaging Polymers (LDPE/PET)", stream_type: "PACKAGING_POLYMERS", mass_kg: p, polymer_fraction: 0.95, melting_temp_c: 135 },
            { name: "Nomex/Cotton Crew Fabrics", stream_type: "FABRICS_CREW_WEAR", mass_kg: f, polymer_fraction: 0.80, moisture_fraction: 0.15, melting_temp_c: 240 },
            { name: "Structural Dunnage & Foam", stream_type: "STRUCTURAL_FOAMS", mass_kg: m, polymer_fraction: 0.90, melting_temp_c: 180 },
        ];
    }

    try {
        const res = await fetch("/api/simulate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        const data = await res.json();

        if (data.success) {
            renderSimulationResults(data.result);
            simTag.textContent = "SIMULATION CONVERGED (TRL " + data.result.trl_level + ")";
            simTag.className = "badge badge-success";
        } else {
            alert("Simulation Error: " + data.error);
            simTag.textContent = "SIMULATION FAILED";
            simTag.className = "badge";
        }
    } catch (err) {
        console.error(err);
        simTag.textContent = "CONNECTION ERROR";
    }
}

function renderSimulationResults(res) {
    document.getElementById("kpi-yield").textContent = `${res.mass_recovery_yield_pct}%`;
    document.getElementById("kpi-energy").innerHTML = `${res.specific_energy_kwh_per_kg} <small>kWh/kg</small>`;
    document.getElementById("kpi-savings").textContent = `$${(res.launch_cost_savings_usd / 1000000).toFixed(2)}M`;
    document.getElementById("kpi-feasibility").textContent = `${res.lunar_feasibility_score} / 100`;

    // Products breakdown
    const productContainer = document.getElementById("product-breakdown-list");
    productContainer.innerHTML = "";
    for (const [name, val] of Object.entries(res.end_products)) {
        const cleanName = name.replace(/_/g, " ").toUpperCase();
        const chip = document.createElement("div");
        chip.className = "product-chip";
        chip.innerHTML = `
            <div class="p-val">${val}</div>
            <div class="p-name">${cleanName}</div>
        `;
        productContainer.appendChild(chip);
    }

    // Footers
    document.getElementById("metric-crew-time").textContent = `${res.crew_time_total_hours} hrs`;
    document.getElementById("metric-hazard").textContent = `${res.hazard_mitigation_score}% Containment`;
    document.getElementById("metric-duration").textContent = `${res.process_duration_hours} hrs`;

    // Draw Telemetry Chart
    drawTelemetryChart(res.telemetry_timeline);
}

function drawTelemetryChart(timeline) {
    const canvas = document.getElementById("telemetryChart");
    if (!canvas || !timeline || timeline.length === 0) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background grid
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;
    for (let x = 40; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    for (let y = 30; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }

    // Curves
    const padding = 30;
    const plotW = width - (padding * 2);
    const plotH = height - (padding * 2);

    // 1. Temperature Curve (Cyan)
    const maxTemp = Math.max(...timeline.map(t => t.temperature_c), 300);
    const minTemp = Math.min(...timeline.map(t => t.temperature_c), -100);

    ctx.strokeStyle = "#00E5FF";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    timeline.forEach((pt, i) => {
        const x = padding + (i / (timeline.length - 1)) * plotW;
        const normY = (pt.temperature_c - minTemp) / (maxTemp - minTemp || 1);
        const y = height - padding - (normY * plotH);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 2. Processed Mass Curve (Green)
    const maxMass = Math.max(...timeline.map(t => t.processed_mass_kg), 10);
    ctx.strokeStyle = "#00F5A0";
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    timeline.forEach((pt, i) => {
        const x = padding + (i / (timeline.length - 1)) * plotW;
        const normY = pt.processed_mass_kg / (maxMass || 1);
        const y = height - padding - (normY * plotH);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Legend
    ctx.font = "10px Inter, sans-serif";
    ctx.fillStyle = "#00E5FF";
    ctx.fillText("■ Temp (°C)", padding, 15);
    ctx.fillStyle = "#00F5A0";
    ctx.fillText("■ Yield Mass (kg)", padding + 80, 15);
}

/* ─────────────────────────────────────────────────────────────
   3. NASA Resume & Application Scanner Controller
   ───────────────────────────────────────────────────────────── */
function initResumeScanner() {
    const btnLoadSample = document.getElementById("btn-load-sample-resume");
    const btnScan = document.getElementById("btn-scan-resume");
    const resumeInput = document.getElementById("resume-text-input");

    btnLoadSample.addEventListener("click", async () => {
        try {
            const res = await fetch("/api/sample-resume");
            const data = await res.json();
            if (data.sample_resume) {
                resumeInput.value = data.sample_resume;
                scanResume();
            }
        } catch (err) {
            console.error(err);
        }
    });

    btnScan.addEventListener("click", scanResume);
}

async function scanResume() {
    const text = document.getElementById("resume-text-input").value;
    const targetRole = document.getElementById("target-role-select").value;
    const candidateBadge = document.getElementById("scan-candidate-badge");

    if (!text.trim()) {
        alert("Please paste or load a candidate resume to analyze.");
        return;
    }

    candidateBadge.textContent = "SCANNING PROFILE...";

    try {
        const res = await fetch("/api/scan-resume", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, target_role: targetRole })
        });
        const data = await res.json();

        if (data.success) {
            renderScanReport(data.report);
        } else {
            alert("Scan Error: " + data.error);
        }
    } catch (err) {
        console.error(err);
    }
}

function renderScanReport(rep) {
    document.getElementById("scan-candidate-badge").textContent = rep.candidate_name.toUpperCase();
    document.getElementById("gauge-match-val").textContent = `${rep.overall_match_score}%`;
    document.getElementById("gauge-ats-val").textContent = `${rep.ats_compatibility_score}%`;
    document.getElementById("gauge-challenge-val").textContent = `${rep.luna_challenge_alignment_score}%`;

    // Competency Bars
    const compContainer = document.getElementById("competency-bars-container");
    compContainer.innerHTML = "";
    rep.competencies.forEach(c => {
        const div = document.createElement("div");
        div.className = "comp-bar-item";
        div.innerHTML = `
            <div class="comp-bar-header">
                <span>${c.name}</span>
                <span class="text-cyan">${c.score_pct}%</span>
            </div>
            <div class="comp-bar-track">
                <div class="comp-bar-fill" style="width: ${c.score_pct}%"></div>
            </div>
        `;
        compContainer.appendChild(div);
    });

    // Keywords
    const matchKwContainer = document.getElementById("matched-keywords-container");
    matchKwContainer.innerHTML = "";
    rep.matched_keywords.slice(0, 14).forEach(kw => {
        const tag = document.createElement("span");
        tag.className = "tag tag-matched";
        tag.textContent = kw;
        matchKwContainer.appendChild(tag);
    });

    const missKwContainer = document.getElementById("missing-keywords-container");
    missKwContainer.innerHTML = "";
    rep.missing_critical_keywords.slice(0, 8).forEach(kw => {
        const tag = document.createElement("span");
        tag.className = "tag tag-missing";
        tag.textContent = "+ " + kw;
        missKwContainer.appendChild(tag);
    });

    // Bullets
    const bulletsContainer = document.getElementById("tailored-bullets-container");
    bulletsContainer.innerHTML = "<ul>" + rep.tailored_bullet_points.map(b => `<li>${b}</li>`).join("") + "</ul>";

    // UA Endorsement Note
    document.getElementById("ua-notes-text").textContent = rep.university_of_alabama_notes;
}

/* ─────────────────────────────────────────────────────────────
   4. Submission Dossier Controller
   ───────────────────────────────────────────────────────────── */
function initSubmissionDossier() {
    const btnGen = document.getElementById("btn-generate-dossier");
    const btnCopy = document.getElementById("btn-copy-dossier-md");
    const btnPrint = document.getElementById("btn-print-dossier");

    let currentMarkdown = "";

    btnGen.addEventListener("click", async () => {
        const title = document.getElementById("sub-project-title").value;
        const team = document.getElementById("sub-team-name").value;
        const author = document.getElementById("sub-lead-author").value;
        const track = document.getElementById("sub-track").value;
        const resumeText = document.getElementById("resume-text-input").value;

        const previewBox = document.getElementById("dossier-preview-box");
        previewBox.innerHTML = "<div class='loading-state'>Compiling NASA Centennial Challenges Proposal Dossier...</div>";

        try {
            const res = await fetch("/api/generate-submission", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    project_title: title,
                    team_name: team,
                    lead_author: author,
                    track: track,
                    resume_text: resumeText
                })
            });
            const data = await res.json();

            if (data.success) {
                currentMarkdown = data.markdown;
                renderDossierHTML(data.dossier, previewBox);
            } else {
                previewBox.innerHTML = "<div class='error'>Failed to compile submission: " + data.error + "</div>";
            }
        } catch (err) {
            console.error(err);
        }
    });

    btnCopy.addEventListener("click", () => {
        if (!currentMarkdown) {
            alert("Please compile the dossier first.");
            return;
        }
        navigator.clipboard.writeText(currentMarkdown);
        alert("✓ Full NASA Submission Markdown copied to clipboard!");
    });

    btnPrint.addEventListener("click", () => {
        window.print();
    });
}

function renderDossierHTML(d, container) {
    let html = `
        <h1>${d.project_title}</h1>
        <p><strong>NASA Centennial Challenges &bull; Allied Org: The University of Alabama</strong></p>
        <p><em>Track: ${d.track} | Team: ${d.team_name} | PI: ${d.lead_author}</em></p>
        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0;">

        <h2>Executive Summary</h2>
        <p>${d.executive_summary}</p>

        <h2>Size, Weight, Power & Cost (SWaP-C) Allocation</h2>
        <table>
            <thead><tr><th>Parameter</th><th>Target Specification</th></tr></thead>
            <tbody>
    `;

    for (const [k, v] of Object.entries(d.swap_c_budget)) {
        html += `<tr><td><strong>${k}</strong></td><td>${v}</td></tr>`;
    }

    html += `
            </tbody>
        </table>

        <h2>Safety & Lunar Hazard Mitigation Matrix</h2>
        <table>
            <thead><tr><th>Hazard</th><th>Severity</th><th>Flight Mitigation Strategy</th></tr></thead>
            <tbody>
    `;

    d.safety_hazard_analysis.forEach(h => {
        html += `<tr><td><strong>${h.Hazard}</strong></td><td><code>${h.Severity}</code></td><td>${h.Mitigation}</td></tr>`;
    });

    html += `
            </tbody>
        </table>

        <h2>University of Alabama & NASA Rubric Compliance Matrix</h2>
        <table>
            <thead><tr><th>Rubric Requirement</th><th>Status</th><th>Verification Evidence</th></tr></thead>
            <tbody>
    `;

    d.compliance_rubric_checklist.forEach(c => {
        html += `<tr><td><strong>${c.Criterion}</strong></td><td style="color: #00F5A0;">${c.Status}</td><td>${c.Notes}</td></tr>`;
    });

    html += `
            </tbody>
        </table>
    `;

    container.innerHTML = html;
}
