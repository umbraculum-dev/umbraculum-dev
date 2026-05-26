-- Add BrewSessionStepStatus value: in_progress
ALTER TYPE "brew_session_step_status"
ADD VALUE IF NOT EXISTS 'in_progress' AFTER 'pending';

