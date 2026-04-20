-- Add recurrence column to calendar_tasks
ALTER TABLE calendar_tasks
ADD COLUMN IF NOT EXISTS recurrence TEXT NOT NULL DEFAULT 'none'
CHECK (recurrence IN ('none', 'daily', 'weekdays', 'weekly', 'monthly'));
