import { useState, useEffect } from 'react';
import { useGoogleAuth } from './useGoogleAuth';

interface SocialNetwork {
  id: string;
  name: string;
  defaultIcon: string;
  customIcon?: string;
  url?: string;
}

const defaultSocialNetworks: SocialNetwork[] = [
  {
    id: 'instagram',
    name: 'Instagram',
    defaultIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9InVybCgjcGFpbnQwX3JhZGlhbF8xXzEpIi8+CjxwYXRoIGQ9Ik0yMC44IDhIOTZjLTEuNiAwLTIuOCAxLjItMi44IDIuOHYxMS42YzAgMS42IDEuMiAyLjggMi44IDIuOGgxMS42YzEuNiAwIDIuOC0xLjIgMi44LTIuOFY5LjZjMC0xLjYtMS4yLTIuNi0yLjgtMi42ek0xNiAyMS4yYy0yLjggMC01LjItMi4yLTUuMi01LjJzMi4yLTUuMiA1LjItNS4yIDUuMiAyLjIgNS4yIDUuMi0yLjIgNS4yLTUuMiA1LjJ6TTIxLjYgMTBjLS44IDAtMS40LS42LTEuNC0xLjRzLjYtMS40IDEuNC0xLjQgMS40LjYgMS40IDEuNC0uNiAxLjQtMS40IDEuNHoiIGZpbGw9IndoaXRlIi8+CjxkZWZzPgo8cmFkaWFsR3JhZGllbnQgaWQ9InBhaW50MF9yYWRpYWxfMV8xIiBjeD0iMCIgY3k9IjAiIHI9IjEiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIiBncmFkaWVudFRyYW5zZm9ybT0idHJhbnNsYXRlKDE2IDE2KSByb3RhdGUoNDUpIHNjYWxlKDIyLjYyNzQpIj4KPHN0b3Agc3RvcC1jb2xvcj0iI0ZGNTc0MCIvPgo8c3RvcCBvZmZzZXQ9IjAuNSIgc3RvcC1jb2xvcj0iI0ZGNTc0MCIvPgo8c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNGRjU3NDAiLz4KPC9yYWRpYWxHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K'
  },
  {
    id: 'facebook',
    name: 'Facebook',
    defaultIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiMxODc3RjIiLz4KPHBhdGggZD0iTTE4LjQgMjVWMTYuOEgyMS4yTDIxLjYgMTMuNkgxOC40VjExLjZDMTguNCAxMC44IDE4LjggMTAuNCAxOS42IDEwLjRIMjEuNlY3LjZIMTguOEMxNi44IDcuNiAxNS42IDguOCAxNS42IDEwLjhWMTMuNkgxM1YxNi44SDE1LjZWMjVIMTguNFoiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo='
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    defaultIcon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9ImJsYWNrIi8+CjxwYXRoIGQ9Ik0yMC44IDEyLjhDMjEuNiAxMy42IDIyLjggMTQuNCAyNCAxNC40VjExLjJDMjMuNiAxMS4yIDIzLjIgMTEuMiAyMi44IDExVjEzLjZDMjEuNiAxMy42IDIwLjQgMTIuOCAxOS42IDEyVjE4LjhDMTkuNiAyMS42IDE3LjIgMjQgMTQuNCAyNEMxMy4yIDI0IDEyIDIzLjYgMTEuMiAyMi44QzEyIDIzLjYgMTMuMiAyNCAxNC40IDI0QzE3LjIgMjQgMTkuNiAyMS42IDE5LjYgMTguOFYxMkwyMC44IDEyLjhaIiBmaWxsPSIjRkY0NDU4Ii8+CjxwYXRoIGQ9Ik0xOS42IDEyVjE4LjhDMTkuNiAyMS42IDE3LjIgMjQgMTQuNCAyNEMxMS42IDI0IDkuMiAyMS42IDkuMiAxOC44QzkuMiAxNi44IDEwLjQgMTUuMiAxMi4wIDEzLjZDMTEuMiAxNC44IDEwLjggMTYuNCAxMC44IDE4LjhDMTAuOCAyMS42IDEzLjIgMjQgMTYgMjRDMTguOCAyNCAyMS4yIDIxLjYgMjEuMiAxOC44VjEySDIwLjhIMTkuNloiIGZpbGw9IiMwMEY0RUEiLz4KPC9zdmc+Cg=='
  }
];

export const useSocialNetworks = () => {
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>(defaultSocialNetworks);
  const { user } = useGoogleAuth();

  // Limpar dados das redes sociais e resetar para padrão quando o usuário muda
  useEffect(() => {
    setSocialNetworks(defaultSocialNetworks);
  }, [user?.id]);

  const updateSocialNetwork = (id: string, updates: Partial<SocialNetwork>) => {
    setSocialNetworks(prev => 
      prev.map(network => 
        network.id === id ? { ...network, ...updates } : network
      )
    );
  };

  const addSocialNetwork = (newNetwork: Partial<SocialNetwork>) => {
    const id = `custom_${Date.now()}`;
    const network: SocialNetwork = {
      id,
      name: newNetwork.name || 'Custom Network',
      defaultIcon: newNetwork.defaultIcon || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiM2Njk5ZmYiLz4KPHRleHQgeD0iMTYiIHk9IjIwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiPis8L3RleHQ+Cjwvc3ZnPg==',
      customIcon: newNetwork.customIcon,
      url: newNetwork.url
    };
    
    setSocialNetworks(prev => [...prev, network]);
  };

  const deleteSocialNetwork = (id: string) => {
    setSocialNetworks(prev => prev.filter(network => network.id !== id));
  };

  return {
    socialNetworks,
    updateSocialNetwork,
    addSocialNetwork,
    deleteSocialNetwork
  };
};