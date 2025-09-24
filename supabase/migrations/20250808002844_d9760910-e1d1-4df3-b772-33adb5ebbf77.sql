-- Alterar coluna auto_lock_minutes para suportar decimais
ALTER TABLE subscriptions 
ALTER COLUMN auto_lock_minutes TYPE decimal(10,4);

-- Comentar que agora pode armazenar frações de minutos
COMMENT ON COLUMN subscriptions.auto_lock_minutes IS 'Auto-lock time in minutes, supports decimal values (e.g., 0.0833 for 5 seconds)';