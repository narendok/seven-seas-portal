+----------------------------------------------------------------------------------------------------+
| XYZ Pvt Ltd                              Department: Quality Assurance (QA)       |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 / ISO 16750 / AIS140|
+----------------------------------------------------------------------------------------------------+
| Document Title : Design Verification Plan and Report (DVP&R)                                       |
| Document ID    : HLPL-SLCT-QA-DVP-01                      Issue Date  : 14-Jul-2026                |
| Project Code   : HLPL-SLCT-01 (Telematics Gateway)        Revision    : 01 (Final Approval)        |
| Client Target  : Tata Motors EV & Fleet Division          Test Facility: ARAI & HLPL Reliability Lab|
| Status         : All Tests Cleared (PASS)                 TAC Ref No  : ARAI/TAC/2026/AIS140-842   |
+----------------------------------------------------------------------------------------------------+

## 1. Executive Summary & Regulatory Clearance
The Design Verification Plan & Report (DVP&R) documents the environmental, electrical transient, electromagnetic compatibility (EMC/EMI), and telematics regulatory compliance testing for **HLPL-SLCT-01**. 

All 24 mandatory test profiles were completed with **ZERO critical defects**. The Automotive Research Association of India (ARAI) has officially issued Type Approval Certificate (TAC) **#ARAI/TAC/2026/AIS140-842** under AIS-140 Amendment 2.

---

## 2. Comprehensive Test Verification Matrix

| Test ID | Test Category & Standard | Environmental Profile / Applied Condition | Sample Size | Acceptance Criteria | Observed Result | Status |
|:---:|---|---|:---:|---|---|:---:|
| **DV-01** | High Temperature Endurance (ISO 16750-4) | +85°C continuous operation for 500 hours | 10 units | Zero functional reset, continuous 4G ping | Continuous uptime 500h, 0 packet loss | **PASS** |
| **DV-02** | Low Temperature Cold Soak (ISO 16750-4) | -40°C soak for 72 hours, cold start at -40°C | 10 units | Boots within 15 seconds, GNSS lock <45s | Boot: 8.2s, GNSS lock: 29.4s | **PASS** |
| **DV-03** | Thermal Shock Cycling (IEC 60068-2-14) | -40°C to +85°C (100 cycles, transition <10s) | 5 units | No microcracks on BGA/QFN, zero solder fatigue | Cross-section dye & pry: 0 fatigue | **PASS** |
| **DV-04** | ISO 7637-2 Electrical Transient Pulse 1 | -100V, 2ms, 5000 pulses on 12V/24V power line | 5 units | Class A (normal operation during test) | TVS clamped peak to -0.7V | **PASS** |
| **DV-05** | ISO 7637-2 Electrical Transient Pulse 2a | +50V, 50µs, 5000 pulses | 5 units | Class A | No reboot or brownout observed | **PASS** |
| **DV-06** | ISO 7637-2 Electrical Transient Pulse 3a/b | ±150V, 100ns, 1 hour duration | 5 units | Class A | Continuous CAN data logging | **PASS** |
| **DV-07** | ISO 7637-2 Electrical Transient Pulse 5b | +100V Load Dump (400ms pulse width) | 5 units | Class B (clamps safely, auto-recovers) | Clamped at 41.8V, zero component damage | **PASS** |
| **DV-08** | Electrostatic Discharge (ISO 10605) | ±15 kV Air Discharge, ±8 kV Contact Discharge | 5 units | Zero latch-up, memory preservation | 10 pulses per point; 0 latch-ups | **PASS** |
| **DV-09** | Random Vibration & Endurance (ISO 16750-3)| 10Hz–2000Hz, 3.2G RMS, 32 hrs per axis (X,Y,Z) | 5 units | Zero mechanical crack, continuous logging | Intact housing, solder joints nominal | **PASS** |
| **DV-10** | Ingress Protection Sealing (ISO 20653) | IP67: 1 meter water immersion for 30 minutes | 5 units | Zero water ingress into internal PCBA chamber | Post-test inspection: dry chamber (0ml) | **PASS** |
| **DV-11** | AIS-140 Emergency SOS Alert Protocol | Physical SOS button press while driving | 10 units | Instant emergency packet with lat/long <2s | Packet delivered to state backend in 1.1s| **PASS** |
| **DV-12** | NavIC + GPS Dual GNSS Accuracy | Open sky & urban canyon driving benchmarks | 10 units | Horizontal accuracy < 2.5m CEP | Measured 1.8m CEP in Delhi-NCR drive | **PASS** |

---

## 3. Regulatory Certification & Type Approval
- **Certifying Authority**: Automotive Research Association of India (ARAI), Pune.
- **Certificate Number**: `ARAI/TAC/2026/AIS140-842`
- **Standard Reference**: AIS-140 (Rev 2) - Intelligent Transportation Systems.
- **Status**: **GRANTED (Valid Nationwide)**.

---

## 4. Quality Sign-Off & Release Gate Clearance
- **Reliability Test Lead**: Ananya Sen (QA Reliability Engineer) · 14-Jul-2026
- **Quality Assurance Head**: Jordan Blake (QA Lead) · 15-Jul-2026
- **OEM Technical Representative**: Dr. K. Ramanathan (Tata Motors EV Platform) · 16-Jul-2026
