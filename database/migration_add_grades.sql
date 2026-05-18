-- Migration: Add Grades & Feedback and Extension Deadline features
-- Date: 2026-03-10

USE student_assignment_tracker;

-- Add grade and feedback columns to submissions table
ALTER TABLE submissions 
ADD COLUMN grade INT NULL AFTER submitted_at,
ADD COLUMN feedback LONGTEXT NULL AFTER grade,
ADD COLUMN submitted_late BOOLEAN DEFAULT FALSE AFTER feedback,
ADD COLUMN graded_at TIMESTAMP NULL AFTER submitted_late;

-- Add extension deadline to assignments table
ALTER TABLE assignments 
ADD COLUMN extension_deadline DATETIME NULL AFTER due_date;

-- Create index for better query performance
CREATE INDEX idx_submissions_grade ON submissions(grade);
CREATE INDEX idx_assignments_extension ON assignments(extension_deadline);

-- Verify the changes
DESCRIBE submissions;
DESCRIBE assignments;
