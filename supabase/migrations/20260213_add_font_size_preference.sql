-- Add font_size_preference column to profiles table
-- This allows users to customize the zoom/font size of the application
-- Range: 75-150 (representing 75% to 150% scaling)
-- Default: 100 (100% - normal size)

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS font_size_preference INTEGER DEFAULT 100;

-- Add constraint to ensure valid range
ALTER TABLE profiles
ADD CONSTRAINT font_size_preference_range 
CHECK (font_size_preference >= 75 AND font_size_preference <= 150);

-- Add comment for documentation
COMMENT ON COLUMN profiles.font_size_preference IS 'User font size preference (75-150, default 100 = 100%)';
