import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Monitor, Smartphone, Tablet, Laptop, Eye } from "lucide-react";
import { toast } from "sonner";

interface ViewportSize {
  name: string;
  icon: React.ReactNode;
  width: string;
  height: string;
  description: string;
}

const viewportSizes: ViewportSize[] = [
  {
    name: 'Desktop',
    icon: <Monitor className="w-4 h-4" />,
    width: '100%',
    height: '100vh',
    description: 'Tela cheia do computador'
  },
  {
    name: 'Laptop',
    icon: <Laptop className="w-4 h-4" />,
    width: '1366px',
    height: '768px',
    description: 'Laptop padrão (1366x768)'
  },
  {
    name: 'Tablet',
    icon: <Tablet className="w-4 h-4" />,
    width: '768px',
    height: '1024px',
    description: 'Tablet (768x1024)'
  },
  {
    name: 'Mobile',
    icon: <Smartphone className="w-4 h-4" />,
    width: '375px',
    height: '667px',
    description: 'Mobile (375x667)'
  },
  {
    name: 'Mobile XL',
    icon: <Smartphone className="w-4 h-4" />,
    width: '414px',
    height: '896px',
    description: 'Mobile grande (414x896)'
  }
];

interface ViewportToggleProps {
  onViewportChange: (viewport: ViewportSize) => void;
  currentViewport: ViewportSize;
}

export const ViewportToggle: React.FC<ViewportToggleProps> = ({
  onViewportChange,
  currentViewport
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleViewportSelect = (viewport: ViewportSize) => {
    onViewportChange(viewport);
    setIsOpen(false);
    toast.success(`📱 Visualização alterada para ${viewport.name}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-primary/10 transition-colors"
        >
          <Monitor className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          <div className="px-2 py-1.5">
            <h4 className="text-sm font-semibold">Visualizar como:</h4>
            <p className="text-xs text-muted-foreground">
              Escolha o tamanho da tela
            </p>
          </div>
          <div className="space-y-1">
            {viewportSizes.map((viewport) => (
              <Button
                key={viewport.name}
                variant={currentViewport.name === viewport.name ? "secondary" : "ghost"}
                className="w-full justify-start px-2 py-1.5 h-auto"
                onClick={() => handleViewportSelect(viewport)}
              >
                <div className="flex items-center gap-3 w-full">
                  {viewport.icon}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">{viewport.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {viewport.description}
                    </div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};