-- Adicionar media_items de template para o usuário template
INSERT INTO media_items (
  id, user_id, type, storage_path, is_locked, is_blurred, is_main, 
  name, description, price, link, external_link, blur_settings, 
  timer_settings, pinned, created_at, updated_at
) VALUES 
(
  gen_random_uuid(),
  '509bdca7-b48f-47ab-8150-261585a125c2', 
  'image',
  '/lovable-uploads/7503b55d-e8fe-47c3-9366-ca734fd0c867.png',
  false,
  false,
  true,
  'Imagem Principal',
  'Conteúdo de demonstração',
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  false,
  now(),
  now()
),
(
  gen_random_uuid(),
  '509bdca7-b48f-47ab-8150-261585a125c2', 
  'image',
  '/lovable-uploads/7503b55d-e8fe-47c3-9366-ca734fd0c867.png',
  false,
  false,
  false,
  'Slot 2',
  'Segundo slot disponível',
  NULL,
  NULL,
  NULL,
  '{}',
  '{}',
  false,
  now(),
  now()
);