-- ============================================================
-- STEP 4: RICH DUMMY DATA — Stages, Skills, Progress, Requests
-- Run AFTER 03_skill_tracking.sql
--
-- Creates multi-stage program journeys with varied skill
-- progress statuses for all employees so the dashboard,
-- timeline, validation flow, and assessment page all show
-- meaningful real-looking data.
-- ============================================================

-- ── Program IDs ──────────────────────────────────────────────
DECLARE @ops_id  INT = (SELECT program_id FROM mst_program WHERE program_name = 'Operations')
DECLARE @hr_id   INT = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources')
DECLARE @it_id   INT = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology')
DECLARE @mnt_id  INT = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance')

-- ── Rename existing "Level 1" stages to proper names ─────────
UPDATE mst_program_stage SET stage_name = 'Technician Trainee'
    WHERE program_id = @ops_id AND stage_name = 'Level 1'
UPDATE mst_program_stage SET stage_name = 'HR Assistant'
    WHERE program_id = @hr_id  AND stage_name = 'Level 1'
UPDATE mst_program_stage SET stage_name = 'IT Support Specialist'
    WHERE program_id = @it_id  AND stage_name = 'Level 1'
UPDATE mst_program_stage SET stage_name = 'Maintenance Trainee'
    WHERE program_id = @mnt_id AND stage_name = 'Level 1'

-- ── Stage 1 IDs (already exist) ──────────────────────────────
DECLARE @ops_s1  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @ops_id AND stage_name = 'Technician Trainee')
DECLARE @hr_s1   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @hr_id  AND stage_name = 'HR Assistant')
DECLARE @it_s1   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @it_id  AND stage_name = 'IT Support Specialist')
DECLARE @mnt_s1  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @mnt_id AND stage_name = 'Maintenance Trainee')

-- ── Add Stages 2–4 for Operations ────────────────────────────
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @ops_id AND stage_name = 'Technician Trainee - Advanced')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@ops_id, 'Technician Trainee - Advanced')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @ops_id AND stage_name = 'Technician')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@ops_id, 'Technician')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @ops_id AND stage_name = 'Senior Technician')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@ops_id, 'Senior Technician')

DECLARE @ops_s2  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @ops_id AND stage_name = 'Technician Trainee - Advanced')
DECLARE @ops_s3  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @ops_id AND stage_name = 'Technician')
DECLARE @ops_s4  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @ops_id AND stage_name = 'Senior Technician')

-- ── Add Stages 2–4 for Human Resources ───────────────────────
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @hr_id AND stage_name = 'HR Associate')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@hr_id, 'HR Associate')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @hr_id AND stage_name = 'HR Specialist')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@hr_id, 'HR Specialist')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @hr_id AND stage_name = 'HR Supervisor')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@hr_id, 'HR Supervisor')

DECLARE @hr_s2   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @hr_id AND stage_name = 'HR Associate')
DECLARE @hr_s3   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @hr_id AND stage_name = 'HR Specialist')
DECLARE @hr_s4   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @hr_id AND stage_name = 'HR Supervisor')

-- ── Add Stages 2–4 for Information Technology ────────────────
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @it_id AND stage_name = 'IT Technician')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@it_id, 'IT Technician')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @it_id AND stage_name = 'Systems Analyst')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@it_id, 'Systems Analyst')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @it_id AND stage_name = 'Senior Engineer')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@it_id, 'Senior Engineer')

DECLARE @it_s2   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @it_id AND stage_name = 'IT Technician')
DECLARE @it_s3   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @it_id AND stage_name = 'Systems Analyst')
DECLARE @it_s4   INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @it_id AND stage_name = 'Senior Engineer')

-- ── Add Stages 2–4 for Maintenance ───────────────────────────
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @mnt_id AND stage_name = 'Maintenance Technician')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@mnt_id, 'Maintenance Technician')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @mnt_id AND stage_name = 'Senior Technician')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@mnt_id, 'Senior Technician')
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @mnt_id AND stage_name = 'Maintenance Lead')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@mnt_id, 'Maintenance Lead')

DECLARE @mnt_s2  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @mnt_id AND stage_name = 'Maintenance Technician')
DECLARE @mnt_s3  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @mnt_id AND stage_name = 'Senior Technician')
DECLARE @mnt_s4  INT = (SELECT stage_id FROM mst_program_stage WHERE program_id = @mnt_id AND stage_name = 'Maintenance Lead')

-- ============================================================
-- OPERATIONS SKILLS (emp_john — program_id = @ops_id)
-- ============================================================

-- Stage 1: Technician Trainee
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S1-001', 'Basic Safety Protocols', 'Fundamental workplace safety rules and emergency procedures for equipment operators.', @ops_id, @ops_s1, 30, 75, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S1-002', 'Equipment Identification', 'Identifying and classifying CAT machinery, components, and operational zones.', @ops_id, @ops_s1, 30, 75, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S1-003', 'Pre-Operation Procedures', 'Pre-operation inspection checklist, safety verification, and daily log completion.', @ops_id, @ops_s1, 30, 75, 1, GETDATE(), GETDATE())

-- Stage 2: Technician Trainee - Advanced
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S2-001', 'Hydraulic Systems Fundamentals', 'Understanding and maintaining hydraulic systems in heavy equipment.', @ops_id, @ops_s2, 45, 75, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S2-002', 'Engine Maintenance Basics', 'Basic engine inspection, fluid level checks, and scheduled maintenance procedures.', @ops_id, @ops_s2, 45, 75, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S2-003', 'Load & Capacity Management', 'Safe loading practices, weight distribution, and load capacity calculation.', @ops_id, @ops_s2, 45, 80, 1, GETDATE(), GETDATE())

-- Stage 3: Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S3-001', 'Advanced Equipment Operations', 'Complex operation scenarios, precision grading, and efficiency optimization.', @ops_id, @ops_s3, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S3-002', 'System Troubleshooting', 'Diagnosing equipment malfunctions, reading error codes, and root-cause analysis.', @ops_id, @ops_s3, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S3-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S3-003', 'Preventive Maintenance Scheduling', 'Creating, implementing, and managing preventive maintenance programs.', @ops_id, @ops_s3, 60, 80, 1, GETDATE(), GETDATE())

-- Stage 4: Senior Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S4-001', 'Team Leadership Fundamentals', 'Leading small maintenance teams, task delegation, and shift management.', @ops_id, @ops_s4, 60, 85, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S4-002', 'Advanced Diagnostics & Repair', 'Complex fault diagnosis and advanced component-level repair procedures.', @ops_id, @ops_s4, 90, 85, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S4-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('OPS-S4-003', 'Training & Knowledge Transfer', 'Developing training materials and mentoring junior technicians.', @ops_id, @ops_s4, 60, 85, 1, GETDATE(), GETDATE())

-- ============================================================
-- HUMAN RESOURCES SKILLS (emp_sarah — program_id = @hr_id)
-- ============================================================

-- Stage 1: HR Assistant
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S1-001', 'Company Policies & Procedures', 'Understanding and applying company-wide HR policies and employee handbook.', @hr_id, @hr_s1, 30, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S1-002', 'Employee Relations Basics', 'Handling routine employee inquiries, grievances, and onboarding documentation.', @hr_id, @hr_s1, 30, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S1-003', 'HR Documentation Standards', 'Maintaining accurate, compliant, and confidential HR records.', @hr_id, @hr_s1, 30, 80, 1, GETDATE(), GETDATE())

-- Stage 2: HR Associate
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S2-001', 'Recruitment & Selection Process', 'End-to-end recruitment, job posting, screening, interviewing, and offer management.', @hr_id, @hr_s2, 45, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S2-002', 'Performance Management', 'Administering performance review cycles, KPIs, and appraisal tools.', @hr_id, @hr_s2, 45, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S2-003', 'Compensation & Benefits Administration', 'Processing payroll, managing leave entitlements, and benefits enrolment.', @hr_id, @hr_s2, 45, 80, 1, GETDATE(), GETDATE())

-- Stage 3: HR Specialist
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S3-001', 'Employee Development Planning', 'Creating and managing Individual Development Plans (IDPs) and training roadmaps.', @hr_id, @hr_s3, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S3-002', 'Conflict Resolution & Mediation', 'Mediating workplace disputes and applying conflict-resolution techniques.', @hr_id, @hr_s3, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S3-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S3-003', 'HR Analytics & Reporting', 'Building HR dashboards, headcount reports, and data-driven workforce insights.', @hr_id, @hr_s3, 60, 80, 1, GETDATE(), GETDATE())

-- Stage 4: HR Supervisor
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S4-001', 'HR Team Management', 'Leading HR team members, setting OKRs, and coaching HR juniors.', @hr_id, @hr_s4, 60, 85, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('HR-S4-002', 'Strategic HR Planning', 'Aligning HR strategy with business objectives and organisational design.', @hr_id, @hr_s4, 60, 85, 1, GETDATE(), GETDATE())

-- ============================================================
-- INFORMATION TECHNOLOGY SKILLS (emp_michael — program_id = @it_id)
-- ============================================================

-- Stage 1: IT Support Specialist
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S1-001', 'Help Desk Operations', 'First-level technical support, ticket triage, and SLA management.', @it_id, @it_s1, 30, 75, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S1-002', 'Network Fundamentals', 'LAN/WAN basics, IP addressing, DNS, DHCP, and connectivity troubleshooting.', @it_id, @it_s1, 30, 75, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S1-003', 'Hardware & Software Troubleshooting', 'Diagnosing and resolving hardware failures, OS issues, and software conflicts.', @it_id, @it_s1, 45, 75, 1, GETDATE(), GETDATE())

-- Stage 2: IT Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S2-001', 'Server Administration', 'Managing Windows Server and Linux server environments, patching, and backups.', @it_id, @it_s2, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S2-002', 'Cybersecurity Fundamentals', 'Threat identification, security best practices, and incident response basics.', @it_id, @it_s2, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S2-003', 'Cloud Services Management', 'Managing cloud infrastructure and services on Azure/AWS fundamentals.', @it_id, @it_s2, 60, 80, 1, GETDATE(), GETDATE())

-- Stage 3: Systems Analyst
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S3-001', 'System Architecture Design', 'Designing scalable, reliable IT architectures for enterprise environments.', @it_id, @it_s3, 90, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S3-002', 'Database Management', 'SQL and NoSQL administration, query optimisation, and data integrity.', @it_id, @it_s3, 90, 80, 1, GETDATE(), GETDATE())

-- Stage 4: Senior Engineer
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S4-001', 'Enterprise Solutions Architecture', 'Designing and leading enterprise-scale IT implementations and migrations.', @it_id, @it_s4, 90, 85, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('IT-S4-002', 'IT Project Management', 'Managing IT projects with Agile and PRINCE2 methodologies.', @it_id, @it_s4, 90, 85, 1, GETDATE(), GETDATE())

-- ============================================================
-- MAINTENANCE SKILLS (emp_emily — program_id = @mnt_id)
-- ============================================================

-- Stage 1: Maintenance Trainee
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S1-001', 'Basic Tool Operations', 'Safe use and care of hand tools, power tools, and measuring instruments.', @mnt_id, @mnt_s1, 30, 75, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S1-002', 'Electrical Safety Fundamentals', 'Electrical hazard awareness, lockout/tagout (LOTO), and safe isolation procedures.', @mnt_id, @mnt_s1, 30, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S1-003', 'Work Order Management', 'Reading, processing, and closing maintenance work orders accurately.', @mnt_id, @mnt_s1, 30, 75, 1, GETDATE(), GETDATE())

-- Stage 2: Maintenance Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S2-001', 'Hydraulic System Maintenance', 'Inspecting, servicing, and troubleshooting hydraulic circuits and components.', @mnt_id, @mnt_s2, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S2-002', 'Electrical Systems Repair', 'Diagnosing and repairing electrical faults, wiring, and control systems in machinery.', @mnt_id, @mnt_s2, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S2-003', 'Mechanical Component Inspection', 'Inspecting bearings, gears, belts, and mechanical assemblies for wear and alignment.', @mnt_id, @mnt_s2, 60, 80, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-004')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S2-004', 'Lubrication & Fluid Management', 'Selecting and applying correct lubricants and hydraulic fluids per OEM specifications.', @mnt_id, @mnt_s2, 45, 75, 1, GETDATE(), GETDATE())

-- Stage 3: Senior Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S3-001', 'Complex Systems Troubleshooting', 'Advanced fault-finding across integrated mechanical-electrical-hydraulic systems.', @mnt_id, @mnt_s3, 90, 85, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S3-002', 'Predictive Maintenance Analysis', 'Using vibration analysis and condition monitoring data to predict failures.', @mnt_id, @mnt_s3, 90, 85, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S3-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S3-003', 'Spare Parts Management', 'Managing maintenance inventory, min-max levels, and procurement processes.', @mnt_id, @mnt_s3, 60, 80, 1, GETDATE(), GETDATE())

-- Stage 4: Maintenance Lead
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S4-001', 'Maintenance Planning & Scheduling', 'Developing annual maintenance plans, budgets, and resource allocation.', @mnt_id, @mnt_s4, 90, 85, 1, GETDATE(), GETDATE())
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES ('MNT-S4-002', 'Reliability Engineering', 'Applying RCM and FMEA methodologies to improve asset reliability.', @mnt_id, @mnt_s4, 90, 85, 1, GETDATE(), GETDATE())

-- ============================================================
-- SKILL PROGRESS: emp_john (1002) — Operations
-- Stage 1: all competent (done 60 days ago)
-- Stage 2: OPS-S2-001 & 002 competent, OPS-S2-003 requesting_validation
-- Stage 3 & 4: not_started (locked)
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (
    SELECT 1002 AS eid, skill_id, 'competent' AS st, DATEADD(day,-60,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code IN ('OPS-S1-001','OPS-S1-002','OPS-S1-003')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1002 AS eid, skill_id, 'competent' AS st, DATEADD(day,-30,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code IN ('OPS-S2-001','OPS-S2-002')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1002 AS eid, skill_id, 'requesting_validation' AS st, DATEADD(day,-2,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code = 'OPS-S2-003'
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1002 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
    FROM mst_skill WHERE skill_code IN ('OPS-S3-001','OPS-S3-002','OPS-S3-003',
                                         'OPS-S4-001','OPS-S4-002','OPS-S4-003')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- SKILL PROGRESS: emp_sarah (1003) — Human Resources
-- Stage 1 & 2: all competent
-- Stage 3: HR-S3-001 requesting_validation, rest not_started
-- Stage 4: not_started (locked)
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (
    SELECT 1003 AS eid, skill_id, 'competent' AS st, DATEADD(day,-90,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code IN ('HR-S1-001','HR-S1-002','HR-S1-003',
                                         'HR-S2-001','HR-S2-002','HR-S2-003')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1003 AS eid, skill_id, 'requesting_validation' AS st, DATEADD(day,-1,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code = 'HR-S3-001'
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1003 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
    FROM mst_skill WHERE skill_code IN ('HR-S3-002','HR-S3-003','HR-S4-001','HR-S4-002')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- SKILL PROGRESS: emp_michael (1004) — Information Technology
-- Stage 1: IT-S1-001 & 002 competent, IT-S1-003 on_progress
-- Stage 2–4: not_started (locked)
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (
    SELECT 1004 AS eid, skill_id, 'competent' AS st, DATEADD(day,-20,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code IN ('IT-S1-001','IT-S1-002')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1004 AS eid, skill_id, 'on_progress' AS st, DATEADD(day,-5,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code = 'IT-S1-003'
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1004 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
    FROM mst_skill WHERE skill_code IN ('IT-S2-001','IT-S2-002','IT-S2-003',
                                         'IT-S3-001','IT-S3-002',
                                         'IT-S4-001','IT-S4-002')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- SKILL PROGRESS: emp_emily (1005) — Maintenance
-- Stage 1: all competent
-- Stage 2: MNT-S2-001 competent, MNT-S2-002 approved (ready for exam),
--          MNT-S2-003 requesting_validation, MNT-S2-004 not_started
-- Stage 3 & 4: not_started (locked)
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (
    SELECT 1005 AS eid, skill_id, 'competent' AS st, DATEADD(day,-45,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code IN ('MNT-S1-001','MNT-S1-002','MNT-S1-003')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1005 AS eid, skill_id, 'competent' AS st, DATEADD(day,-15,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code = 'MNT-S2-001'
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1005 AS eid, skill_id, 'approved' AS st, DATEADD(day,-3,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code = 'MNT-S2-002'
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1005 AS eid, skill_id, 'requesting_validation' AS st, DATEADD(day,-2,GETDATE()) AS ua
    FROM mst_skill WHERE skill_code = 'MNT-S2-003'
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (
    SELECT 1005 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
    FROM mst_skill WHERE skill_code IN ('MNT-S2-004',
                                         'MNT-S3-001','MNT-S3-002','MNT-S3-003',
                                         'MNT-S4-001','MNT-S4-002')
) AS src ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- SAMPLE VALIDATION REQUESTS
-- ============================================================

-- emp_john → OPS-S2-003 (Load & Capacity Management) — pending
IF NOT EXISTS (
    SELECT 1 FROM trx_validation_request
    WHERE employee_id = 1002
      AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'OPS-S2-003')
      AND status IN ('pending','approved','revision_required')
)
    INSERT INTO trx_validation_request (employee_id, skill_id, supervisor_id, status, request_date, employee_notes)
    SELECT 1002, skill_id, 1010, 'pending', DATEADD(day,-2,GETDATE()),
           'I have been working with load calculations daily for 3 weeks and feel ready for validation.'
    FROM mst_skill WHERE skill_code = 'OPS-S2-003'

-- emp_sarah → HR-S3-001 (Employee Development Planning) — pending
IF NOT EXISTS (
    SELECT 1 FROM trx_validation_request
    WHERE employee_id = 1003
      AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'HR-S3-001')
      AND status IN ('pending','approved','revision_required')
)
    INSERT INTO trx_validation_request (employee_id, skill_id, supervisor_id, status, request_date, employee_notes)
    SELECT 1003, skill_id, 1010, 'pending', DATEADD(day,-1,GETDATE()),
           'I have drafted and reviewed IDPs for 5 team members over the past quarter.'
    FROM mst_skill WHERE skill_code = 'HR-S3-001'

-- emp_emily → MNT-S2-002 (Electrical Systems Repair) — approved (supervisor already decided)
IF NOT EXISTS (
    SELECT 1 FROM trx_validation_request
    WHERE employee_id = 1005
      AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'MNT-S2-002')
)
    INSERT INTO trx_validation_request (employee_id, skill_id, supervisor_id, status, request_date, decision_date, employee_notes, supervisor_notes)
    SELECT 1005, skill_id, 1010, 'approved',
           DATEADD(day,-7,GETDATE()), DATEADD(day,-3,GETDATE()),
           'Completed on-the-job training for electrical systems repair with senior technician guidance.',
           'Approved. Emily has demonstrated consistent accuracy in fault diagnosis and repair during shift observations.'
    FROM mst_skill WHERE skill_code = 'MNT-S2-002'

-- emp_emily → MNT-S2-003 (Mechanical Component Inspection) — pending
IF NOT EXISTS (
    SELECT 1 FROM trx_validation_request
    WHERE employee_id = 1005
      AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'MNT-S2-003')
      AND status IN ('pending','approved','revision_required')
)
    INSERT INTO trx_validation_request (employee_id, skill_id, supervisor_id, status, request_date, employee_notes)
    SELECT 1005, skill_id, 1010, 'pending', DATEADD(day,-2,GETDATE()),
           'Completed the component inspection module and performed 12 inspections under supervision.'
    FROM mst_skill WHERE skill_code = 'MNT-S2-003'
