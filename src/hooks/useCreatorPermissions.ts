import { useState, useEffect } from 'react';
import { useGoogleAuth } from './useGoogleAuth';

/**
 * Hook para verificar se o usuário atual é o criador da página
 * e gerenciar permissões de edição
 */
export const useCreatorPermissions = (creatorId?: string | null) => {
  const { user, isGuest } = useGoogleAuth();
  const [isCreator, setIsCreator] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    const checkPermissions = () => {
      if (isGuest || !user) {
        // Usuários não logados não são criadores
        setIsCreator(false);
        setCanEdit(false);
        return;
      }

      if (!creatorId) {
        // Se não há creatorId definido, o usuário logado pode editar (página própria)
        setIsCreator(true);
        setCanEdit(true);
        return;
      }

      // Verificar se o usuário atual é o mesmo que o criador da página
      const userIsCreator = user.id === creatorId;
      setIsCreator(userIsCreator);
      setCanEdit(userIsCreator);

      console.log('🔐 Creator permissions check:', {
        userId: user.id,
        creatorId,
        isCreator: userIsCreator,
        canEdit: userIsCreator
      });
    };

    checkPermissions();
  }, [user, creatorId, isGuest]);

  return {
    isCreator,
    canEdit,
    currentUserId: user?.id || null
  };
};