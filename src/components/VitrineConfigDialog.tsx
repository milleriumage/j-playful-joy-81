import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface VitrineConfig {
  backgroundColor: string;
  hasGlassEffect: boolean;
  slideshowMode: boolean;
  slideshowInterval: number;
}

interface VitrineConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: VitrineConfig) => void;
  currentConfig?: VitrineConfig;
}

const defaultConfig: VitrineConfig = {
  backgroundColor: "transparent",
  hasGlassEffect: false,
  slideshowMode: false,
  slideshowInterval: 3
};

export const VitrineConfigDialog = ({
  isOpen,
  onClose,
  onSave,
  currentConfig
}: VitrineConfigDialogProps) => {
  const [config, setConfig] = useState<VitrineConfig>(currentConfig || defaultConfig);

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const presetColors = [
    "#ffffff", "#f8fafc", "#f1f5f9", "#e2e8f0", 
    "#cbd5e1", "#94a3b8", "#64748b", "#475569", 
    "#334155", "#1e293b", "#0f172a", "#000000"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurar Vitrine e Slideshow</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Cor de fundo */}
          <div className="space-y-2">
            <Label>Cor de Fundo da Vitrine</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={config.backgroundColor === "transparent" ? "#ffffff" : config.backgroundColor}
                onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={config.backgroundColor}
                onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                placeholder="transparent"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setConfig(prev => ({ ...prev, backgroundColor: "transparent" }))}
              >
                Transparente
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig(prev => ({ ...prev, backgroundColor: color }))}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Efeito de vidro */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Switch
                id="glass-effect"
                checked={config.hasGlassEffect}
                onCheckedChange={(checked) => setConfig(prev => ({ ...prev, hasGlassEffect: checked }))}
              />
              <Label htmlFor="glass-effect">Efeito de Vidro (Glass Effect)</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              O efeito de vidro adiciona um blur de fundo e bordas translúcidas
            </p>
          </div>

          {/* Modo Slideshow - Seção destacada */}
          <div className="border-t pt-4 space-y-4">
            <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Switch
                  id="slideshow-mode"
                  checked={config.slideshowMode}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, slideshowMode: checked }))}
                />
                <Label htmlFor="slideshow-mode" className="font-medium text-primary text-lg">
                  🎬 Modo Slideshow
                </Label>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Ativa o modo slideshow mostrando as mídias da vitrine em tela cheia automaticamente
              </p>

              {/* Intervalo do Slideshow - apenas quando ativo */}
              {config.slideshowMode && (
                <div className="space-y-2 bg-background/50 p-3 rounded border">
                  <Label htmlFor="slideshow-interval" className="font-medium flex items-center gap-2">
                    ⏱️ Intervalo entre mídias
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slideshow-interval"
                      type="number"
                      min="1"
                      max="30"
                      value={config.slideshowInterval}
                      onChange={(e) => setConfig(prev => ({ ...prev, slideshowInterval: parseInt(e.target.value) || 3 }))}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">segundos</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tempo para cada mídia aparecer na tela principal (1-30 segundos)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview da Vitrine</Label>
            <div className="border rounded p-4 bg-gray-50 relative overflow-hidden">
              <div 
                className={`p-4 rounded border-2 border-dashed border-gray-300 min-h-[80px] flex items-center justify-center ${
                  config.hasGlassEffect ? 'backdrop-blur-md border-white/20' : ''
                }`}
                style={{
                  backgroundColor: config.backgroundColor === "transparent" ? "transparent" : config.backgroundColor,
                }}
              >
                <div className="text-center">
                  <span className="text-sm text-gray-600">Conteúdo da vitrine</span>
                  {config.slideshowMode && (
                    <div className="mt-2 text-xs text-primary font-medium">
                      🎬 Slideshow ativo ({config.slideshowInterval}s)
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
            Salvar Configurações
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};