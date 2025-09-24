import React from 'react';
import { Button } from '@/components/ui/button';
import { Palette, Sun, Moon, Heart } from 'lucide-react';

type ThemeType = 'light' | 'dark' | 'pink';

interface ThemeToggleProps {
  currentTheme: ThemeType;
  onThemeChange: (theme: ThemeType) => void;
}

export const ThemeToggle = ({ currentTheme, onThemeChange }: ThemeToggleProps) => {
  return (
    <div className="flex items-center gap-1 bg-glass-light backdrop-blur-md rounded-full p-2 border border-glass-border">
      <Palette className="w-4 h-4 text-primary mr-1" />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onThemeChange('light')}
        className={`text-xs px-2 py-1 rounded-full transition-all duration-300 flex items-center gap-1 ${
          currentTheme === 'light' 
            ? 'bg-primary text-primary-foreground font-medium shadow-lg hover:bg-primary/90' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Sun className="w-3 h-3" />
        Light
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onThemeChange('dark')}
        className={`text-xs px-2 py-1 rounded-full transition-all duration-300 flex items-center gap-1 ${
          currentTheme === 'dark' 
            ? 'bg-secondary text-secondary-foreground font-medium shadow-lg hover:bg-secondary/90' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Moon className="w-3 h-3" />
        Dark
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onThemeChange('pink')}
        className={`text-xs px-2 py-1 rounded-full transition-all duration-300 flex items-center gap-1 ${
          currentTheme === 'pink' 
            ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium shadow-lg hover:from-pink-600 hover:to-rose-600' 
            : 'text-foreground hover:bg-accent hover:text-accent-foreground'
        }`}
      >
        <Heart className="w-3 h-3" />
        Pink
      </Button>
    </div>
  );
};