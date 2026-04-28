-- ============================================================
-- STEP 2: DUMMY DATA
-- Run AFTER 01_alter_tables.sql.
-- Passwords are SHA-256 hashes (same algorithm the app uses).
--
--   admin_user  →  password: Admin@1234
--   emp_john    →  password: John@1234
--   emp_sarah   →  password: Sarah@1234
--   emp_michael →  password: Michael@1234
--
-- SHA-256 of "Admin@1234"   = b4ba7bf3c8ae1b9729cb7a899b18e33aaaca1e8ad0fafcdf96e2f48b1b1e2e55
-- (Generate with: SELECT CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256','Admin@1234'), 2))
-- ============================================================

USE SAR_REVAMP;
GO

-- ============================================================
-- Roles
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM mst_role WHERE role_name = 'Admin')
    INSERT INTO mst_role (role_name) VALUES ('Admin');

IF NOT EXISTS (SELECT 1 FROM mst_role WHERE role_name = 'Employee')
    INSERT INTO mst_role (role_name) VALUES ('Employee');
GO

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
GO

-- ============================================================
-- Program Stages
-- ============================================================
DECLARE @opsId INT      = (SELECT program_id FROM mst_program WHERE program_name = 'Operations');
DECLARE @hrId  INT      = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources');
DECLARE @itId  INT      = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology');
DECLARE @mntId INT      = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance');

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @opsId AND stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@opsId, 'Level 1');

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @hrId AND stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@hrId, 'Level 1');

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @itId AND stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@itId, 'Level 1');

IF NOT EXISTS (SELECT 1 FROM mst_program_stage WHERE program_id = @mntId AND stage_name = 'Level 1')
    INSERT INTO mst_program_stage (program_id, stage_name) VALUES (@mntId, 'Level 1');
GO

-- ============================================================
-- Employees
-- Passwords are SHA-256 hex strings (uppercase).
-- App hashes with: crypto.createHash('sha256').update(pwd).digest('hex')
-- which produces LOWERCASE hex — so store lowercase hashes here.
-- ============================================================
DECLARE @adminRoleId    INT = (SELECT role_id FROM mst_role WHERE role_name = 'Admin');
DECLARE @empRoleId      INT = (SELECT role_id FROM mst_role WHERE role_name = 'Employee');
DECLARE @opsProgramId   INT = (SELECT program_id FROM mst_program WHERE program_name = 'Operations');
DECLARE @hrProgramId    INT = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources');
DECLARE @itProgramId    INT = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology');
DECLARE @mntProgramId   INT = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance');

-- Admin account  (password: Admin@1234)
IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'admin_user')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    VALUES (
        1001,
        'admin_user',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Admin@1234'), 2)),
        'System Administrator',
        @adminRoleId,
        @opsProgramId
    );

-- Employee accounts
IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_john')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    VALUES (
        1002,
        'emp_john',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'John@1234'), 2)),
        'John Anderson',
        @empRoleId,
        @opsProgramId
    );

IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_sarah')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    VALUES (
        1003,
        'emp_sarah',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Sarah@1234'), 2)),
        'Sarah Mitchell',
        @empRoleId,
        @hrProgramId
    );

IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_michael')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    VALUES (
        1004,
        'emp_michael',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Michael@1234'), 2)),
        'Michael Chen',
        @empRoleId,
        @itProgramId
    );

IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'emp_emily')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id)
    VALUES (
        1005,
        'emp_emily',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Emily@1234'), 2)),
        'Emily Rodriguez',
        @empRoleId,
        @mntProgramId
    );
GO

-- ============================================================
-- Skills (Questionnaires)
-- ============================================================
DECLARE @opsProgramId2  INT = (SELECT program_id FROM mst_program WHERE program_name = 'Operations');
DECLARE @hrProgramId2   INT = (SELECT program_id FROM mst_program WHERE program_name = 'Human Resources');
DECLARE @itProgramId2   INT = (SELECT program_id FROM mst_program WHERE program_name = 'Information Technology');
DECLARE @mntProgramId2  INT = (SELECT program_id FROM mst_program WHERE program_name = 'Maintenance');

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-EMP-2024-001')
    INSERT INTO mst_skill
        (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES (
        'CAT-EMP-2024-001',
        'Caterpillar Safety & Operations Assessment',
        'Annual employee assessment covering safety protocols, equipment operation, and company policies.',
        @opsProgramId2, NULL, 60, 70, 1, GETDATE(), GETDATE()
    );

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-HR-2024-001')
    INSERT INTO mst_skill
        (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES (
        'CAT-HR-2024-001',
        'HR Compliance & Policy Assessment',
        'Assessment covering company HR policies, workplace conduct, and compliance requirements.',
        @hrProgramId2, NULL, 45, 80, 1, GETDATE(), GETDATE()
    );

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-IT-2024-001')
    INSERT INTO mst_skill
        (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES (
        'CAT-IT-2024-001',
        'IT Security Awareness Training',
        'Assessment on cybersecurity best practices and IT policies.',
        @itProgramId2, NULL, 30, 75, 0, GETDATE(), GETDATE()
    );

IF NOT EXISTS (SELECT 1 FROM mst_skill WHERE skill_code = 'CAT-MNT-2024-001')
    INSERT INTO mst_skill
        (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
    VALUES (
        'CAT-MNT-2024-001',
        'Equipment Maintenance Certification',
        'Certification exam for maintenance technicians covering equipment diagnostics and repair procedures.',
        @mntProgramId2, NULL, 90, 85, 1, GETDATE(), GETDATE()
    );
GO

-- ============================================================
-- Questions & Answers for CAT-EMP-2024-001
-- ============================================================
DECLARE @skillEmp INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-EMP-2024-001');

IF NOT EXISTS (SELECT 1 FROM mst_question WHERE skill_id = @skillEmp AND sort_order = 0)
BEGIN
    DECLARE @q1 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillEmp, 'What is the primary purpose of the pre-operation inspection checklist for heavy equipment?', 'multiple-choice', 1, 10, NULL, 0);
    SET @q1 = SCOPE_IDENTITY();

    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@q1, 'To delay the start of work', 0),
        (@q1, 'To identify potential safety hazards and equipment issues before operation', 1),
        (@q1, 'To increase paperwork documentation', 0),
        (@q1, 'To satisfy regulatory requirements only', 0);

    DECLARE @q2 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillEmp, 'Which of the following are required PPE when operating heavy machinery? (Select all that apply)', 'checkbox', 1, 15, NULL, 1);
    SET @q2 = SCOPE_IDENTITY();

    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@q2, 'Hard hat', 1),
        (@q2, 'Safety glasses', 1),
        (@q2, 'Steel-toed boots', 1),
        (@q2, 'High-visibility vest', 1),
        (@q2, 'Casual footwear', 0);

    DECLARE @q3 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillEmp, 'All Caterpillar employees must complete safety training before operating any heavy equipment.', 'true-false', 1, 10, NULL, 2);
    SET @q3 = SCOPE_IDENTITY();

    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@q3, 'True', 1),
        (@q3, 'False', 0);

    DECLARE @q4 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillEmp, 'What is the maximum load capacity (in tons) for a CAT 320 Excavator?', 'short-answer', 1, 10, '22', 3);
    SET @q4 = SCOPE_IDENTITY();

    DECLARE @q5 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillEmp, 'Describe the proper procedure for reporting a safety incident at a Caterpillar facility.', 'long-answer', 1, 20, '1. Stop work immediately 2. Ensure safety of all personnel 3. Report to immediate supervisor 4. Contact Safety Department 5. Document the incident 6. Cooperate with investigation', 4);
    SET @q5 = SCOPE_IDENTITY();
END
GO

-- ============================================================
-- Questions & Answers for CAT-HR-2024-001
-- ============================================================
DECLARE @skillHr INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-HR-2024-001');

IF NOT EXISTS (SELECT 1 FROM mst_question WHERE skill_id = @skillHr AND sort_order = 0)
BEGIN
    DECLARE @hq1 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillHr, 'What is the maximum number of consecutive days an employee can take as paid vacation without prior approval?', 'multiple-choice', 1, 10, NULL, 0);
    SET @hq1 = SCOPE_IDENTITY();

    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@hq1, '3 days', 0),
        (@hq1, '5 days', 1),
        (@hq1, '7 days', 0),
        (@hq1, '10 days', 0);

    DECLARE @hq2 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillHr, 'Harassment complaints should be reported to HR within 48 hours of the incident.', 'true-false', 1, 10, NULL, 1);
    SET @hq2 = SCOPE_IDENTITY();

    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@hq2, 'True', 1),
        (@hq2, 'False', 0);
END
GO

-- ============================================================
-- Questions & Answers for CAT-IT-2024-001
-- ============================================================
DECLARE @skillIt INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-IT-2024-001');

IF NOT EXISTS (SELECT 1 FROM mst_question WHERE skill_id = @skillIt AND sort_order = 0)
BEGIN
    DECLARE @iq1 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillIt, 'Which of the following are signs of a phishing email? (Select all that apply)', 'checkbox', 1, 15, NULL, 0);
    SET @iq1 = SCOPE_IDENTITY();

    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@iq1, 'Urgent language demanding immediate action', 1),
        (@iq1, 'Suspicious sender email address', 1),
        (@iq1, 'Email from your direct manager', 0),
        (@iq1, 'Unexpected attachments', 1);
END
GO

-- ============================================================
-- Questions & Answers for CAT-MNT-2024-001
-- ============================================================
DECLARE @skillMnt INT = (SELECT skill_id FROM mst_skill WHERE skill_code = 'CAT-MNT-2024-001');

IF NOT EXISTS (SELECT 1 FROM mst_question WHERE skill_id = @skillMnt AND sort_order = 0)
BEGIN
    DECLARE @mq1 INT;
    INSERT INTO mst_question (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
    VALUES (@skillMnt, 'What is the recommended interval for hydraulic fluid replacement in CAT machinery?', 'multiple-choice', 1, 10, NULL, 0);
    SET @mq1 = SCOPE_IDENTITY();

    INSERT INTO mst_answer (question_id, answer_text, is_correct) VALUES
        (@mq1, 'Every 500 hours', 0),
        (@mq1, 'Every 1000 hours', 0),
        (@mq1, 'Every 2000 hours', 1),
        (@mq1, 'Every 5000 hours', 0);
END
GO

PRINT 'Dummy data inserted successfully.';
