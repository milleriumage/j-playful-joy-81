-- Drop existing function first
DROP FUNCTION IF EXISTS clean_expired_unlocks();

-- Clean up any existing test unlocks
DELETE FROM user_unlocks WHERE expires_at < now();

-- Recreate the function with correct return type
CREATE OR REPLACE FUNCTION clean_expired_unlocks()
RETURNS void AS $$
BEGIN
  DELETE FROM user_unlocks WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled trigger (runs on any unlock operation)
DROP TRIGGER IF EXISTS auto_clean_expired_unlocks ON user_unlocks;
CREATE TRIGGER auto_clean_expired_unlocks
  AFTER INSERT OR UPDATE ON user_unlocks
  FOR EACH STATEMENT
  EXECUTE FUNCTION clean_expired_unlocks();