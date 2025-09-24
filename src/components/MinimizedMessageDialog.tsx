import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface MinimizedMessageConfig {
  text: string;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  fontFamily: string;
}

interface VitrineConfig {
  backgroundColor: string;
  hasGlassEffect: boolean;
}

interface MinimizedMessageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: MinimizedMessageConfig) => void;
  currentConfig?: MinimizedMessageConfig;
}

const defaultConfig: MinimizedMessageConfig = {
  text: "Vitrine minimizada - clique no botão ˄ para expandir",
  textColor: "#6b7280",
  backgroundColor: "transparent",
  fontSize: 14,
  fontFamily: "Inter"
};

export const MinimizedMessageDialog = ({
  isOpen,
  onClose,
  onSave,
  currentConfig
}: MinimizedMessageDialogProps) => {
  const [config, setConfig] = useState<MinimizedMessageConfig>(currentConfig || defaultConfig);

  useEffect(() => {
    if (currentConfig) {
      setConfig(currentConfig);
    }
  }, [currentConfig]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const fonts = [
    { value: "Inter", label: "Inter" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Playfair Display", label: "Playfair Display" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Poppins", label: "Poppins" },
    { value: "Dancing Script", label: "Dancing Script" },
    { value: "Oswald", label: "Oswald" }
  ];

  const presetColors = [
    "#6b7280", "#ef4444", "#f97316", "#eab308", 
    "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", 
    "#ec4899", "#000000", "#ffffff"
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Mensagem da Vitrine Minimizada</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Texto */}
          <div className="space-y-2">
            <Label htmlFor="text">Texto da Mensagem</Label>
            <Input
              id="text"
              value={config.text}
              onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value }))}
              placeholder="Digite sua mensagem promocional..."
            />
          </div>

          {/* Fonte */}
          <div className="space-y-2">
            <Label>Fonte</Label>
            <Select value={config.fontFamily} onValueChange={(value) => setConfig(prev => ({ ...prev, fontFamily: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fonts.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tamanho da fonte */}
          <div className="space-y-2">
            <Label>Tamanho da Fonte: {config.fontSize}px</Label>
            <Slider
              value={[config.fontSize]}
              onValueChange={(value) => setConfig(prev => ({ ...prev, fontSize: value[0] }))}
              max={24}
              min={10}
              step={1}
              className="w-full"
            />
          </div>

          {/* Cor do texto */}
          <div className="space-y-2">
            <Label>Cor do Texto</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="color"
                value={config.textColor}
                onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                className="w-12 h-8 p-1 border rounded"
              />
              <Input
                value={config.textColor}
                onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig(prev => ({ ...prev, textColor: color }))}
                  className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Cor de fundo */}
          <div className="space-y-2">
            <Label>Cor de Fundo</Label>
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

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="border rounded p-4 bg-gray-50">
              <div 
                className="text-center py-2"
                style={{
                  color: config.textColor,
                  backgroundColor: config.backgroundColor,
                  fontSize: `${config.fontSize}px`,
                  fontFamily: config.fontFamily,
                  padding: config.backgroundColor !== "transparent" ? "8px 12px" : "8px 0",
                  borderRadius: config.backgroundColor !== "transparent" ? "6px" : "0"
                }}
              >
                {config.text}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};