-- Adicionar 500 créditos manualmente para o usuário específico
UPDATE profiles 
SET credits = credits + 500, updated_at = now()
WHERE id = '778fc46b-faf5-4f62-aeb3-ab292ddb3fb5';

-- Criar notificação para o usuário
INSERT INTO notifications (user_id, type, title, message, credits_amount)
VALUES (
  '59ab12ac-ab84-45af-87ae-383329d60661',
  'credit_addition',
  '💳 Créditos Adicionados Manualmente!',
  'Você recebeu 500 créditos adicionados manualmente pelo administrador do sistema.',
  500
);