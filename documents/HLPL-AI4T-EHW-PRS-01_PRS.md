+----------------------------------------------------------------------------------------------------+
| XYZ Pvt Ltd                              Department: Embedded Hardware (EHW)      |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 / AEC-Q100 / AIS-140|
+----------------------------------------------------------------------------------------------------+
| Document Title : Product Requirement Specification (PRS) - Auto-Compiled Baseline                  |
| Document ID    : HLPL-AI4T-EHW-PRS-01                     Issue Date  : 26-May-2026                |
| Project Code   : HLPL-AI4T-01 (Intelligent 4G Telematics) Revision    : 01 (Frozen Baseline)       |
| Generation Path: Compiled Automatically from Approved Contract Review (HLPL/F/MKT/01)              |
| Status         : Approved & Frozen Baseline               Owner       : Hardware Engineering Team  |
+----------------------------------------------------------------------------------------------------+

## 1. Automated Generation Traceability
> **SYSTEM COMPILATION AUDIT**: This PRS was automatically compiled and frozen by the SCMS engine upon completion of all 5 technical department feasibility sign-offs on Contract Review Record `HLPL/F/MKT/01`. No manual stage selection or ad-hoc drafting was required.

- **Trigger Event**: Feasibility Clear (EHW, ESW, MECH, PUR, QA approvals complete on 24-May-2026).
- **Originating SOR**: `HLPL-AI4T-SAL-SOR-01` (Tata Motors Commercial RFQ-2026-TATA-AI4T-088).
- **Associated Quotation**: `HLPL-AI4T-SAL-QUO-01` ($41.20/unit, 50,000 units).

---

## 2. Technical Specification Baseline

### 2.1 Power Architecture & Transient Protection
- **Nominal Input**: 12V / 24V DC automotive electrical system.
- **Operating Limits**: 9.0V to 36.0V continuous; withstands cold cranking drop to 6.0V for 100ms.
- **Centralized TVS Clamp**: High-power Vishay automotive TVS diode (`SM8S36CA-E3/2D`, AEC-Q101 qualified, 6600W peak pulse) clamps ISO 7637-2 Pulse 5b load dump below 42.0V.
- **Reverse Polarity**: P-channel MOSFET based ideal diode circuit protects against reverse battery connection down to -36V without fuse blowing.

### 2.2 Processing & Wireless Subsystems
- **Host Controller**: STMicroelectronics `STM32G0B1VET6` (Arm Cortex-M0+, 64MHz, 512KB Flash, 144KB RAM, AEC-Q100 Grade 1 qualified, -40°C to +125°C).
- **Cellular Communications**: Quectel `EC200U-CN` 4G LTE Cat-1 engine with 2G fallback, TCP/UDP/MQTT/TLS 1.3 stacks, embedded M2M eSIM footprint plus micro-SIM slot.
- **Satellite Navigation**: u-blox `MAX-M10S` multi-constellation GNSS receiver (concurrent NavIC L5 + GPS L1C/A + GLONASS, -167dBm tracking, 1.8m CEP accuracy).
- **Inertial Measurement**: ST `ASM330LHHXTR` automotive 6-axis IMU (3-axis accelerometer ±16g, 3-axis gyroscope ±2000dps) for driver behavior & rollover analytics.

### 2.3 Physical Interfaces & Enclosure
- **CAN Bus**: 2x ISO 11898-2 CAN-FD transceivers (`TJA1051T/3`, NXP, AEC-Q100 Grade 0).
- **Digital & Analog I/O**: 4x opto-isolated inputs, 2x 2A high-side smart power switches (`VN7016AJTR`), 1x RS-485 fuel sensor bus.
- **Enclosure Housing**: Bayer Makrolon flame-retardant ABS/PC blend, ultrasonic sealed with liquid silicone perimeter gasket, **IP67 rated**.
- **Internal Battery**: 3.7V 1000mAh Li-Po with dedicated charge IC, NTC thermal monitoring, and 6-hour continuous tracking autonomy.

---

## 3. Engineering Sign-Off & Lifecycle Lock
This frozen baseline unlocks Stage 4 Proof-of-Concept (PoC) and Stage 5 Pilot Build. Any downstream requirement changes must be routed through **Loop 1 Scope Change** (marking PMSS "Under Amendment").

- **Hardware Engineering Lead**: Avery Vale · 26-May-2026
- **Firmware Engineering Lead**: Devon Lane · 26-May-2026
- **Quality Assurance Head**: Jordan Blake · 27-May-2026
