import React from 'react';
import { Button } from "@/components/ui/button";
import { UserPlus, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  isFollowing: boolean;
  onToggleFollow: () => void;
  isLoading?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  isFollowing,
  onToggleFollow,
  isLoading = false
}) => {
  return (
    <Button
      onClick={onToggleFollow}
      disabled={isLoading}
      variant={isFollowing ? "outline" : "default"}
      size="sm"
      className="flex items-center gap-2"
    >
      {isFollowing ? (
        <>
          <UserMinus className="w-4 h-4" />
          Deixar de seguir
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          Seguir
        </>
      )}
    </Button>
  );
};