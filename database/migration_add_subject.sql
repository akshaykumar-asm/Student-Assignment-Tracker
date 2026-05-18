-- Migration: Add Subject Field to Assignments Table
-- Date: 2026-03-11
-- Description: Adds subject column to assignments table to track the subject for each assignment
-- Allows students to see which subject an assignment belongs to

-- Step 1: Add the subject column to assignments table
ALTER TABLE assignments 
ADD COLUMN subject VARCHAR(100) NOT NULL DEFAULT 'General' 
AFTER title;

-- Step 2: Update schema to remove default constraint (optional - for production use)
-- Once migration is complete, you can use this to enforce NOT NULL without default:
-- ALTER TABLE assignments MODIFY subject VARCHAR(100) NOT NULL;

-- Verify the change
-- SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_NAME = 'assignments' AND COLUMN_NAME = 'subject';

-- Test query to verify subject is now available with assignment data
-- SELECT id, title, subject, description, teacher_id, due_date, created_at 
-- FROM assignments LIMIT 1;

-- Example of retrieving submissions with subject using JOIN:
-- SELECT 
--   s.id,
--   u.name AS student_name,
--   a.title,
--   a.subject,
--   s.file_path,
--   s.submitted_at
-- FROM submissions s
-- JOIN assignments a ON s.assignment_id = a.id
-- JOIN users u ON s.student_id = u.id
-- ORDER BY s.submitted_at DESC;
