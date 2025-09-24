import React from 'react';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';

interface ThemeToggleProps {
  isDarkTheme: boolean;
  onThemeChange: (isDark: boolean) => void;
}

export const ThemeToggle = ({ isDarkTheme, onThemeChange }: ThemeToggleProps) => {
  return (
    <div className="flex items-center gap-2 bg-glass-light backdrop-blur-md rounded-full p-2 border border-glass-border">
      <Palette className="w-4 h-4 text-primary" />
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onThemeChange(false)}
        className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
          !isDarkTheme 
            ? 'bg-primary text-primary-foreground font-medium shadow-lg hover:bg-primary/90' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        Light
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onThemeChange(true)}
        className={`text-xs px-3 py-1 rounded-full transition-all duration-300 ${
          isDarkTheme 
            ? 'bg-secondary text-secondary-foreground font-medium shadow-lg hover:bg-secondary/90' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        Dark
      </Button>
    </div>
  );
};