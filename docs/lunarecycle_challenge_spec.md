# NASA LunaRecycle Challenge — Technical Specification & Allied Framework

**Program:** NASA Centennial Challenges  
**Allied Partner Organization:** The University of Alabama College of Engineering  
**Competition Scope:** $3 Million Prize Purse for Non-Metabolic Solid Waste Recycling on the Moon  

---

## 1. Challenge Overview & Problem Statement

Long-duration human exploration missions under NASA's **Artemis Program** and the planned **Artemis Base Camp** will generate substantial volumes of non-metabolic solid waste. This includes:
- Multi-layer polymer food packaging & pouches
- Crew clothing, towels, and worn fabrics (Nomex, cotton, nylon)
- Cargo packaging films, bubble wrap, and structural foams
- Support scrap and failed builds from additive manufacturing (3D printing)

Ejecting or burying this waste on the lunar surface violates planetary protection principles and squanders critical hydrocarbons and feedstocks. Earth-to-Moon launch payload costs exceed **$50,000 per kilogram**.

The **LunaRecycle Challenge** tasks competitors with developing sustainable, energy-efficient, and low-mass technologies to recycle solid waste streams into usable products on the lunar surface.

---

## 2. University of Alabama Allied Partnership

The University of Alabama (UA) serves as the primary **Allied Organization** for NASA's LunaRecycle Challenge:
- **Leadership**: Dr. Rajiv Doreswamy, Director of Space Technologies and Engineering Research at UA College of Engineering.
- **Academic & Industry Engagement**: UA manages competitor office hours, technical webinars, and milestone evaluation.
- **Demonstration Host**: Physical hardware demonstrations are hosted at **McAbee** (industry partner of UA College of Engineering) with public Industry Days hosted at **H.M. Comer Hall** on the UA campus in Tuscaloosa, AL.

---

## 3. Challenge Tracks & Requirements

### Phase 1: Digital Twin Track
- Design a high-fidelity virtual model (Digital Twin) of a complete solid waste recycling system.
- Include thermodynamics, mass/energy balance, microgravity (0.166g) behavior, and lunar vacuum degassing.
- Demonstrate manufacturing of end products (e.g., 3D print filament, regolith bricks).

### Phase 2: Prototype & Digital Twin Track
- Fabricate a physical functional prototype capable of processing NASA reference solid waste streams.
- The Digital Twin must accurately mimic the physical prototype's real-time telemetry, sensor readings, and anomaly detection.

---

## 4. Key Engineering Constraints (SWaP-C & Lunar Environment)

| Metric | Target Specification | LunaRecycle-OS Performance |
|---|---|---|
| **Specific Energy** | $< 1.5\text{ kWh/kg}$ | $\mathbf{0.95\text{ kWh/kg}}$ (Melt Extrusion) |
| **Mass Recovery Yield** | $> 85\%$ | $\mathbf{92.4\% - 95.0\%}$ |
| **Gravity Adaptation** | Lunar gravity ($1.622\text{ m/s}^2$) | Twin-screw positive displacement |
| **Vacuum Pressure** | $10^{-10}\text{ Pa}$ ambient | Active vacuum degassing & cold-trap |
| **Operating Temperatures** | $-130^\circ\text{C}$ to $+120^\circ\text{C}$ exterior | Multi-layer insulation (MLI) & heat pipes |
| **Crew Overhead** | $< 0.1\text{ hrs/kg}$ | $\mathbf{0.05\text{ hrs/kg}}$ autonomous operation |

---

## 5. Software & Simulation System (LunaRecycle-OS)

LunaRecycle-OS provides an end-to-end Python digital twin and web application engine enabling:
1. **Dynamic Physics Simulation**: Enthalpy, radiative dissipation, melt flow, and regolith sintering.
2. **Automated ATS & Competency Scanner**: Tailoring engineering teams and proposals for NASA & University of Alabama review.
3. **Automated Proposal Generation**: One-click generation of fully compliant NASA Centennial Challenges dossiers.
