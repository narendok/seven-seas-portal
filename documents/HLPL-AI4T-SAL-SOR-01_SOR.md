+----------------------------------------------------------------------------------------------------+
| XYZ Pvt Ltd                              Department: Sales & Commercial           |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 Cl 8.2 / AIS-140    |
+----------------------------------------------------------------------------------------------------+
| Document Title : Customer Statement of Requirements (SOR) - Inbound Intake                         |
| Document ID    : HLPL-AI4T-SAL-SOR-01                     Issue Date  : 05-May-2026                |
| Project Code   : HLPL-AI4T-01 (Intelligent 4G Telematics) Revision    : 01                         |
| Customer Name  : Tata Motors Commercial Vehicle Fleet     RFQ Reference: RFQ-2026-TATA-AI4T-088    |
| Target Platform: Tata Ace EV & Ultra Electric Fleet       Classification : OEM Confidential        |
| Originating Hub: Sales & Business Development (SAL)       Responsible : Riley Stone (Sales Lead)   |
+----------------------------------------------------------------------------------------------------+

## 1. Customer Origin & Commercial Scope
This requirement originates directly from **Sales & Business Development (SAL)** following customer technical consultation and RFQ intake `RFQ-2026-TATA-AI4T-088`:
- **Product Identification**: AIS-140 Intelligent 4G Telematics Tracker (Project Code: **`AI4T`** / `HLPL-AI4T-01`).
- **Target Volume**: 50,000 units/year (Tier 4 volume production).
- **Target Delivery SOP**: Q4 2026 (Mass Production Line Delivery).
- **Mutual Non-Disclosure Agreement**: Bilaterally signed and locked under `HLPL-AI4T-SAL-mNDA-01`.

---

## 2. Customer Technical Requirements Matrix (SOR)

| Domain | Requirement Description | Target Specification | Applicable Automotive Standard |
|---|---|---|:---:|
| **Power Supply** | Automotive battery feed with cold cranking & reverse polarity | 12V / 24V nominal (operating: 9V–36V), cold crank dip to 6V | ISO 7637-2 / ISO 16750-2 |
| **Cellular Engine** | 4G LTE-M / NB-IoT with 2G fallback & eSIM footprint | Bands 1, 3, 5, 8 (India band plan) with TLS 1.3 telemetry | AIS-140 Amendment 2 |
| **GNSS Positioning** | Concurrent multi-constellation satellite fix with NavIC | NavIC (L5) + GPS (L1C/A) + GLONASS, TTFF < 30s cold start | MoRTH / AIS-140 Rev 2 |
| **Vehicle Buses** | Dual CAN interfaces for drivetrain & OBD-II telemetry | 2x CAN 2.0B / CAN-FD channels, 250kbps & 500kbps baud | SAE J1939 / ISO 11898 |
| **Motion Sensing** | Harsh acceleration, harsh braking, rollover event detection | 6-Axis Accelerometer & Gyroscope (automotive grade) | AIS-140 Driver Behavior |
| **Emergency SOS** | Dedicated illuminated emergency panic button & alert packet | Physical switch with status LED, emergency packet < 2 sec | AIS-140 Clause 4.2 |
| **Internal Backup** | Uninterrupted tracking upon main battery disconnect | Rechargeable Li-Polymer battery (>= 1000mAh, >= 6h backup)| UN 38.3 / AIS-140 |
| **Environmental** | Dust and high-pressure water ingress resistance | IP67 sealed enclosure, -40°C to +85°C operating range | ISO 20653 / IEC 60529 |
| **Target Unit BOM** | High-volume production target unit BOM cost | Target: <= $38.50 | Commercial Contract Target |

---

## 3. Automated System Dispatch & Feasibility Trigger
Upon submission of this SOR and bilateral execution of `HLPL-AI4T-SAL-mNDA-01`, the system **automatically triggers Cross-Department Feasibility Analysis**:
1. Dispatches formal review tickets to all 5 engineering and operational HODs:
   - Embedded Hardware (`EHW`): Avery Vale
   - Firmware & Software (`ESW`): Devon Lane
   - Mechanical Engineering (`MECH`): Samira Holt
   - Purchasing & Supply Chain (`PUR`): Morgan Reed
   - Quality Assurance (`QA`): Jordan Blake
2. Initializes the central Contract Review Record (`HLPL/F/MKT/01`) in the database.
3. Automatically locks subsequent engineering stages until 100% feasibility sign-offs are logged.
