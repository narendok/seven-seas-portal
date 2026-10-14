+----------------------------------------------------------------------------------------------------+
| HEXENSE LABS PRIVATE LIMITED                              Department: Embedded Hardware (EHW)      |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 / AEC-Q100 / AIS-140|
+----------------------------------------------------------------------------------------------------+
| Document Title : Product Requirement Specification (PRS)                                          |
| Document ID    : HLPL-SLCT-EHW-PRS-02                     Issue Date  : 02-Jun-2026                |
| Project Code   : HLPL-SLCT-01 (Telematics Gateway)        Revision    : 02                         |
| Client Target  : Tata Motors EV & Fleet Division          Classification : OEM Confidential        |
| Status         : Baseline Frozen (Approved)               Owner       : Hardware Engineering Team  |
+----------------------------------------------------------------------------------------------------+

## Revision History
| Rev | Date | Section | Description of Change | Author | Approver |
|:---:|:---:|:---:|---|---|---|
| **00** | 10-May-2026 | All | Initial Engineering Draft | Avery Vale | Dr. Alok Ranjan |
| **01** | 20-May-2026 | Sec 3.2 | Added ISO 7637-2 Pulse 5b centralized TVS clamp | Avery Vale | Dr. Alok Ranjan |
| **02** | 02-Jun-2026 | Sec 4.1 | Dual-source hybrid footprint for cellular modem (ECN-002) | Avery Vale | Dr. Alok Ranjan |

---

## 1. System Architecture Overview
The **HLPL-SLCT-01** is a high-reliability, automotive telematics and IoT tracking unit engineered for continuous operational logging, remote vehicle diagnostics, real-time CAN bus telemetry, and automated emergency notification under government mandate **AIS-140**.

```text
[12V/24V Battery] ---> [ISO 7637-2 Surge & TVS] ---> [Automotive Buck AXP2101] ---> 3.3V / 1.8V Rails
                              |
[Vehicle CAN Buses] ---> [Dual CAN TJA1051T/3] ---> [STM32G0B1VET6 64MHz MCU] <---> [Quectel EC200U 4G LTE]
                              |                                  |                         |
[NavIC / GPS Antenna] -> [u-blox MAX-M10S]                 [ST 6-Axis IMU]          [Internal 1000mAh LiPo]
```

---

## 2. Electrical Specifications

| Parameter | Specification | Tolerance / Condition |
|---|---|---|
| **Nominal Operating Voltage** | 12.0 VDC / 24.0 VDC | Auto-detecting dual-range |
| **Operating Voltage Range** | 9.0 VDC to 36.0 VDC | Continuous operation |
| **Cranking Undervoltage** | Withstands dip to 6.0 VDC for 100ms | Cold cranking profile |
| **Overvoltage / Load Dump** | Clamped at 42.0 VDC | ISO 7637-2 Pulse 5b (up to 100V, 400ms) |
| **Current Consumption (Active)** | 85 mA @ 12V | GNSS tracking + 4G transmitting |
| **Current Consumption (Sleep)** | < 2.5 mA @ 12V | Accelerometer wake-up active |
| **Internal Backup Battery** | 3.7V 1000mAh Li-Polymer | 6 hours operational autonomy on disconnect |

---

## 3. Communication & Peripheral Interfaces
1. **Cellular Connectivity**: 4G LTE Cat-1 (Bands 1, 3, 5, 8) with 2G fallback (900/1800MHz). Dual-slot nano-SIM / M2M eSIM footprint.
2. **Satellite Positioning**: Concurrent multi-constellation GNSS (GPS, NavIC, GLONASS, Galileo) with -167dBm tracking sensitivity.
3. **Vehicle Buses**: 2x CAN 2.0B / CAN-FD interfaces supporting ISO 11898-2 and SAE J1939.
4. **Motion Sensing**: 6-degree-of-freedom inertial measurement unit (IMU) for harsh braking, rapid acceleration, sharp cornering, and rollover event detection.
5. **Physical I/O**:
   - 4x Opto-isolated digital inputs (Ignition sense, SOS emergency switch, Door status, PTO input).
   - 2x High-side protected outputs (up to 2A continuous, overload/short-circuit protected).
   - 1x RS-485 differential bus for ultrasonic fuel level sensors.

---

## 4. Mechanical & Environmental Standards
- **Enclosure**: Flame-retardant Bayer Makrolon ABS/PC blend, UL94-V0 rated.
- **Ingress Protection**: IP67 compliant (immersion in 1m water for 30 minutes).
- **Thermal Envelope**: Operating: -40°C to +85°C; Storage: -40°C to +105°C.
- **Vibration & Shock**: ISO 16750-3 Random Vibration (10Hz–2000Hz, 32 hours per axis) & 50G half-sine shock.
- **Regulatory Qualification**: ARAI / ICAT Type Approval per AIS-140 Amendment 2.
