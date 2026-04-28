-- ============================================================
-- STEP 2: DUMMY DATA
-- Run AFTER 01_alter_tables.sql.
-- Compatible with any SQL Server client (no GO required).
--
-- Passwords are SHA-256 hashes (lowercase hex), same as the app uses.
--   admin_user  → Admin@1234
--   emp_john    → John@1234
--   emp_sarah   → Sarah@1234
--   emp_michael → Michael@1234
--   emp_emily   → Emily@1234
-- ============================================================

-- ============================================================
-- Roles
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_role WHERE role_name = 'Admin')
    INSERT INTO mst_role (role_name) VALUES ('Admin');

IF NOT EXISTS (SELECT 1 FROM mst_role WHERE role_name = 'Employee')
    INSERT INTO mst_role (role_name) VALUES ('Employee');

-- ============================================================
-- Programs (Departments)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_program WHERE program_name = 'Operations')
    INSERT INTO mst_program (program_name) VALUES ('Operations');

IF NOT EXISTS (SELECT 1 FROM mst_program WHERE program_name = 'Human Resources')
    INSERT INTO mst_program (program_name) VALUES ('Human Resources');

IF NOT EXISTS (SELECT 1 FROM mst_program WHERE program_name = 'Information Technology')
    INSERT INTO mst_program (program_name) VALUES ('Information Technology');

IF NOT EXISTS (SELECT 1 FROM mst_program WHERE program_name = 'Maintenance')
    INSERT INTO mst_program (program_name) VALUES ('Maintenance');

IF NOT EXISTS (SELECT 1 FROM mst_program WHERE program_name = 'Finance')
    INSERT INTO mst_program (program_name) VALUES ('Finance');

-- ============================================================
-- Program Stages
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id WHERE p.program_name = 'Operations' AND ps.stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Level 1' FROM mst_program WHERE program_name = 'Operations';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id WHERE p.program_name = 'Human Resources' AND ps.stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Level 1' FROM mst_program WHERE program_name = 'Human Resources';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id WHERE p.program_name = 'Information Technology' AND ps.stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Level 1' FROM mst_program WHERE program_name = 'Information Technology';

IF NOT EXISTS (SELECT 1 FROM mst_program_stage ps JOIN mst_program p ON ps.program_id = p.program_id WHERE p.program_name = 'Maintenance' AND ps.stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name)
    SELECT program_id, 'Level 1' FROM mst_program WHERE program_name = 'Maintenance';

-- ============================================================
-- Employees
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'admin_user')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    SELECT
        1001,
        'admin_user',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Admin@1234'), 2)),
        'System Administrator',
        r.role_id,
        p.program_id
    FROM mst_role r, mst_program p
    WHERE r.role_name = 'Admin' AND p.program_name = 'Operations';

IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_john')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    SELECT
        1002,
        'emp_john',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'John@1234'), 2)),
        'John Anderson',
        r.role_id,
        p.program_id
    FROM mst_role r, mst_program p
    WHERE r.role_name = 'Employee' AND p.program_name = 'Operations';

IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_sarah')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    SELECT
        1003,
        'emp_sarah',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Sarah@1234'), 2)),
        'Sarah Mitchell',
        r.role_id,
        p.program_id
    FROM mst_role r, mst_program p
    WHERE r.role_name = 'Employee' AND p.program_name = 'Human Resources';

IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_michael')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    SELECT
        1004,
        'emp_michael',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Michael@1234'), 2)),
        'Michael Chen',
        r.role_id,
        p.program_id
    FROM mst_role r, mst_program p
    WHERE r.role_name = 'Employee' AND p.program_name = 'Information Technology';

IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_emily')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    SELECT
        1005,
        'emp_emily',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Emily@1234'), 2)),
        'Emily Rodriguez',
        r.role_id,
        p.program_id
    FROM mst_role r, mst_program p
    WHERE r.role_name = 'Employee' AND p.program_name = 'Maintenance';

-- ============================================================
-- Skills (Questionnaires)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-EMP-2024-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'CAT-EMP-2024-001', 'Caterpillar Safety & Operations Assessment',
        'Annual employee assessment covering safety protocols, equipment operation, and company policies.',
        program_id, NULL, 60, 70, 1, GETDATE(), GETDATE()
    FROM mst_program WHERE program_name = 'Operations';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-HR-2024-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'CAT-HR-2024-001', 'HR Compliance & Policy Assessment',
        'Assessment covering company HR policies, workplace conduct, and compliance requirements.',
        program_id, NULL, 45, 80, 1, GETDATE(), GETDATE()
    FROM mst_program WHERE program_name = 'Human Resources';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-IT-2024-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'CAT-IT-2024-001', 'IT Security Awareness Training',
        'Assessment on cybersecurity best practices and IT policies.',
        program_id, NULL, 30, 75, 0, GETDATE(), GETDATE()
    FROM mst_program WHERE program_name = 'Information Technology';

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-MNT-2024-001')
    INSERT INTO mst_skill (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    SELECT 'CAT-MNT-2024-001', 'Equipment Maintenance Certification',
        'Certification exam for maintenance technicians covering equipment diagnostics and repair procedures.',
        program_id, NULL, 90, 85, 1, GETDATE(), GETDATE()
    FROM mst_program WHERE program_name = 'Maintenance';

-- ============================================================
-- Questions & Answers — CAT-EMP-2024-001
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_question q JOIN mst_skill s ON q.skill_id = s.skill_id WHERE s.skill_code = 'CAT-EMP-2024-001')
BEGIN
    DECLARE @emp_skill_id INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-EMP-2024-001');
    DECLARE @emp_q1 INT, @emp_q2 INT, @emp_q3 INT, @emp_q4 INT, @emp_q5 INT;

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@emp_skill_id, 'What is the primary purpose of the pre-operation inspection checklist for heavy equipment?', 'multiple-choice', 1, 10, NULL, 0);
    SET @emp_q1 = SCOPE_IDENTITY();
    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@emp_q1, 'To delay the start of work', 0),
        (@emp_q1, 'To identify potential safety hazards and equipment issues before operation', 1),
        (@emp_q1, 'To increase paperwork documentation', 0),
        (@emp_q1, 'To satisfy regulatory requirements only', 0);

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@emp_skill_id, 'Which of the following are required PPE when operating heavy machinery? (Select all that apply)', 'checkbox', 1, 15, NULL, 1);
    SET @emp_q2 = SCOPE_IDENTITY();
    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@emp_q2, 'Hard hat', 1),
        (@emp_q2, 'Safety glasses', 1),
        (@emp_q2, 'Steel-toed boots', 1),
        (@emp_q2, 'High-visibility vest', 1),
        (@emp_q2, 'Casual footwear', 0);

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@emp_skill_id, 'All Caterpillar employees must complete safety training before operating any heavy equipment.', 'true-false', 1, 10, NULL, 2);
    SET @emp_q3 = SCOPE_IDENTITY();
    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@emp_q3, 'True', 1),
        (@emp_q3, 'False', 0);

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@emp_skill_id, 'What is the maximum load capacity (in tons) for a CAT 320 Excavator?', 'short-answer', 1, 10, '22', 3);
    SET @emp_q4 = SCOPE_IDENTITY();

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@emp_skill_id, 'Describe the proper procedure for reporting a safety incident at a Caterpillar facility.', 'long-answer', 1, 20, '1. Stop work immediately 2. Ensure safety of all personnel 3. Report to immediate supervisor 4. Contact Safety Department 5. Document the incident 6. Cooperate with investigation', 4);
    SET @emp_q5 = SCOPE_IDENTITY();
END;

-- ============================================================
-- Questions & Answers — CAT-HR-2024-001
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_question q JOIN mst_skill s ON q.skill_id = s.skill_id WHERE s.skill_code = 'CAT-HR-2024-001')
BEGIN
    DECLARE @hr_skill_id INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-HR-2024-001');
    DECLARE @hr_q1 INT, @hr_q2 INT;

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@hr_skill_id, 'What is the maximum number of consecutive days an employee can take as paid vacation without prior approval?', 'multiple-choice', 1, 10, NULL, 0);
    SET @hr_q1 = SCOPE_IDENTITY();
    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@hr_q1, '3 days', 0),
        (@hr_q1, '5 days', 1),
        (@hr_q1, '7 days', 0),
        (@hr_q1, '10 days', 0);

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@hr_skill_id, 'Harassment complaints should be reported to HR within 48 hours of the incident.', 'true-false', 1, 10, NULL, 1);
    SET @hr_q2 = SCOPE_IDENTITY();
    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@hr_q2, 'True', 1),
        (@hr_q2, 'False', 0);
END;

-- ============================================================
-- Questions & Answers — CAT-IT-2024-001
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_question q JOIN mst_skill s ON q.skill_id = s.skill_id WHERE s.skill_code = 'CAT-IT-2024-001')
BEGIN
    DECLARE @it_skill_id INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-IT-2024-001');
    DECLARE @it_q1 INT;

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@it_skill_id, 'Which of the following are signs of a phishing email? (Select all that apply)', 'checkbox', 1, 15, NULL, 0);
    SET @it_q1 = SCOPE_IDENTITY();
    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@it_q1, 'Urgent language demanding immediate action', 1),
        (@it_q1, 'Suspicious sender email address', 1),
        (@it_q1, 'Email from your direct manager', 0),
        (@it_q1, 'Unexpected attachments', 1);
END;

-- ============================================================
-- Questions & Answers — CAT-MNT-2024-001
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_question q JOIN mst_skill s ON q.skill_id = s.skill_id WHERE s.skill_code = 'CAT-MNT-2024-001')
BEGIN
    DECLARE @mnt_skill_id INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-MNT-2024-001');
    DECLARE @mnt_q1 INT;

    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@mnt_skill_id, 'What is the recommended interval for hydraulic fluid replacement in CAT machinery?', 'multiple-choice', 1, 10, NULL, 0);
    SET @mnt_q1 = SCOPE_IDENTITY();
    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@mnt_q1, 'Every 500 hours', 0),
        (@mnt_q1, 'Every 1000 hours', 0),
        (@mnt_q1, 'Every 2000 hours', 1),
        (@mnt_q1, 'Every 5000 hours', 0);
END;
