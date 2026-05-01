-- ============================================================
-- STEP 3: SKILL TRACKING, VALIDATION FLOW, MANAGER ROLE
-- Run AFTER 02_dummy_data.sql
-- Compatible with any SQL Server client (no GO required)
-- ============================================================

-- ── New columns on mst_employee ──────────────────────────────
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_employee') AND name = 'supervisor_id')
    ALTER TABLE mst_employee ADD supervisor_id INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_employee') AND name = 'job_title')
    ALTER TABLE mst_employee ADD job_title NVARCHAR(100) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_employee') AND name = 'position_start_date')
    ALTER TABLE mst_employee ADD position_start_date DATE NULL;

-- FK for supervisor (self-referencing) — add only if not exists
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_emp_supervisor')
    ALTER TABLE mst_employee ADD CONSTRAINT FK_emp_supervisor
        FOREIGN KEY (supervisor_id) REFERENCES mst_employee(employee_id);

-- ── Manager role ─────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM mst_role WHERE role_name = 'Manager')
    INSERT INTO mst_role (role_name) VALUES ('Manager');

-- ── trx_skill_progress ───────────────────────────────────────
-- status values: not_started | on_progress | requesting_validation
--               | approved | competent | not_competent
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('trx_skill_progress') AND type = 'U')
    CREATE TABLE trx_skill_progress (
        progress_id        INT IDENTITY(1,1) PRIMARY KEY,
        employee_id        INT NOT NULL,
        skill_id           INT NOT NULL,
        status             VARCHAR(50) NOT NULL DEFAULT 'not_started',
        last_assessment_id INT NULL,
        updated_at         DATETIME NOT NULL DEFAULT GETDATE(),
        CONSTRAINT FK_sp_employee FOREIGN KEY (employee_id) REFERENCES mst_employee(employee_id),
        CONSTRAINT FK_sp_skill    FOREIGN KEY (skill_id)    REFERENCES mst_skill(skill_id),
        CONSTRAINT UQ_sp_emp_skill UNIQUE (employee_id, skill_id)
    );

-- ── trx_validation_request ───────────────────────────────────
-- status values: pending | approved | rejected | revision_required
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('trx_validation_request') AND type = 'U')
    CREATE TABLE trx_validation_request (
        request_id       INT IDENTITY(1,1) PRIMARY KEY,
        employee_id      INT NOT NULL,
        skill_id         INT NOT NULL,
        supervisor_id    INT NOT NULL,
        status           VARCHAR(50) NOT NULL DEFAULT 'pending',
        request_date     DATETIME NOT NULL DEFAULT GETDATE(),
        decision_date    DATETIME NULL,
        employee_notes   NVARCHAR(500) NULL,
        supervisor_notes NVARCHAR(500) NULL,
        CONSTRAINT FK_vr_employee   FOREIGN KEY (employee_id)   REFERENCES mst_employee(employee_id),
        CONSTRAINT FK_vr_skill      FOREIGN KEY (skill_id)      REFERENCES mst_skill(skill_id),
        CONSTRAINT FK_vr_supervisor FOREIGN KEY (supervisor_id) REFERENCES mst_employee(employee_id)
    );

-- ── Dummy manager ────────────────────────────────────────────
IF NOT EXISTS (SELECT 1 FROM mst_employee WHERE username = 'mgr_operations')
    INSERT INTO mst_employee (employee_id, username, password_hash, name, role_id, program_id, job_title, position_start_date)
    SELECT
        1010,
        'mgr_operations',
        LOWER(CONVERT(NVARCHAR(64), HASHBYTES('SHA2_256', 'Manager@1234'), 2)),
        'Robert Taylor',
        r.role_id,
        p.program_id,
        'Operations Manager',
        '2020-01-01'
    FROM mst_role r, mst_program p
    WHERE r.role_name = 'Manager' AND p.program_name = 'Operations';

-- ── Assign job titles, positions and supervisors to employees ─
UPDATE mst_employee SET
    job_title = 'Equipment Operator',
    position_start_date = '2022-03-01',
    supervisor_id = 1010
WHERE username = 'emp_john';

UPDATE mst_employee SET
    job_title = 'HR Specialist',
    position_start_date = '2021-06-15',
    supervisor_id = 1010
WHERE username = 'emp_sarah';

UPDATE mst_employee SET
    job_title = 'IT Technician',
    position_start_date = '2023-01-10',
    supervisor_id = 1010
WHERE username = 'emp_michael';

UPDATE mst_employee SET
    job_title = 'Maintenance Technician',
    position_start_date = '2022-08-20',
    supervisor_id = 1010
WHERE username = 'emp_emily';

-- ── Initialise skill_progress rows for all employees ─────────
INSERT INTO trx_skill_progress (employee_id, skill_id, status)
SELECT e.employee_id, s.skill_id, 'not_started'
FROM mst_employee e
CROSS JOIN mst_skill s
WHERE e.username IN ('emp_john', 'emp_sarah', 'emp_michael', 'emp_emily')
  AND s.is_active = 1
  AND NOT EXISTS (
      SELECT 1 FROM trx_skill_progress sp
      WHERE sp.employee_id = e.employee_id AND sp.skill_id = s.skill_id
  );
