import React from 'react';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface ThemeToggleProps {
  isDarkTheme: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const ThemeToggle = ({ isDarkTheme, onThemeChange }: ThemeToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full p-2 border border-white/20">
      <Palette className="w-4 h-4 text-white" />
      <Button
        variant={isDarkTheme ? 'ghost' : 'default'}
        size="sm"
        onClick={() => onThemeChange(false)}
        className={`text-xs px-3 py-1 rounded-full ${
          !isDarkTheme 
            ? 'bg-white text-red-600 font-medium' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        Light
      </Button>
      <Button
        variant={isDarkTheme ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onThemeChange(true)}
        className={`text-xs px-3 py-1 rounded-full ${
          isDarkTheme 
            ? 'bg-red-600 text-white font-medium' 
            : 'text-white hover:bg-white/20'
        }`}
      >
        Dark
      </Button>
    </div>
  );
};