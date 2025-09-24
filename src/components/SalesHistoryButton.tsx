import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { SalesHistoryModal } from "./SalesHistoryModal";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

export const SalesHistoryButton: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useGoogleAuth();

  // Only show for authenticated users
  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsModalOpen(true)}
        className="fixed top-4 right-4 z-50 h-10 w-10 p-0 bg-background/80 backdrop-blur-sm border border-border hover:bg-accent hover:text-accent-foreground shadow-md"
        title="Central de Vendas"
      >
        <ShoppingCart className="h-4 w-4" />
      </Button>

      <SalesHistoryModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </>
  );
};