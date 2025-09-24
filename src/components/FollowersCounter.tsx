import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Users } from 'lucide-react';
import { FollowersDialog } from './FollowersDialog';
import { useFollowers } from '@/hooks/useFollowers';

interface FollowersCounterProps {
  creatorId?: string;
  showForCreator?: boolean; // Se deve mostrar apenas para o próprio criador
}

export const FollowersCounter: React.FC<FollowersCounterProps> = ({
  creatorId,
  showForCreator = false
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { followersCount, followers, isLoading, loadFollowers } = useFollowers(creatorId);

  const handleClick = async () => {
    setDialogOpen(true);
    await loadFollowers();
  };

  // Sempre mostra se tem seguidores ou se é para mostrar para o criador
  if (followersCount === 0 && !showForCreator) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleClick}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <Users className="w-4 h-4" />
        <span className="text-sm font-medium">
          {followersCount} {followersCount === 1 ? 'seguidor' : 'seguidores'}
        </span>
      </Button>

      <FollowersDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        followers={followers}
        isLoading={isLoading}
        followersCount={followersCount}
      />
    </>
  );
};