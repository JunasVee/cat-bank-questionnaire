-- ============================================================
-- STEP 1: ALTER EXISTING TABLES
-- Compatible with any SQL Server client (no GO required).
-- Run against the SAR_REVAMP database.
-- ============================================================

-- mst_skill
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'description')
    ALTER TABLE mst_skill ADD description NVARCHAR(500) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'time_limit_minutes')
    ALTER TABLE mst_skill ADD time_limit_minutes INT NOT NULL DEFAULT 60;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'passing_score')
    ALTER TABLE mst_skill ADD passing_score INT NOT NULL DEFAULT 70;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'is_active')
    ALTER TABLE mst_skill ADD is_active BIT NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'created_at')
    ALTER TABLE mst_skill ADD created_at DATETIME NOT NULL DEFAULT GETDATE();

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'updated_at')
    ALTER TABLE mst_skill ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();

-- mst_question
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'question_type')
    ALTER TABLE mst_question ADD question_type VARCHAR(50) NOT NULL DEFAULT 'multiple-choice';

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'is_required')
    ALTER TABLE mst_question ADD is_required BIT NOT NULL DEFAULT 1;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'points')
    ALTER TABLE mst_question ADD points INT NOT NULL DEFAULT 10;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'correct_answer')
    ALTER TABLE mst_question ADD correct_answer NVARCHAR(MAX) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'sort_order')
    ALTER TABLE mst_question ADD sort_order INT NOT NULL DEFAULT 0;

-- trx_assessment
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'start_time')
    ALTER TABLE trx_assessment ADD start_time DATETIME NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'end_time')
    ALTER TABLE trx_assessment ADD end_time DATETIME NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'score')
    ALTER TABLE trx_assessment ADD score INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'total_points')
    ALTER TABLE trx_assessment ADD total_points INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'earned_points')
    ALTER TABLE trx_assessment ADD earned_points INT NULL;

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'passed')
    ALTER TABLE trx_assessment ADD passed BIT NULL;

-- trx_assessment_answer: add answer_text for free-text responses
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment_answer') AND name = 'answer_text')
    ALTER TABLE trx_assessment_answer ADD answer_text NVARCHAR(MAX) NULL;

-- Make selected_answer_id nullable (needed for short/long-answer questions).
-- Drop the FK constraint first if it exists, then alter the column.
DECLARE @fkName NVARCHAR(256);
SELECT @fkName = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
WHERE fk.parent_object_id = OBJECT_ID('trx_assessment_answer')
  AND c.name = 'selected_answer_id';

IF @fkName IS NOT NULL
    EXEC ('ALTER TABLE trx_assessment_answer DROP CONSTRAINT ' + @fkName);

IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('trx_assessment_answer')
      AND name = 'selected_answer_id'
      AND is_nullable = 0
)
    ALTER TABLE trx_assessment_answer ALTER COLUMN selected_answer_id INT NULL;

-- NEW TABLE: trx_assessment_violation
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('trx_assessment_violation') AND type = 'U')
    CREATE TABLE trx_assessment_violation (
        violation_id   INT IDENTITY(1,1) PRIMARY KEY,
        assessment_id  INT NOT NULL,
        violation_type VARCHAR(50) NOT NULL,
        violation_time DATETIME NOT NULL DEFAULT GETDATE(),
        description    NVARCHAR(255) NULL,
        CONSTRAINT FK_violation_assessment
            FOREIGN KEY (assessment_id) REFERENCES trx_assessment(assessment_id)
    );
