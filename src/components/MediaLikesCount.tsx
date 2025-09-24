import React from 'react';
import { useMediaLikes } from '@/hooks/useMediaLikes';

interface MediaLikesCountProps {
  mediaId: string;
}

export const MediaLikesCount: React.FC<MediaLikesCountProps> = ({ mediaId }) => {
  const { likesCount } = useMediaLikes(mediaId);
  
  return <span>{likesCount}</span>;
};