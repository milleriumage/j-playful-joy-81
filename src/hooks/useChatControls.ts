
import { useState, useEffect } from 'react';

export interface ChatControls {
  allowImageUpload: boolean;
  allowVoiceMessages: boolean;
  temporaryMessages: boolean; // Mensagens não persistem (apenas em memória)
}

export const useChatControls = () => {
  const [controls, setControls] = useState<ChatControls>({
    allowImageUpload: true,
    allowVoiceMessages: true,
    temporaryMessages: false
  });

  useEffect(() => {
    const savedControls = localStorage.getItem('chatControls');
    if (savedControls) {
      setControls(JSON.parse(savedControls));
    }
  }, []);

  const updateControls = (newControls: Partial<ChatControls>) => {
    const updated = { ...controls, ...newControls };
    setControls(updated);
    localStorage.setItem('chatControls', JSON.stringify(updated));
  };

  return { controls, updateControls };
};
