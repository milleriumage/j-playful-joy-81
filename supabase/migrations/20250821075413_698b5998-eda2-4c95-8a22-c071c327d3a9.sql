-- Clean up any existing test unlocks
DELETE FROM user_unlocks WHERE expires_at < now();

-- Add a trigger to automatically clean expired unlocks
CREATE OR REPLACE FUNCTION clean_expired_unlocks()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM user_unlocks WHERE expires_at < now();
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled trigger (runs on any unlock operation)
DROP TRIGGER IF EXISTS auto_clean_expired_unlocks ON user_unlocks;
CREATE TRIGGER auto_clean_expired_unlocks
  AFTER INSERT OR UPDATE ON user_unlocks
  FOR EACH STATEMENT
  EXECUTE FUNCTION clean_expired_unlocks();