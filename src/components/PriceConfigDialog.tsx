import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";

interface PriceConfig {
  text: string;
  fontFamily: string;
  fontSize: number;
  textColor: string;
  backgroundColor: string;
  isTransparent: boolean;
  hasBlinkAnimation: boolean;
  movementType: 'none' | 'horizontal' | 'vertical';
  // Novas configurações para compra por créditos
  enableCreditPurchase: boolean;
  creditPrice: number;
  creditButtonColor: string;
  creditButtonBlink: boolean;
  // Configurações de posição e tamanho
  creditButtonPosition: 'top' | 'middle' | 'bottom';
  creditButtonWidth: number;
  creditButtonHeight: number;
  // Controle de visibilidade pós-compra
  showAfterPurchase: boolean;
}

interface PriceConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PriceConfig) => void;
  currentConfig?: PriceConfig;
}

const defaultConfig: PriceConfig = {
  text: '',
  fontFamily: 'Inter',
  fontSize: 16,
  textColor: '#ffffff',
  backgroundColor: '#000000',
  isTransparent: false,
  hasBlinkAnimation: false,
  movementType: 'none',
  // Valores padrão para compra por créditos
  enableCreditPurchase: false,
  creditPrice: 10,
  creditButtonColor: '#3b82f6',
  creditButtonBlink: false,
  // Valores padrão para posição e tamanho
  creditButtonPosition: 'bottom',
  creditButtonWidth: 200,
  creditButtonHeight: 40,
  // Valor padrão para visibilidade pós-compra
  showAfterPurchase: true
};

export const PriceConfigDialog = ({
  isOpen,
  onClose,
  onSave,
  currentConfig
}: PriceConfigDialogProps) => {
  const [config, setConfig] = useState<PriceConfig>(currentConfig || defaultConfig);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const updateConfig = (key: keyof PriceConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>💰 Configurar Preço</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Texto do Preço */}
          <div>
            <Label htmlFor="price-text">Texto do Preço</Label>
            <Input
              id="price-text"
              placeholder="Ex: R$ 29,90"
              value={config.text}
              onChange={(e) => updateConfig('text', e.target.value)}
              className="mt-1"
            />
          </div>

          {/* Fonte */}
          <div>
            <Label>Fonte do Texto</Label>
            <Select value={config.fontFamily} onValueChange={(value) => updateConfig('fontFamily', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Inter">Inter</SelectItem>
                <SelectItem value="Arial">Arial</SelectItem>
                <SelectItem value="Helvetica">Helvetica</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Verdana">Verdana</SelectItem>
                <SelectItem value="Courier New">Courier New</SelectItem>
                <SelectItem value="Impact">Impact</SelectItem>
                <SelectItem value="Comic Sans MS">Comic Sans MS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tamanho da Fonte */}
          <div>
            <Label>Tamanho da Fonte: {config.fontSize}px</Label>
            <Slider
              value={[config.fontSize]}
              onValueChange={([value]) => updateConfig('fontSize', value)}
              max={48}
              min={10}
              step={1}
              className="mt-2"
            />
          </div>

          {/* Cor do Texto */}
          <div>
            <Label htmlFor="text-color">Cor do Texto</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="text-color"
                type="color"
                value={config.textColor}
                onChange={(e) => updateConfig('textColor', e.target.value)}
                className="w-16 h-10 p-1 border"
              />
              <Input
                value={config.textColor}
                onChange={(e) => updateConfig('textColor', e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          {/* Fundo Transparente */}
          <div className="flex items-center justify-between">
            <Label htmlFor="transparent-bg">Fundo Transparente</Label>
            <Switch
              id="transparent-bg"
              checked={config.isTransparent}
              onCheckedChange={(checked) => updateConfig('isTransparent', checked)}
            />
          </div>

          {/* Cor de Fundo (apenas se não for transparente) */}
          {!config.isTransparent && (
            <div>
              <Label htmlFor="bg-color">Cor de Fundo</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="bg-color"
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                  className="w-16 h-10 p-1 border"
                />
                <Input
                  value={config.backgroundColor}
                  onChange={(e) => updateConfig('backgroundColor', e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          )}

          {/* Animação de Piscar */}
          <div className="flex items-center justify-between">
            <Label htmlFor="blink-animation">Animação de Piscar</Label>
            <Switch
              id="blink-animation"
              checked={config.hasBlinkAnimation}
              onCheckedChange={(checked) => updateConfig('hasBlinkAnimation', checked)}
            />
          </div>

          {/* Tipo de Movimento */}
          <div>
            <Label>Movimento do Texto</Label>
            <Select value={config.movementType} onValueChange={(value) => updateConfig('movementType', value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem movimento</SelectItem>
                <SelectItem value="horizontal">Horizontal (direita → esquerda)</SelectItem>
                <SelectItem value="vertical">Vertical (subindo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seção de Compra por Créditos */}
          <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
            <div className="flex items-center justify-between">
              <Label htmlFor="enable-credit-purchase" className="font-medium">💳 Ativar Compra por Créditos</Label>
              <Switch
                id="enable-credit-purchase"
                checked={config.enableCreditPurchase}
                onCheckedChange={(checked) => updateConfig('enableCreditPurchase', checked)}
              />
            </div>

            {config.enableCreditPurchase && (
              <>
                {/* Preço em Créditos */}
                <div>
                  <Label htmlFor="credit-price">Preço em Créditos</Label>
                  <Input
                    id="credit-price"
                    type="number"
                    min="1"
                    max="1000"
                    value={config.creditPrice}
                    onChange={(e) => updateConfig('creditPrice', parseInt(e.target.value) || 1)}
                    className="mt-1"
                    placeholder="Ex: 10"
                  />
                </div>

                {/* Cor do Botão */}
                <div>
                  <Label htmlFor="credit-button-color">Cor do Botão</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="credit-button-color"
                      type="color"
                      value={config.creditButtonColor}
                      onChange={(e) => updateConfig('creditButtonColor', e.target.value)}
                      className="w-16 h-10 p-1 border"
                    />
                    <Input
                      value={config.creditButtonColor}
                      onChange={(e) => updateConfig('creditButtonColor', e.target.value)}
                      placeholder="#3b82f6"
                      className="flex-1"
                    />
                  </div>
                </div>

                 {/* Botão Piscando */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="credit-button-blink">Botão Piscando</Label>
                  <Switch
                    id="credit-button-blink"
                    checked={config.creditButtonBlink}
                    onCheckedChange={(checked) => updateConfig('creditButtonBlink', checked)}
                  />
                </div>

                {/* Posição do Botão */}
                <div>
                  <Label>Posição na Tela</Label>
                  <Select value={config.creditButtonPosition} onValueChange={(value) => updateConfig('creditButtonPosition', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Parte Superior</SelectItem>
                      <SelectItem value="middle">Meio da Tela</SelectItem>
                      <SelectItem value="bottom">Parte Inferior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Largura do Botão */}
                <div>
                  <Label>Largura do Botão: {config.creditButtonWidth}px</Label>
                  <Slider
                    value={[config.creditButtonWidth]}
                    onValueChange={([value]) => updateConfig('creditButtonWidth', value)}
                    max={400}
                    min={120}
                    step={10}
                    className="mt-2"
                  />
                </div>

                {/* Altura do Botão */}
                <div>
                  <Label>Altura do Botão: {config.creditButtonHeight}px</Label>
                  <Slider
                    value={[config.creditButtonHeight]}
                    onValueChange={([value]) => updateConfig('creditButtonHeight', value)}
                    max={80}
                    min={30}
                    step={5}
                    className="mt-2"
                  />
                </div>

                {/* Visibilidade Pós-Compra */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="show-after-purchase">Manter Visível Após Compra</Label>
                    <p className="text-xs text-muted-foreground">
                      Quando desabilitado, o botão desaparece após a compra
                    </p>
                  </div>
                  <Switch
                    id="show-after-purchase"
                    checked={config.showAfterPurchase}
                    onCheckedChange={(checked) => updateConfig('showAfterPurchase', checked)}
                  />
                </div>

                {/* Preview do Botão */}
                <div className="p-3 border rounded-lg bg-background">
                  <Label className="text-sm text-muted-foreground">Preview do Botão:</Label>
                  <div className="mt-2 flex justify-center">
                    <button
                      className={`
                        rounded-lg font-medium text-white text-sm
                        ${config.creditButtonBlink ? 'animate-pulse' : ''}
                        transition-all duration-200 hover:scale-105
                      `}
                      style={{ 
                        backgroundColor: config.creditButtonColor,
                        width: `${config.creditButtonWidth}px`,
                        height: `${config.creditButtonHeight}px`
                      }}
                      disabled
                    >
                      Comprar por {config.creditPrice} Créditos
                    </button>
                  </div>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Posição: {config.creditButtonPosition === 'top' ? 'Superior' : config.creditButtonPosition === 'middle' ? 'Meio' : 'Inferior'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Preview */}
          {config.text && (
            <div className="p-4 border rounded-lg bg-muted">
              <Label className="text-sm text-muted-foreground">Preview:</Label>
              <div className="mt-2 relative h-12 overflow-hidden">
                <div
                  className={`
                    inline-block px-2 py-1 rounded
                    ${config.hasBlinkAnimation ? 'animate-pulse' : ''}
                    ${config.movementType === 'horizontal' ? 'animate-[slide-right-to-left_3s_linear_infinite]' : ''}
                    ${config.movementType === 'vertical' ? 'animate-[slide-bottom-to-top_3s_linear_infinite]' : ''}
                  `}
                  style={{
                    fontFamily: config.fontFamily,
                    fontSize: `${config.fontSize}px`,
                    color: config.textColor,
                    backgroundColor: config.isTransparent ? 'transparent' : config.backgroundColor,
                  }}
                >
                  {config.text}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!config.text.trim() && !config.enableCreditPurchase}
            className="bg-primary hover:bg-primary/90"
          >
            Salvar Preço
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};