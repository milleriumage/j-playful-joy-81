-- Atualizar a vitrine do usuário padrão com suas mídias
UPDATE vitrine 
SET media = (
  SELECT json_agg(
    json_build_object(
      'id', id,
      'type', type,
      'storage_path', storage_path,
      'name', name,
      'description', description,
      'price', price,
      'link', link,
      'external_link', external_link,
      'is_locked', is_locked,
      'is_blurred', is_blurred,
      'is_main', is_main,
      'blur_settings', blur_settings,
      'timer_settings', timer_settings,
      'pinned', pinned
    )
  )
  FROM media_items 
  WHERE user_id = '171c4bb2-9fdd-4c5e-a340-c3f2c8c89e07'
)
WHERE owner_id = '171c4bb2-9fdd-4c5e-a340-c3f2c8c89e07';