import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { useTrialStatus } from '@/hooks/useTrialStatus';

export const TrialTimer: React.FC = () => {
  const { isTrialActive, daysRemaining } = useTrialStatus();

  if (!isTrialActive) return null;

  return (
    <Badge variant="outline" className="flex items-center gap-2 bg-yellow-50 text-yellow-700 border-yellow-200">
      <Clock className="w-3 h-3" />
      <span className="text-xs font-medium">
        Trial: {daysRemaining} dia{daysRemaining !== 1 ? 's' : ''} restante{daysRemaining !== 1 ? 's' : ''}
      </span>
    </Badge>
  );
};