-- ============================================================
-- STEP 1: ALTER EXISTING TABLES
-- Run this script on the SAR_REVAMP database before starting
-- the application. All columns use safe IF NOT EXISTS guards.
-- ============================================================

USE SAR_REVAMP;
GO

-- ============================================================
-- mst_skill  (maps to QuestionnaireForm in the app)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'description')
    ALTER TABLE mst_skill ADD description NVARCHAR(500) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'time_limit_minutes')
    ALTER TABLE mst_skill ADD time_limit_minutes INT NOT NULL DEFAULT 60;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'passing_score')
    ALTER TABLE mst_skill ADD passing_score INT NOT NULL DEFAULT 70;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'is_active')
    ALTER TABLE mst_skill ADD is_active BIT NOT NULL DEFAULT 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'created_at')
    ALTER TABLE mst_skill ADD created_at DATETIME NOT NULL DEFAULT GETDATE();
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_skill') AND name = 'updated_at')
    ALTER TABLE mst_skill ADD updated_at DATETIME NOT NULL DEFAULT GETDATE();
GO

-- ============================================================
-- mst_question  (maps to Question in the app)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'question_type')
    ALTER TABLE mst_question ADD question_type VARCHAR(50) NOT NULL DEFAULT 'multiple-choice';
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'is_required')
    ALTER TABLE mst_question ADD is_required BIT NOT NULL DEFAULT 1;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'points')
    ALTER TABLE mst_question ADD points INT NOT NULL DEFAULT 10;
GO

-- Stores the correct answer for short-answer and long-answer questions
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'correct_answer')
    ALTER TABLE mst_question ADD correct_answer NVARCHAR(MAX) NULL;
GO

-- Used to preserve the order questions appear in the exam
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('mst_question') AND name = 'sort_order')
    ALTER TABLE mst_question ADD sort_order INT NOT NULL DEFAULT 0;
GO

-- ============================================================
-- trx_assessment  (maps to ExamSession in the app)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'start_time')
    ALTER TABLE trx_assessment ADD start_time DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'end_time')
    ALTER TABLE trx_assessment ADD end_time DATETIME NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'score')
    ALTER TABLE trx_assessment ADD score INT NULL;  -- percentage 0–100
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'total_points')
    ALTER TABLE trx_assessment ADD total_points INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'earned_points')
    ALTER TABLE trx_assessment ADD earned_points INT NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment') AND name = 'passed')
    ALTER TABLE trx_assessment ADD passed BIT NULL;
GO

-- ============================================================
-- trx_assessment_answer
-- Add answer_text for short-answer / long-answer responses
-- Also make selected_answer_id nullable (some answers are text only)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('trx_assessment_answer') AND name = 'answer_text')
    ALTER TABLE trx_assessment_answer ADD answer_text NVARCHAR(MAX) NULL;
GO

-- Drop FK on selected_answer_id if it exists so we can make the column nullable
DECLARE @fkName NVARCHAR(256);
SELECT @fkName = fk.name
FROM sys.foreign_keys fk
JOIN sys.foreign_key_columns fkc ON fk.object_id = fkc.constraint_object_id
JOIN sys.columns c ON fkc.parent_object_id = c.object_id AND fkc.parent_column_id = c.column_id
WHERE fk.parent_object_id = OBJECT_ID('trx_assessment_answer')
  AND c.name = 'selected_answer_id';

IF @fkName IS NOT NULL
    EXEC ('ALTER TABLE trx_assessment_answer DROP CONSTRAINT ' + @fkName);
GO

-- Make selected_answer_id nullable (required for text-type answers that have no mst_answer row)
IF EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('trx_assessment_answer')
      AND name = 'selected_answer_id'
      AND is_nullable = 0
)
BEGIN
    ALTER TABLE trx_assessment_answer ALTER COLUMN selected_answer_id INT NULL;
END
GO

-- ============================================================
-- NEW TABLE: trx_assessment_violation
-- Stores every anti-cheating violation detected during an exam
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.objects WHERE object_id = OBJECT_ID('trx_assessment_violation') AND type = 'U')
BEGIN
    CREATE TABLE trx_assessment_violation (
        violation_id    INT IDENTITY(1,1) PRIMARY KEY,
        assessment_id   INT NOT NULL,
        violation_type  VARCHAR(50) NOT NULL,   -- 'tab_switch' | 'window_blur' | 'right_click' | 'copy_paste'
        violation_time  DATETIME NOT NULL DEFAULT GETDATE(),
        description     NVARCHAR(255) NULL,
        CONSTRAINT FK_violation_assessment
            FOREIGN KEY (assessment_id) REFERENCES trx_assessment(assessment_id)
    );
END
GO

PRINT 'Schema migration completed successfully.';
