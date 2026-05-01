-- ============================================================
-- STEP 4: RICH DUMMY DATA — Stages, Skills, Progress, Requests
-- Run AFTER 03_skill_tracking.sql
--
-- Written WITHOUT scalar variables so it works in DBeaver,
-- Azure Data Studio, or any client that executes statements
-- individually (no GO / variable scope issues).
-- All program_id / stage_id values are resolved via subquery.
-- ============================================================

-- ============================================================
-- 1. RENAME EXISTING "Level 1" STAGES
-- ============================================================
UPDATE mst_program_stage
SET stage_name = 'Technician Trainee'
WHERE stage_name = 'Level 1'
  AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Operations');

UPDATE mst_program_stage
SET stage_name = 'HR Assistant'
WHERE stage_name = 'Level 1'
  AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources');

UPDATE mst_program_stage
SET stage_name = 'IT Support Specialist'
WHERE stage_name = 'Level 1'
  AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology');

UPDATE mst_program_stage
SET stage_name = 'Maintenance Trainee'
WHERE stage_name = 'Level 1'
  AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance');

-- ============================================================
-- 2. ADD STAGES 2-4 FOR EACH PROGRAM
-- ============================================================

-- Operations
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Technician Trainee - Advanced'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Operations'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Technician Trainee - Advanced' FROM mst_program WHERE program_name = 'Operations';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Technician'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Operations'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Technician' FROM mst_program WHERE program_name = 'Operations';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Senior Technician'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Operations'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Senior Technician' FROM mst_program WHERE program_name = 'Operations';

-- Human Resources
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'HR Associate'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'HR Associate' FROM mst_program WHERE program_name = 'Human Resources';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'HR Specialist'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'HR Specialist' FROM mst_program WHERE program_name = 'Human Resources';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'HR Supervisor'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'HR Supervisor' FROM mst_program WHERE program_name = 'Human Resources';

-- Information Technology
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'IT Technician'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'IT Technician' FROM mst_program WHERE program_name = 'Information Technology';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Systems Analyst'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Systems Analyst' FROM mst_program WHERE program_name = 'Information Technology';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Senior Engineer'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Senior Engineer' FROM mst_program WHERE program_name = 'Information Technology';

-- Maintenance
IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Maintenance Technician'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Maintenance Technician' FROM mst_program WHERE program_name = 'Maintenance';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Senior Technician'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Senior Technician' FROM mst_program WHERE program_name = 'Maintenance';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE stage_name = 'Maintenance Lead'
               AND program_id = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance'))
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Maintenance Lead' FROM mst_program WHERE program_name = 'Maintenance';

-- ============================================================
-- 3. OPERATIONS SKILLS
-- ============================================================

-- Stage 1: Technician Trainee
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S1-001', 'Basic Safety Protocols',
           'Fundamental workplace safety rules and emergency procedures for equipment operators.',
           ps.program_id, ps.stage_id, 30, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician Trainee';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S1-002', 'Equipment Identification',
           'Identifying and classifying CAT machinery, components, and operational zones.',
           ps.program_id, ps.stage_id, 30, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician Trainee';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S1-003', 'Pre-Operation Procedures',
           'Pre-operation inspection checklist, safety verification, and daily log completion.',
           ps.program_id, ps.stage_id, 30, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician Trainee';

-- Stage 2: Technician Trainee - Advanced
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S2-001', 'Hydraulic Systems Fundamentals',
           'Understanding and maintaining hydraulic systems in heavy equipment.',
           ps.program_id, ps.stage_id, 45, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician Trainee - Advanced';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S2-002', 'Engine Maintenance Basics',
           'Basic engine inspection, fluid level checks, and scheduled maintenance procedures.',
           ps.program_id, ps.stage_id, 45, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician Trainee - Advanced';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S2-003', 'Load & Capacity Management',
           'Safe loading practices, weight distribution, and load capacity calculation.',
           ps.program_id, ps.stage_id, 45, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician Trainee - Advanced';

-- Stage 3: Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S3-001', 'Advanced Equipment Operations',
           'Complex operation scenarios, precision grading, and efficiency optimisation.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S3-002', 'System Troubleshooting',
           'Diagnosing equipment malfunctions, reading error codes, and root-cause analysis.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S3-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S3-003', 'Preventive Maintenance Scheduling',
           'Creating, implementing, and managing preventive maintenance programs.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Technician';

-- Stage 4: Senior Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S4-001', 'Team Leadership Fundamentals',
           'Leading small maintenance teams, task delegation, and shift management.',
           ps.program_id, ps.stage_id, 60, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Senior Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S4-002', 'Advanced Diagnostics & Repair',
           'Complex fault diagnosis and advanced component-level repair procedures.',
           ps.program_id, ps.stage_id, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Senior Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'OPS-S4-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'OPS-S4-003', 'Training & Knowledge Transfer',
           'Developing training materials and mentoring junior technicians.',
           ps.program_id, ps.stage_id, 60, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Operations' AND ps.stage_name = 'Senior Technician';

-- ============================================================
-- 4. HUMAN RESOURCES SKILLS
-- ============================================================

-- Stage 1: HR Assistant
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S1-001', 'Company Policies & Procedures',
           'Understanding and applying company-wide HR policies and the employee handbook.',
           ps.program_id, ps.stage_id, 30, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Assistant';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S1-002', 'Employee Relations Basics',
           'Handling routine employee inquiries, grievances, and onboarding documentation.',
           ps.program_id, ps.stage_id, 30, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Assistant';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S1-003', 'HR Documentation Standards',
           'Maintaining accurate, compliant, and confidential HR records.',
           ps.program_id, ps.stage_id, 30, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Assistant';

-- Stage 2: HR Associate
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S2-001', 'Recruitment & Selection Process',
           'End-to-end recruitment, job posting, screening, interviewing, and offer management.',
           ps.program_id, ps.stage_id, 45, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Associate';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S2-002', 'Performance Management',
           'Administering performance review cycles, KPIs, and appraisal tools.',
           ps.program_id, ps.stage_id, 45, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Associate';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S2-003', 'Compensation & Benefits Administration',
           'Processing payroll, managing leave entitlements, and benefits enrolment.',
           ps.program_id, ps.stage_id, 45, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Associate';

-- Stage 3: HR Specialist
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S3-001', 'Employee Development Planning',
           'Creating and managing Individual Development Plans (IDPs) and training roadmaps.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Specialist';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S3-002', 'Conflict Resolution & Mediation',
           'Mediating workplace disputes and applying structured conflict-resolution techniques.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Specialist';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S3-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S3-003', 'HR Analytics & Reporting',
           'Building HR dashboards, headcount reports, and data-driven workforce insights.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Specialist';

-- Stage 4: HR Supervisor
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S4-001', 'HR Team Management',
           'Leading HR team members, setting OKRs, and coaching HR juniors.',
           ps.program_id, ps.stage_id, 60, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Supervisor';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'HR-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'HR-S4-002', 'Strategic HR Planning',
           'Aligning HR strategy with business objectives and organisational design.',
           ps.program_id, ps.stage_id, 60, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'HR Supervisor';

-- ============================================================
-- 5. INFORMATION TECHNOLOGY SKILLS
-- ============================================================

-- Stage 1: IT Support Specialist
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S1-001', 'Help Desk Operations',
           'First-level technical support, ticket triage, and SLA management.',
           ps.program_id, ps.stage_id, 30, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'IT Support Specialist';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S1-002', 'Network Fundamentals',
           'LAN/WAN basics, IP addressing, DNS, DHCP, and connectivity troubleshooting.',
           ps.program_id, ps.stage_id, 30, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'IT Support Specialist';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S1-003', 'Hardware & Software Troubleshooting',
           'Diagnosing and resolving hardware failures, OS issues, and software conflicts.',
           ps.program_id, ps.stage_id, 45, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'IT Support Specialist';

-- Stage 2: IT Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S2-001', 'Server Administration',
           'Managing Windows Server and Linux environments, patching, and backups.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'IT Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S2-002', 'Cybersecurity Fundamentals',
           'Threat identification, security best practices, and incident response basics.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'IT Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S2-003', 'Cloud Services Management',
           'Managing cloud infrastructure and services on Azure/AWS fundamentals.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'IT Technician';

-- Stage 3: Systems Analyst
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S3-001', 'System Architecture Design',
           'Designing scalable, reliable IT architectures for enterprise environments.',
           ps.program_id, ps.stage_id, 90, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'Systems Analyst';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S3-002', 'Database Management',
           'SQL and NoSQL administration, query optimisation, and data integrity.',
           ps.program_id, ps.stage_id, 90, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'Systems Analyst';

-- Stage 4: Senior Engineer
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S4-001', 'Enterprise Solutions Architecture',
           'Designing and leading enterprise-scale IT implementations and migrations.',
           ps.program_id, ps.stage_id, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'Senior Engineer';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'IT-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'IT-S4-002', 'IT Project Management',
           'Managing IT projects with Agile and PRINCE2 methodologies.',
           ps.program_id, ps.stage_id, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'Senior Engineer';

-- ============================================================
-- 6. MAINTENANCE SKILLS
-- ============================================================

-- Stage 1: Maintenance Trainee
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S1-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S1-001', 'Basic Tool Operations',
           'Safe use and care of hand tools, power tools, and measuring instruments.',
           ps.program_id, ps.stage_id, 30, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Trainee';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S1-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S1-002', 'Electrical Safety Fundamentals',
           'Electrical hazard awareness, lockout/tagout (LOTO), and safe isolation procedures.',
           ps.program_id, ps.stage_id, 30, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Trainee';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S1-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S1-003', 'Work Order Management',
           'Reading, processing, and closing maintenance work orders accurately.',
           ps.program_id, ps.stage_id, 30, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Trainee';

-- Stage 2: Maintenance Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S2-001', 'Hydraulic System Maintenance',
           'Inspecting, servicing, and troubleshooting hydraulic circuits and components.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S2-002', 'Electrical Systems Repair',
           'Diagnosing and repairing electrical faults, wiring, and control systems in machinery.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S2-003', 'Mechanical Component Inspection',
           'Inspecting bearings, gears, belts, and mechanical assemblies for wear and alignment.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S2-004')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S2-004', 'Lubrication & Fluid Management',
           'Selecting and applying correct lubricants and hydraulic fluids per OEM specifications.',
           ps.program_id, ps.stage_id, 45, 75, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Technician';

-- Stage 3: Senior Technician
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S3-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S3-001', 'Complex Systems Troubleshooting',
           'Advanced fault-finding across integrated mechanical-electrical-hydraulic systems.',
           ps.program_id, ps.stage_id, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Senior Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S3-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S3-002', 'Predictive Maintenance Analysis',
           'Using vibration analysis and condition monitoring data to predict failures.',
           ps.program_id, ps.stage_id, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Senior Technician';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S3-003')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S3-003', 'Spare Parts Management',
           'Managing maintenance inventory, min-max levels, and procurement processes.',
           ps.program_id, ps.stage_id, 60, 80, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Senior Technician';

-- Stage 4: Maintenance Lead
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S4-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S4-001', 'Maintenance Planning & Scheduling',
           'Developing annual maintenance plans, budgets, and resource allocation.',
           ps.program_id, ps.stage_id, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Lead';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'MNT-S4-002')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'MNT-S4-002', 'Reliability Engineering',
           'Applying RCM and FMEA methodologies to improve asset reliability.',
           ps.program_id, ps.stage_id, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id
    WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Maintenance Lead';

-- ============================================================
-- 6b. ENSURE updated_at COLUMN EXISTS ON trx_skill_progress
-- (may be absent if the table was created before 03_skill_tracking.sql)
-- ============================================================
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('trx_skill_progress') AND name = 'updated_at'
)
    ALTER TABLE trx_skill_progress
        ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();

-- ============================================================
-- 7. SKILL PROGRESS — emp_john (1002) — Operations
--    Stage 1: all competent | Stage 2: 2 competent + 1 requesting_validation
--    Stage 3-4: not_started
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (SELECT 1002 AS eid, skill_id, 'competent' AS st, DATEADD(day,-60,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code IN ('OPS-S1-001','OPS-S1-002','OPS-S1-003')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1002 AS eid, skill_id, 'competent' AS st, DATEADD(day,-30,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code IN ('OPS-S2-001','OPS-S2-002')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1002 AS eid, skill_id, 'requesting_validation' AS st, DATEADD(day,-2,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code = 'OPS-S2-003') AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1002 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
       FROM mst_skill WHERE skill_code IN ('OPS-S3-001','OPS-S3-002','OPS-S3-003',
                                            'OPS-S4-001','OPS-S4-002','OPS-S4-003')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- 8. SKILL PROGRESS — emp_sarah (1003) — Human Resources
--    Stages 1+2: all competent | HR-S3-001: requesting_validation
--    Rest: not_started
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (SELECT 1003 AS eid, skill_id, 'competent' AS st, DATEADD(day,-90,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code IN ('HR-S1-001','HR-S1-002','HR-S1-003',
                                            'HR-S2-001','HR-S2-002','HR-S2-003')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1003 AS eid, skill_id, 'requesting_validation' AS st, DATEADD(day,-1,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code = 'HR-S3-001') AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1003 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
       FROM mst_skill WHERE skill_code IN ('HR-S3-002','HR-S3-003','HR-S4-001','HR-S4-002')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- 9. SKILL PROGRESS — emp_michael (1004) — Information Technology
--    IT-S1-001/002: competent | IT-S1-003: on_progress | Rest: not_started
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (SELECT 1004 AS eid, skill_id, 'competent' AS st, DATEADD(day,-20,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code IN ('IT-S1-001','IT-S1-002')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1004 AS eid, skill_id, 'on_progress' AS st, DATEADD(day,-5,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code = 'IT-S1-003') AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1004 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
       FROM mst_skill WHERE skill_code IN ('IT-S2-001','IT-S2-002','IT-S2-003',
                                            'IT-S3-001','IT-S3-002',
                                            'IT-S4-001','IT-S4-002')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- 10. SKILL PROGRESS — emp_emily (1005) — Maintenance
--    Stage 1: all competent | MNT-S2-001: competent
--    MNT-S2-002: approved (exam ready) | MNT-S2-003: requesting_validation
--    Rest: not_started
-- ============================================================
MERGE trx_skill_progress AS tgt
USING (SELECT 1005 AS eid, skill_id, 'competent' AS st, DATEADD(day,-45,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code IN ('MNT-S1-001','MNT-S1-002','MNT-S1-003')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1005 AS eid, skill_id, 'competent' AS st, DATEADD(day,-15,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code = 'MNT-S2-001') AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1005 AS eid, skill_id, 'approved' AS st, DATEADD(day,-3,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code = 'MNT-S2-002') AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1005 AS eid, skill_id, 'requesting_validation' AS st, DATEADD(day,-2,GETDATE()) AS ua
       FROM mst_skill WHERE skill_code = 'MNT-S2-003') AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

MERGE trx_skill_progress AS tgt
USING (SELECT 1005 AS eid, skill_id, 'not_started' AS st, GETDATE() AS ua
       FROM mst_skill WHERE skill_code IN ('MNT-S2-004',
                                            'MNT-S3-001','MNT-S3-002','MNT-S3-003',
                                            'MNT-S4-001','MNT-S4-002')) AS src
ON tgt.employee_id = src.eid AND tgt.skill_id = src.skill_id
WHEN MATCHED THEN UPDATE SET status = src.st, updated_at = src.ua
WHEN NOT MATCHED THEN INSERT (employee_id, skill_id, status, updated_at) VALUES (src.eid, src.skill_id, src.st, src.ua);

-- ============================================================
-- 11. SAMPLE VALIDATION REQUESTS
-- ============================================================

-- emp_john → OPS-S2-003 pending
IF NOT EXISTS (SELECT 1 FROM trx_validation_request
               WHERE employee_id = 1002
                 AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'OPS-S2-003')
                 AND status IN ('pending','approved','revision_required'))
    INSERT INTO trx_validation_request
        (employee_id, skill_id, supervisor_id, status, request_date, employee_notes)
    SELECT 1002, skill_id, 1010, 'pending', DATEADD(day,-2,GETDATE()),
           'I have been working with load calculations daily for 3 weeks and feel ready for validation.'
    FROM mst_skill WHERE skill_code = 'OPS-S2-003';

-- emp_sarah → HR-S3-001 pending
IF NOT EXISTS (SELECT 1 FROM trx_validation_request
               WHERE employee_id = 1003
                 AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'HR-S3-001')
                 AND status IN ('pending','approved','revision_required'))
    INSERT INTO trx_validation_request
        (employee_id, skill_id, supervisor_id, status, request_date, employee_notes)
    SELECT 1003, skill_id, 1010, 'pending', DATEADD(day,-1,GETDATE()),
           'I have drafted and reviewed IDPs for 5 team members over the past quarter.'
    FROM mst_skill WHERE skill_code = 'HR-S3-001';

-- emp_emily → MNT-S2-002 approved (supervisor already decided)
IF NOT EXISTS (SELECT 1 FROM trx_validation_request
               WHERE employee_id = 1005
                 AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'MNT-S2-002'))
    INSERT INTO trx_validation_request
        (employee_id, skill_id, supervisor_id, status, request_date, decision_date, employee_notes, supervisor_notes)
    SELECT 1005, skill_id, 1010, 'approved',
           DATEADD(day,-7,GETDATE()), DATEADD(day,-3,GETDATE()),
           'Completed on-the-job training for electrical systems repair with senior guidance.',
           'Approved. Emily has demonstrated consistent accuracy in fault diagnosis during shift observations.'
    FROM mst_skill WHERE skill_code = 'MNT-S2-002';
-- emp_emily → MNT-S2-003 pending
IF NOT EXISTS (SELECT 1 FROM trx_validation_request
               WHERE employee_id = 1005
                 AND skill_id = (SELECT skill_id FROM mst_skill WHERE skill_code = 'MNT-S2-003')
                 AND status IN ('pending','approved','revision_required'))
    INSERT INTO trx_validation_request
        (employee_id, skill_id, supervisor_id, status, request_date, employee_notes)
    SELECT 1005, skill_id, 1010, 'pending', DATEADD(day,-2,GETDATE()),
           'Completed the component inspection module and performed 12 inspections under supervision.'
    FROM mst_skill WHERE skill_code = 'MNT-S2-003';
