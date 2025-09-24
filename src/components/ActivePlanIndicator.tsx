import React from 'react';
interface ActivePlanIndicatorProps {
  planTier: string;
}
export const ActivePlanIndicator: React.FC<ActivePlanIndicatorProps> = ({
  planTier
}) => {
  return <div className="mt-2">
      <div className="text-green-500 text-sm font-medium animate-pulse flex items-center gap-1">
        
        
      </div>
    </div>;
};