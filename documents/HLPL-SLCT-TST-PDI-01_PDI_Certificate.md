+----------------------------------------------------------------------------------------------------+
| HEXENSE LABS PRIVATE LIMITED                              Department: Production Testing & PDI     |
| DOCUMENT CONTROL HEADER                                   Standard: IATF 16949 / AIS-140 TAC       |
+----------------------------------------------------------------------------------------------------+
| Document Title : Pre-Dispatch Inspection (PDI) & Serialized EOL Test Certificate                   |
| Document ID    : HLPL-SLCT-TST-PDI-01                     Issue Date  : 28-Aug-2026                |
| Project Code   : HLPL-SLCT-01 (Telematics Gateway)        Batch Code  : BATCH-2026-AUG-SLCT-04     |
| Customer Target: Tata Motors EV Commercial Fleet          Inspection  : Final Quality Clearance    |
| Inspection Lot : 500 Serialized Telematics Units          Test Verdict: 100% CONFORMING (PASS)     |
+----------------------------------------------------------------------------------------------------+

## 1. Automated EOL Test Jig Telemetry Summary
Testing executed via Automated EOL Production Jig **`JIG-SLCT-01`** connected to MES Server.

```text
+--------------------------------------------------------------------------------------------------+
| AUTOMATED EOL TEST SEQUENCE: 100% UNIT EXECUTION                                                 |
| 1. MCU Pre-Code Flash [OK] ---------> 2. Voltage Regulators 5V/3.3V [OK, 5.02V / 3.31V]         |
| 3. High-Side Switch Load Test [OK] -> 4. CAN 1 & CAN 2 Loopback Test [OK, 500kbps / 250kbps]     |
| 5. NavIC/GPS Satellite Fix [OK, 14 Sats Locked, SNR 42dB] -> 6. 4G LTE Ping [OK, -78dBm RSRP]   |
| 7. Production Firmware Injection [v1.4.2 OK] --------------> 8. Serialized QR Label Print [OK]   |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Sample Serialized Test Data Log (Representative Batch Extract)

| Serial Number | IMEI Identifier | MCU Pre-Code | Voltage Check | CAN Loopback | GNSS TTFF | 4G RSRP | Production FW | Overall | QR Label Printed |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| `SLCT-2026-0101` | 864920050123451 | **PASS** | 3.31 V | **PASS** | 22.4 s | -76 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0101:OK` |
| `SLCT-2026-0102` | 864920050123452 | **PASS** | 3.30 V | **PASS** | 24.1 s | -78 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0102:OK` |
| `SLCT-2026-0103` | 864920050123453 | **PASS** | 3.29 V | **PASS** | 21.8 s | -75 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0103:OK` |
| `SLCT-2026-0104` | 864920050123454 | **PASS** | 3.31 V | **PASS** | 23.5 s | -77 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0104:OK` |
| `SLCT-2026-0105` | 864920050123455 | **PASS** | 3.32 V | **PASS** | 20.9 s | -74 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0105:OK` |
| `SLCT-2026-0106` | 864920050123456 | **PASS** | 3.30 V | **PASS** | 25.0 s | -79 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0106:OK` |
| `SLCT-2026-0107` | 864920050123457 | **PASS** | 3.31 V | **PASS** | 22.1 s | -76 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0107:OK` |
| `SLCT-2026-0108` | 864920050123458 | **PASS** | 3.30 V | **PASS** | 23.8 s | -75 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0108:OK` |
| `SLCT-2026-0109` | 864920050123459 | **PASS** | 3.29 V | **PASS** | 21.4 s | -77 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0109:OK` |
| `SLCT-2026-0110` | 864920050123460 | **PASS** | 3.31 V | **PASS** | 22.7 s | -76 dBm | v1.4.2 | **PASS** | `HLPL:SLCT:0110:OK` |

---

## 3. Physical & Aesthetic Inspection (AQL 0.65 Level II)
- **Housing Integrity**: Zero weld flashes, cracks, or discoloration.
- **Connector Pins**: 100% pin true position verified by optical go/no-go gauge.
- **Sealing Validation**: Post-weld pneumatic pressure leak test (20 kPa for 10s: pressure drop < 0.05 kPa).
- **Packaging**: Antistatic ESD bubble pouch, silica gel desiccant packet, serialized carton labeling with 2D DataMatrix code.

---

## 4. Final Dispatch Release Clearance
The undersigned confirm that Lot `BATCH-2026-AUG-SLCT-04` has met all operational and automotive quality standards. The batch is approved for immediate dispatch against Customer Purchase Order `PO-TATA-2026-9041`.

- **PDI Inspector**: Mina Cross (PDI Lead Technician) · 28-Aug-2026
- **Quality Assurance Head**: Jordan Blake (Quality Assurance Head) · 28-Aug-2026
- **Dispatch / Logistics Lead**: Priya Voss (Accounts & Logistics Lead) · 29-Aug-2026
