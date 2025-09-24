import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { SocialMediaDialog } from "./SocialMediaDialog";
import { useVisibilitySettings } from "@/hooks/useVisibilitySettings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface SocialNetwork {
  id: string;
  name: string;
  defaultIcon: string;
  customIcon?: string;
  url?: string;
}
interface SocialMediaIconsProps {
  socialNetworks: SocialNetwork[];
  onUpdateSocial: (id: string, updates: Partial<SocialNetwork>) => void;
  onAddSocial: (network: Partial<SocialNetwork>) => void;
  onDeleteSocial: (id: string) => void;
  passwordProtected: boolean;
  onPasswordVerify: (action: string, callback: () => void) => void;
  creatorId?: string;
}
export const SocialMediaIcons = ({
  socialNetworks,
  onUpdateSocial,
  onAddSocial,
  onDeleteSocial,
  passwordProtected,
  onPasswordVerify,
  creatorId
}: SocialMediaIconsProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const {
    settings
  } = useVisibilitySettings(creatorId);
  const handleIconClick = (network: SocialNetwork) => {
    if (network.url) {
      window.open(network.url, '_blank');
    }
  };
  const handleEditClick = (network: SocialNetwork, e: React.MouseEvent) => {
    e.stopPropagation();
    if (passwordProtected) {
      onPasswordVerify(`edit-social-${network.id}`, () => {
        setEditingId(network.id);
      });
    } else {
      setEditingId(network.id);
    }
  };
  const handleAddClick = () => {
    if (passwordProtected) {
      onPasswordVerify("add-social", () => {
        setIsAddingNew(true);
      });
    } else {
      setIsAddingNew(true);
    }
  };
  const handleDeleteClick = (network: SocialNetwork, e: React.MouseEvent) => {
    e.stopPropagation();
    if (passwordProtected) {
      onPasswordVerify(`delete-social-${network.id}`, () => {
        onDeleteSocial(network.id);
      });
    } else {
      onDeleteSocial(network.id);
    }
  };
  return <div className="flex justify-center items-center gap-4 mb-4">
      {/* Left FindCreator Button */}
      
      
      <div className="flex justify-center items-center gap-4">
        {socialNetworks.map(network => <div key={network.id} className="relative group">
          <div className={`w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 ${network.url ? 'hover:shadow-lg' : 'opacity-50'}`} onClick={() => handleIconClick(network)}>
            <img src={network.customIcon || network.defaultIcon} alt={network.name} className="w-full h-full rounded-full object-cover border-2 border-white shadow-sm" loading="lazy" onError={e => {
            e.currentTarget.src = network.defaultIcon;
          }} />
          </div>
          
          {settings.showSocialEditIcons && <Button size="sm" variant="outline" className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => handleEditClick(network, e)}>
              <Edit className="w-2 h-2" />
            </Button>}
        </div>)}

      {/* Add New Icon Button */}
      {settings.showSocialEditIcons && <div className="relative group">
          <div className="w-8 h-8 rounded-full cursor-pointer transition-transform hover:scale-110 border-2 border-dashed border-gray-400 hover:border-blue-500 flex items-center justify-center bg-gray-100 hover:bg-blue-50" onClick={handleAddClick} title="Add new social media icon">
            <Plus className="w-4 h-4 text-gray-600 hover:text-blue-500" />
          </div>
        </div>}
      </div>

      {/* Right FindCreator Button */}
      

      <SocialMediaDialog isOpen={editingId !== null} onClose={() => setEditingId(null)} network={socialNetworks.find(n => n.id === editingId) || null} onSave={updates => {
      if (editingId) {
        onUpdateSocial(editingId, updates);
        setEditingId(null);
      }
    }} onDelete={id => {
      onDeleteSocial(id);
      setEditingId(null);
    }} />

      {/* Dialog for adding new social network */}
      <SocialMediaDialog isOpen={isAddingNew} onClose={() => setIsAddingNew(false)} network={null} onSave={newNetwork => {
      onAddSocial(newNetwork);
      setIsAddingNew(false);
    }} />
    </div>;
};