import React, { useEffect } from 'react';
import { useQueueSystem } from '@/hooks/useQueueSystem';
import { QueueWaitingDialog } from './QueueWaitingDialog';
import { toast } from 'sonner';

interface QueueAccessControlProps {
  creatorId?: string;
  children: React.ReactNode;
}

export const QueueAccessControl: React.FC<QueueAccessControlProps> = ({
  creatorId,
  children
}) => {
  const {
    queueSettings,
    isInQueue,
    queuePosition,
    timeRemaining,
    canEnterRoom,
    joinQueue,
    leaveQueue
  } = useQueueSystem(creatorId);

  // Auto-join queue when room access is blocked
  useEffect(() => {
    if (queueSettings.enabled && !canEnterRoom && !isInQueue) {
      joinQueue();
    }
  }, [queueSettings.enabled, canEnterRoom, isInQueue, joinQueue]);

  // Notify when room becomes available
  useEffect(() => {
    if (canEnterRoom && isInQueue) {
      toast.success('🎉 A sala está disponível! Você pode entrar agora.');
      leaveQueue();
    }
  }, [canEnterRoom, isInQueue, leaveQueue]);

  // Show waiting dialog if in queue and cannot enter
  if (queueSettings.enabled && !canEnterRoom && isInQueue) {
    return (
      <QueueWaitingDialog
        open={true}
        onOpenChange={() => {}} // Cannot close manually
        position={queuePosition}
        timeRemaining={timeRemaining}
        onLeaveQueue={leaveQueue}
      />
    );
  }

  // Render children if can access room
  return <>{children}</>;
};