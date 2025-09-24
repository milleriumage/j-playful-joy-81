import React from 'react';
import { Clock } from 'lucide-react';

interface AutoLockCountdownProps {
  timeRemaining: number;
  isActive: boolean;
}

export const AutoLockCountdown: React.FC<AutoLockCountdownProps> = ({ 
  timeRemaining, 
  isActive 
}) => {
  if (!isActive || timeRemaining <= 0) return null;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const isLowTime = timeRemaining <= 60; // Last minute warning
  const isVeryLowTime = timeRemaining <= 10; // Last 10 seconds critical

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs transition-all duration-300 ${
      isVeryLowTime 
        ? 'bg-red-500/20 text-red-600 border border-red-500/30 animate-pulse' 
        : isLowTime 
          ? 'bg-orange-500/20 text-orange-600 border border-orange-500/30'
          : 'bg-blue-500/20 text-blue-600 border border-blue-500/30'
    }`}>
      <Clock className={`w-3 h-3 ${
        isVeryLowTime ? 'text-red-500' : isLowTime ? 'text-orange-500' : 'text-blue-500'
      }`} />
      <span className="font-mono font-medium">
        {formatTime(timeRemaining)}
      </span>
      <span className="text-xs opacity-70">
        até bloqueio
      </span>
    </div>
  );
};