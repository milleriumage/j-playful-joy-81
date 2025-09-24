-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  profile_photo_url text,
  email text UNIQUE,
  email_password_encrypted text,
  birth_date date,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de assinaturas/planos/créditos
CREATE TABLE public.subscriptions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text DEFAULT 'free',
  status text DEFAULT 'active',
  credits integer DEFAULT 80,
  lock_password_hash text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de configurações do usuário
CREATE TABLE public.user_settings (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  visual_config jsonb DEFAULT '{}',
  adaptive_test_state jsonb DEFAULT '{}',
  last_login timestamptz,
  initialized boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Atualizar tabela media_items existente para seguir o novo schema
ALTER TABLE public.media_items DROP COLUMN IF EXISTS user_id;
ALTER TABLE public.media_items ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.media_items ADD COLUMN blur_settings jsonb DEFAULT '{}';
ALTER TABLE public.media_items ADD COLUMN timer_settings jsonb DEFAULT '{}';
ALTER TABLE public.media_items ADD COLUMN external_link text;
ALTER TABLE public.media_items ADD COLUMN pinned boolean DEFAULT false;
ALTER TABLE public.media_items RENAME COLUMN url TO storage_path;

-- Tabela de métricas de mídia
CREATE TABLE public.media_metrics (
  media_id uuid PRIMARY KEY REFERENCES media_items(id) ON DELETE CASCADE,
  likes bigint DEFAULT 0,
  views bigint DEFAULT 0,
  shares bigint DEFAULT 0,
  clicks bigint DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

-- Tabela de ícones sociais
CREATE TABLE public.social_icons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  icon_url text,
  link text,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Atualizar tabela notifications existente para seguir o novo schema
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS read boolean DEFAULT false;

-- Tabela de mensagens do chat
CREATE TABLE public.chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_icons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Users can access own profiles" ON public.profiles
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para subscriptions
CREATE POLICY "Users can access own subscriptions" ON public.subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para user_settings
CREATE POLICY "Users can access own settings" ON public.user_settings
  FOR ALL USING (auth.uid() = user_id);

-- Políticas RLS para media_items (atualizar existentes)
DROP POLICY IF EXISTS "Anyone can delete media" ON public.media_items;
DROP POLICY IF EXISTS "Anyone can insert media" ON public.media_items;
DROP POLICY IF EXISTS "Anyone can update media" ON public.media_items;
DROP POLICY IF EXISTS "Media items are viewable by everyone" ON public.media_items;

CREATE POLICY "Users can manage own media" ON public.media_items
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Media items are viewable by everyone" ON public.media_items
  FOR SELECT USING (true);

-- Políticas RLS para media_metrics
CREATE POLICY "Anyone can view media metrics" ON public.media_metrics
  FOR SELECT USING (true);

CREATE POLICY "Users can update metrics of own media" ON public.media_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM media_items 
      WHERE media_items.id = media_metrics.media_id 
      AND media_items.user_id = auth.uid()
    )
  );

-- Políticas RLS para social_icons
CREATE POLICY "Users can manage own social icons" ON public.social_icons
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Social icons are viewable by everyone" ON public.social_icons
  FOR SELECT USING (true);

-- Políticas RLS para chat_messages
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
  FOR ALL USING (auth.uid() = user_id);

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_items_updated_at
  BEFORE UPDATE ON public.media_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_metrics_updated_at
  BEFORE UPDATE ON public.media_metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_icons_updated_at
  BEFORE UPDATE ON public.social_icons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para clonar dados do usuário template para novo usuário
CREATE OR REPLACE FUNCTION public.clone_template_user_data(new_user_id uuid, template_user_id uuid DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  default_template_id uuid;
BEGIN
  -- Se não fornecido template_user_id, usar um padrão (pode ser configurado depois)
  IF template_user_id IS NULL THEN
    -- Por enquanto, vamos usar o primeiro usuário como template
    SELECT user_id INTO default_template_id FROM user_settings WHERE initialized = true LIMIT 1;
    IF default_template_id IS NULL THEN
      RETURN; -- Nenhum template disponível
    END IF;
    template_user_id := default_template_id;
  END IF;

  -- Verificar se o usuário já foi inicializado
  IF EXISTS (SELECT 1 FROM user_settings WHERE user_id = new_user_id AND initialized = true) THEN
    RETURN; -- Já inicializado
  END IF;

  -- Clonar user_settings
  INSERT INTO user_settings (user_id, visual_config, adaptive_test_state, last_login, initialized)
  SELECT 
    new_user_id,
    visual_config,
    adaptive_test_state,
    now(),
    true
  FROM user_settings
  WHERE user_id = template_user_id
  ON CONFLICT (user_id) DO UPDATE SET
    visual_config = EXCLUDED.visual_config,
    adaptive_test_state = EXCLUDED.adaptive_test_state,
    initialized = true,
    updated_at = now();

  -- Clonar social_icons
  INSERT INTO social_icons (user_id, icon_url, link, order_index)
  SELECT 
    new_user_id,
    icon_url,
    link,
    order_index
  FROM social_icons
  WHERE user_id = template_user_id;

  -- Criar subscription padrão
  INSERT INTO subscriptions (user_id, plan, status, credits)
  VALUES (new_user_id, 'free', 'active', 80)
  ON CONFLICT (user_id) DO UPDATE SET
    credits = GREATEST(subscriptions.credits, 80); -- Não diminuir créditos existentes

  -- Criar profile básico
  INSERT INTO profiles (user_id, created_at, updated_at)
  VALUES (new_user_id, now(), now())
  ON CONFLICT (user_id) DO NOTHING;

END;
$$;

-- Atualizar função handle_new_user existente para usar a nova arquitetura
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Criar perfil básico
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  
  -- Clonar dados do template (se existir)
  PERFORM clone_template_user_data(NEW.id);
  
  RETURN NEW;
END;
$$;

-- Índices para performance
CREATE INDEX idx_media_items_user_id ON public.media_items(user_id);
CREATE INDEX idx_social_icons_user_id ON public.social_icons(user_id);
CREATE INDEX idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX idx_social_icons_order ON public.social_icons(user_id, order_index);
CREATE INDEX idx_chat_messages_created_at ON public.chat_messages(user_id, created_at DESC);