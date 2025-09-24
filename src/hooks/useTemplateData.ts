import { useState, useEffect } from 'react';

// Dados template para manter UI estável em modo guest
const TEMPLATE_DATA = {
  mediaItems: [
    {
      id: 'template-1',
      type: 'image' as const,
      storage_path: '/lovable-uploads/22288ea1-96a3-4b30-9fd0-391060497fdc.png',
      is_locked: false,
      is_blurred: false,
      is_main: true,
      created_at: new Date().toISOString(),
      user_id: 'template',
      name: 'PRO Plan',
      description: 'Plano profissional premium',
      price: null,
      link: null,
      external_link: null,
      blur_settings: null,
      pinned: false,
      timer_settings: null,
      updated_at: new Date().toISOString()
    },
    {
      id: 'template-2',
      type: 'image' as const,
      storage_path: '/lovable-uploads/306e61bd-39e6-4ddb-8417-226587fb53db.png',
      is_locked: false,
      is_blurred: false,
      is_main: false,
      created_at: new Date().toISOString(),
      user_id: 'template',
      name: 'Get 50 Credits',
      description: 'Obtenha créditos VIP',
      price: null,
      link: null,
      external_link: null,
      blur_settings: null,
      pinned: false,
      timer_settings: null,
      updated_at: new Date().toISOString()
    }
  ],
  messages: [
    {
      id: 'template-msg-1',
      user_id: 'template',
      content: 'Bem-vindo! Este é um exemplo de mensagem.',
      speech_text: 'Olá! Faça login para personalizar totalmente seu perfil.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ],
  socialIcons: [
    {
      id: 'template-social-1',
      user_id: 'template',
      icon_url: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg',
      link: 'https://instagram.com',
      order_index: 1,
      created_at: new Date().toISOString()
    }
  ],
  userSettings: {
    visual_config: {
      theme: 'default',
      colors: {
        primary: '#3b82f6',
        secondary: '#64748b'
      }
    },
    initialized: true
  }
};

export const useTemplateData = () => {
  const [templateData] = useState(TEMPLATE_DATA);

  // Função para obter dados template sem autenticação
  const getTemplateMediaItems = () => templateData.mediaItems;
  const getTemplateMessages = () => templateData.messages;
  const getTemplateSocialIcons = () => templateData.socialIcons;
  const getTemplateUserSettings = () => templateData.userSettings;

  return {
    templateData,
    getTemplateMediaItems,
    getTemplateMessages,
    getTemplateSocialIcons,
    getTemplateUserSettings
  };
};