import React from 'react';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const LanguageSelector = ({ currentLanguage, onLanguageChange }: LanguageSelectorProps) => {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
      <Globe className="w-4 h-4 text-white" />
      <Button
        variant={currentLanguage === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('en')}
        className={`text-xs px-3 py-1 rounded-full ${
          currentLanguage === 'en' 
            ? 'bg-white text-black' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        EN
      </Button>
      <Button
        variant={currentLanguage === 'pt' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onLanguageChange('pt')}
        className={`text-xs px-3 py-1 rounded-full ${
          currentLanguage === 'pt' 
            ? 'bg-white text-black' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        PT
      </Button>
    </div>
  );
};