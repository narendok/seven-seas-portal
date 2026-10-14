-- ==============================================================================
-- Hexense Labs Private Limited (HLPL) - Smart Company Management System (SCMS)
-- Database Migration: 20261003_scms_core_schema.sql
-- Adheres to: IATF 16949:2016, ISO 9001:2015, ISO 14001, AIS-140, AEC-Q100/Q200
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Enumerated Types
DO $$ BEGIN
    CREATE TYPE project_status_type AS ENUM ('Draft', 'Active', 'Under Amendment', 'Production', 'Archived');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE stage_status_type AS ENUM ('Pending', 'In Progress', 'Under Review', 'Passed', 'Blocked');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE risk_flag_type AS ENUM ('Green', 'Yellow', 'Red');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity_type AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE doc_status_type AS ENUM ('Draft', 'Pending Review', 'Approved', 'Obsolete');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE eol_result_type AS ENUM ('PASS', 'FAIL');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_code VARCHAR(20) NOT NULL UNIQUE,
    project_name VARCHAR(150) NOT NULL,
    client_name VARCHAR(150) NOT NULL,
    target_vehicle VARCHAR(100),
    current_stage INT DEFAULT 1 CHECK (current_stage BETWEEN 1 AND 9),
    status project_status_type DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Project Master Spec Sheet (PMSS / Single Source of Truth)
CREATE TABLE IF NOT EXISTS pmss_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    system_voltage VARCHAR(20) DEFAULT '24V',
    operating_temp_min NUMERIC DEFAULT -40.0,
    operating_temp_max NUMERIC DEFAULT 85.0,
    ip_rating VARCHAR(20) DEFAULT 'IP67',
    io_channels JSONB DEFAULT '{"analog_inputs": 8, "digital_inputs": 16, "high_side_outputs": 8, "can_buses": 2}'::jsonb,
    aec_q_grade VARCHAR(20) DEFAULT 'Grade 1 (-40C to +125C)',
    ais140_compliant BOOLEAN DEFAULT TRUE,
    iso7637_compliant BOOLEAN DEFAULT TRUE,
    rohs_compliant BOOLEAN DEFAULT TRUE,
    target_bom_cost NUMERIC(10, 2) DEFAULT 45.00,
    actual_bom_cost NUMERIC(10, 2) DEFAULT 43.80,
    cycle_time_seconds INT DEFAULT 180,
    revision INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lock_reason TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Controlled Documents Table (Conforms to HLPL-[PROJ]-[DEPT]-[TYPE]-[REV])
CREATE TABLE IF NOT EXISTS controlled_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_id VARCHAR(100) NOT NULL UNIQUE,
    department_code VARCHAR(10) NOT NULL,
    doc_type VARCHAR(20) NOT NULL,
    revision VARCHAR(10) DEFAULT '00',
    title VARCHAR(255) NOT NULL,
    storage_path TEXT,
    file_url TEXT,
    file_size_kb INT,
    classification VARCHAR(50) DEFAULT 'Internal',
    status doc_status_type DEFAULT 'Approved',
    author_name VARCHAR(100) DEFAULT 'Engineering Lead',
    approver_name VARCHAR(100) DEFAULT 'HOD R&D',
    approved_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Nine Lifecycle Stages Table
CREATE TABLE IF NOT EXISTS lifecycle_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_number INT NOT NULL CHECK (stage_number BETWEEN 1 AND 9),
    stage_name VARCHAR(150) NOT NULL,
    status stage_status_type DEFAULT 'Pending',
    sla_days INT DEFAULT 14,
    target_completion_date DATE,
    actual_completion_date DATE,
    gate_signoff_user VARCHAR(100),
    gate_signoff_at TIMESTAMPTZ,
    notes TEXT,
    CONSTRAINT unique_project_stage UNIQUE (project_id, stage_number)
);

-- 7. Hardware Development Tracker (HW_01 to HW_37)
CREATE TABLE IF NOT EXISTS hardware_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    stage_code VARCHAR(10) NOT NULL,
    stage_title VARCHAR(200) NOT NULL,
    status VARCHAR(50) DEFAULT 'In Progress',
    risk_flag risk_flag_type DEFAULT 'Green',
    dfm_cleared BOOLEAN DEFAULT TRUE,
    notes TEXT,
    CONSTRAINT unique_project_hw_stage UNIQUE (project_id, stage_code)
);

-- 8. Bill of Materials (BOM) Items
CREATE TABLE IF NOT EXISTS bom_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    part_number VARCHAR(100) NOT NULL,
    component_name VARCHAR(200) NOT NULL,
    manufacturer VARCHAR(150),
    footprint VARCHAR(100),
    aec_q_qualified BOOLEAN DEFAULT TRUE,
    asl_vendor_id VARCHAR(100),
    category VARCHAR(10) DEFAULT 'A', -- A: Automotive Grade, B: Standard with Waiver
    target_unit_cost NUMERIC(10, 4) DEFAULT 1.20,
    actual_unit_cost NUMERIC(10, 4) DEFAULT 1.15,
    track_type VARCHAR(20) DEFAULT 'Production', -- Prototype or Production
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Automated EOL Test Jig Telemetry
CREATE TABLE IF NOT EXISTS eol_test_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    serial_number VARCHAR(100) NOT NULL UNIQUE,
    jig_id VARCHAR(50) DEFAULT 'JIG-SMT-01',
    mcu_flash_status BOOLEAN DEFAULT TRUE,
    voltage_check_status BOOLEAN DEFAULT TRUE,
    can_loopback_status BOOLEAN DEFAULT TRUE,
    overall_result eol_result_type DEFAULT 'PASS',
    failure_reason TEXT,
    qr_label_data TEXT,
    operator_name VARCHAR(100) DEFAULT 'EOL Test Operator',
    tested_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. HR Skill Matrix & Competency Framework (HLPL/F/HR/03)
CREATE TABLE IF NOT EXISTS hr_skill_matrix (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_name VARCHAR(150) NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department_code VARCHAR(10) NOT NULL,
    skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    average_score NUMERIC(3, 2) DEFAULT 3.25,
    competency_level VARCHAR(20) DEFAULT 'Level 3', -- Level 1 (<25%), Level 2 (26-50%), Level 3 (51-75%), Level 4 (76-100%)
    training_needed BOOLEAN DEFAULT FALSE,
    last_evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. System Alerts & Webhooks Matrix
CREATE TABLE IF NOT EXISTS system_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alert_code VARCHAR(50) NOT NULL,
    department_code VARCHAR(10) NOT NULL,
    project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
    severity alert_severity_type DEFAULT 'WARNING',
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Cross-Departmental Change Control Orders (Loops 1 to 4)
CREATE TABLE IF NOT EXISTS change_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    eco_number VARCHAR(50) NOT NULL UNIQUE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    loop_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'Under Review',
    initiated_by VARCHAR(100) NOT NULL,
    approved_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Enable Row Level Security (RLS) on all tables
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pmss_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE controlled_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lifecycle_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hardware_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE bom_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE eol_test_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hr_skill_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_orders ENABLE ROW LEVEL SECURITY;

-- Development policy: Allow authenticated and anonymous read/write during build
CREATE POLICY "Public Read Projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Public Modify Projects" ON projects FOR ALL USING (true);

CREATE POLICY "Public Read PMSS" ON pmss_specs FOR SELECT USING (true);
CREATE POLICY "Public Modify PMSS" ON pmss_specs FOR ALL USING (true);

CREATE POLICY "Public Read Documents" ON controlled_documents FOR SELECT USING (true);
CREATE POLICY "Public Modify Documents" ON controlled_documents FOR ALL USING (true);

CREATE POLICY "Public Read Stages" ON lifecycle_stages FOR SELECT USING (true);
CREATE POLICY "Public Modify Stages" ON lifecycle_stages FOR ALL USING (true);

CREATE POLICY "Public Read HW Stages" ON hardware_stages FOR SELECT USING (true);
CREATE POLICY "Public Modify HW Stages" ON hardware_stages FOR ALL USING (true);

CREATE POLICY "Public Read BOM" ON bom_items FOR SELECT USING (true);
CREATE POLICY "Public Modify BOM" ON bom_items FOR ALL USING (true);

CREATE POLICY "Public Read EOL" ON eol_test_runs FOR SELECT USING (true);
CREATE POLICY "Public Modify EOL" ON eol_test_runs FOR ALL USING (true);

CREATE POLICY "Public Read HR" ON hr_skill_matrix FOR SELECT USING (true);
CREATE POLICY "Public Modify HR" ON hr_skill_matrix FOR ALL USING (true);

CREATE POLICY "Public Read Alerts" ON system_alerts FOR SELECT USING (true);
CREATE POLICY "Public Modify Alerts" ON system_alerts FOR ALL USING (true);

CREATE POLICY "Public Read Changes" ON change_orders FOR SELECT USING (true);
CREATE POLICY "Public Modify Changes" ON change_orders FOR ALL USING (true);

-- ==============================================================================
-- Sample Production Data Seeding
-- ==============================================================================

-- Seed BCU Project
INSERT INTO projects (id, project_code, project_name, client_name, target_vehicle, current_stage, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'BCU', 'Body Control Unit Gen 3', 'Tata Motors EV Division', 'Harrier EV Platform', 5, 'Active'),
    ('b0000000-0000-0000-0000-000000000002', 'SLCT', 'AIS-140 Telematics Unit', 'Ashok Leyland Mobility', 'Dost Commercial Fleet', 8, 'Active'),
    ('b0000000-0000-0000-0000-000000000003', 'XLINK', 'Commercial Gateway Module', 'Mahindra Electric', 'Treo e-Auto Series', 4, 'Active'),
    ('b0000000-0000-0000-0000-000000000004', 'EFAN', 'High-Power eFan Speed Controller', 'Sonalika Tractors', 'Heavy Haul Agriculture', 2, 'Active'),
    ('b0000000-0000-0000-0000-000000000005', 'PST', 'Power Shuttle Transmission Unit', 'Escorts Kubota', 'Farmtrac Smart Series', 9, 'Production')
ON CONFLICT (project_code) DO NOTHING;

-- Seed PMSS for BCU
INSERT INTO pmss_specs (project_id, system_voltage, operating_temp_min, operating_temp_max, ip_rating, aec_q_grade, ais140_compliant, target_bom_cost, actual_bom_cost, revision, is_locked)
VALUES (
    'b0000000-0000-0000-0000-000000000001',
    '24V', -40.0, 85.0, 'IP67', 'Grade 1 (-40C to +125C)', TRUE, 52.00, 49.30, 2, FALSE
) ON CONFLICT DO NOTHING;

-- Seed Controlled Documents
INSERT INTO controlled_documents (project_id, document_id, department_code, doc_type, revision, title, classification, status)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'HLPL-BCU-EHW-PRS-02', 'EHW', 'PRS', '02', 'Product Requirement Specification - BCU Gen 3', 'OEM Confidential', 'Approved'),
    ('b0000000-0000-0000-0000-000000000001', 'HLPL-BCU-SAL-QUO-01', 'SAL', 'QUO', '01', 'Commercial Proposal & Development Quotation', 'OEM Confidential', 'Approved'),
    ('b0000000-0000-0000-0000-000000000001', 'HLPL-BCU-EHW-SCH-01', 'EHW', 'SCH', '01', 'Schematic Design & Transient Protection Tree', 'Internal', 'Approved'),
    ('b0000000-0000-0000-0000-000000000001', 'HLPL-BCU-EHW-BOM-00', 'EHW', 'BOM', '00', 'Tentative Engineering BOM - Proto Build', 'Internal', 'Approved'),
    ('b0000000-0000-0000-0000-000000000001', 'HLPL-BCU-QA-DVP-01', 'QA', 'DVP', '01', 'Design Verification Plan & Environmental Profiles', 'Internal', 'Approved')
ON CONFLICT (document_id) DO NOTHING;

-- Seed Sample Active Alerts
INSERT INTO system_alerts (alert_code, department_code, project_id, severity, message, is_resolved)
VALUES 
    ('ALERT_SAL_02', 'SAL', 'b0000000-0000-0000-0000-000000000001', 'WARNING', 'Contract Review pending functional sign-offs > 48 hours for Harrier platform.', FALSE),
    ('ALERT_HW_01', 'EHW', 'b0000000-0000-0000-0000-000000000004', 'CRITICAL', 'Key MOSFET selected lacks AEC-Q qualification without R&D Risk Waiver.', FALSE),
    ('ALERT_TST_01', 'TST', 'b0000000-0000-0000-0000-000000000005', 'CRITICAL', 'EOL First-Pass Yield (FPY) fell below 95% threshold on Line 2 (current: 92.4%).', FALSE)
ON CONFLICT DO NOTHING;
