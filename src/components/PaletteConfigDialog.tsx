import React, { useState, useEffect } from 'react';
import { Palette, Heart, Briefcase, ShoppingBag, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/useLanguage";
interface PaletteConfigDialogProps {
  // Estados das paletas básicas
  homeMode: boolean;
  professionalMode: boolean;
  ecommerceMode: boolean;
  fireMode: boolean;

  // Estados dos toggles de cores
  colorToggles: Record<string, boolean>;

  // Estados dos gradientes
  gradientStates: Record<string, {
    active: boolean;
    intensity: number;
  }>;
  lightGradientStates: Record<string, {
    active: boolean;
    intensity: number;
  }>;

  // Handlers
  onHomeModeToggle: () => void;
  onProfessionalModeToggle: () => void;
  onEcommerceModeToggle: () => void;
  onFireModeToggle: () => void;
  onColorToggle: (colorKey: string) => void;
  onGradientToggle: (gradientKey: string) => void;
  onLightGradientToggle: (gradientKey: string) => void;
  onGradientIntensityChange: (gradientKey: string, intensity: number) => void;
  onLightGradientIntensityChange: (gradientKey: string, intensity: number) => void;
  disabled?: boolean;
}
export const PaletteConfigDialog = ({
  homeMode,
  professionalMode,
  ecommerceMode,
  fireMode,
  colorToggles,
  gradientStates,
  lightGradientStates,
  onHomeModeToggle,
  onProfessionalModeToggle,
  onEcommerceModeToggle,
  onFireModeToggle,
  onColorToggle,
  onGradientToggle,
  onLightGradientToggle,
  onGradientIntensityChange,
  onLightGradientIntensityChange,
  disabled = false
}: PaletteConfigDialogProps) => {
  const [open, setOpen] = useState(false);
  const {
    t
  } = useLanguage();

  // PaletteSelector functionality
  const [currentPalette, setCurrentPalette] = useState(() => {
    return localStorage.getItem('auralink-color-palette') || 'professional';
  });
  const palettes = [{
    id: 'default',
    name: 'Padrão',
    className: '',
    preview: ['#ff4d6d', '#fce7f3', '#f9fafb']
  }, {
    id: 'soft',
    name: 'Cores Suaves',
    className: 'soft-palette',
    preview: ['#e892b8', '#ebebef', '#fcfcfd']
  }, {
    id: 'professional',
    name: 'Profissional',
    className: 'professional-palette',
    preview: ['#0066cc', '#f4f5f6', '#fefefe']
  }, {
    id: 'professional-prime',
    name: 'Profissional Prime',
    className: 'professional-palette-prime',
    preview: ['#1e40af', '#f3f4f6', '#ffffff']
  }, {
    id: 'home',
    name: 'Gradiente Moderno',
    className: 'home-palette',
    preview: ['#9333ea', '#1e40af', '#6b21a8']
  }];
  const applyPalette = (paletteId: string) => {
    const palette = palettes.find(p => p.id === paletteId);
    if (!palette) return;

    // Remove all palette classes
    palettes.forEach(p => {
      if (p.className) {
        document.documentElement.classList.remove(p.className);
      }
    });

    // Apply new palette class
    if (palette.className) {
      document.documentElement.classList.add(palette.className);
    }

    // Save to localStorage for persistence
    localStorage.setItem('auralink-color-palette', paletteId);
    setCurrentPalette(paletteId);
  };

  // Apply saved palette on component mount
  useEffect(() => {
    applyPalette(currentPalette);
  }, [currentPalette]);
  const colorToggleNames = {
    neonPink: 'Rosa Neon',
    electricBlue: 'Azul Elétrico',
    vibrantGreen: 'Verde Vibrante',
    goldenYellow: 'Amarelo Dourado',
    deepPurple: 'Roxo Profundo',
    crimsonRed: 'Vermelho Carmesim',
    oceanTeal: 'Azul Oceano',
    sunsetOrange: 'Laranja Pôr do Sol',
    lavenderDream: 'Lavanda Sonho',
    emeraldMist: 'Névoa Esmeralda',
    rosePetal: 'Pétala de Rosa',
    midnightBlue: 'Azul Meia-Noite',
    forestGreen: 'Verde Floresta',
    coralReef: 'Coral Recife',
    amethystGlow: 'Brilho Ametista',
    copperBronze: 'Bronze Cobre',
    skyBlue: 'Azul Céu',
    mintGreen: 'Verde Menta',
    rubyStar: 'Estrela Rubi',
    silverMoon: 'Lua Prateada'
  };
  const gradientNames = {
    sunset: 'Gradiente Pôr do Sol',
    ocean: 'Gradiente Oceano',
    forest: 'Gradiente Floresta',
    cosmic: 'Gradiente Cósmico',
    aurora: 'Gradiente Aurora',
    volcano: 'Gradiente Vulcão',
    crystal: 'Gradiente Cristal',
    galaxy: 'Gradiente Galáxia',
    neon: 'Gradiente Neon',
    royal: 'Gradiente Real',
    tropical: 'Gradiente Tropical',
    arctic: 'Gradiente Ártico',
    desert: 'Gradiente Deserto',
    storm: 'Gradiente Tempestade',
    rainbow: 'Gradiente Arco-íris'
  };
  const lightGradientNames = {
    whiteBlue: 'Branco > Azul Suave',
    whitePink: 'Branco > Rosa Suave',
    whiteGreen: 'Branco > Verde Suave',
    whiteYellow: 'Branco > Amarelo Suave',
    whitePurple: 'Branco > Roxo Suave',
    whiteCoral: 'Branco > Coral Suave',
    whiteTeal: 'Branco > Verde-Água Suave',
    whiteLavender: 'Branco > Lavanda Suave',
    whiteMint: 'Branco > Menta Suave',
    whiteRose: 'Branco > Rosa Pétala',
    whitePeach: 'Branco > Pêssego Suave',
    whiteSky: 'Branco > Azul Céu',
    whiteAmber: 'Branco > Âmbar Suave',
    whiteEmerald: 'Branco > Esmeralda Suave',
    whiteLilac: 'Branco > Lilás Suave',
    whiteAqua: 'Branco > Água Cristalina',
    whiteCream: 'Branco > Creme Suave',
    whiteBlush: 'Branco > Blush Suave',
    whiteFrost: 'Branco > Gelo Suave',
    whitePearl: 'Branco > Pérola Suave'
  };
  const getColorClass = (key: string) => {
    const colorMap: Record<string, string> = {
      neonPink: 'bg-pink-500',
      electricBlue: 'bg-blue-500',
      vibrantGreen: 'bg-green-500',
      goldenYellow: 'bg-yellow-500',
      deepPurple: 'bg-purple-700',
      crimsonRed: 'bg-red-600',
      oceanTeal: 'bg-teal-500',
      sunsetOrange: 'bg-orange-500',
      lavenderDream: 'bg-purple-300',
      emeraldMist: 'bg-emerald-400',
      rosePetal: 'bg-rose-400',
      midnightBlue: 'bg-blue-900',
      forestGreen: 'bg-green-700',
      coralReef: 'bg-coral-500',
      amethystGlow: 'bg-violet-500',
      copperBronze: 'bg-amber-600',
      skyBlue: 'bg-sky-400',
      mintGreen: 'bg-mint-400',
      rubyStar: 'bg-red-500',
      silverMoon: 'bg-slate-400'
    };
    return colorMap[key] || 'bg-slate-400';
  };
  const getGradientClass = (key: string) => {
    const gradientMap: Record<string, string> = {
      sunset: 'from-orange-500 to-pink-500',
      ocean: 'from-blue-500 to-cyan-500',
      forest: 'from-green-600 to-emerald-400',
      cosmic: 'from-purple-600 to-blue-600',
      aurora: 'from-green-400 to-blue-500',
      volcano: 'from-red-600 to-orange-500',
      crystal: 'from-cyan-400 to-blue-300',
      galaxy: 'from-purple-800 to-pink-600',
      neon: 'from-pink-500 to-yellow-400',
      royal: 'from-purple-700 to-gold',
      tropical: 'from-green-400 to-yellow-400',
      arctic: 'from-blue-200 to-white',
      desert: 'from-yellow-600 to-orange-400',
      storm: 'from-gray-700 to-blue-800',
      rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500'
    };
    return gradientMap[key] || 'from-gray-500 to-gray-700';
  };
  const getLightGradientClass = (key: string) => {
    const lightGradientMap: Record<string, string> = {
      whiteBlue: 'from-white to-blue-200',
      whitePink: 'from-white to-pink-200',
      whiteGreen: 'from-white to-green-200',
      whiteYellow: 'from-white to-yellow-200',
      whitePurple: 'from-white to-purple-200',
      whiteCoral: 'from-white to-coral-200',
      whiteTeal: 'from-white to-teal-200',
      whiteLavender: 'from-white to-purple-100',
      whiteMint: 'from-white to-emerald-100',
      whiteRose: 'from-white to-rose-200',
      whitePeach: 'from-white to-orange-100',
      whiteSky: 'from-white to-sky-200',
      whiteAmber: 'from-white to-amber-200',
      whiteEmerald: 'from-white to-emerald-200',
      whiteLilac: 'from-white to-violet-200',
      whiteAqua: 'from-white to-cyan-200',
      whiteCream: 'from-white to-yellow-100',
      whiteBlush: 'from-white to-pink-100',
      whiteFrost: 'from-white to-blue-100',
      whitePearl: 'from-white to-slate-200'
    };
    return lightGradientMap[key] || 'from-white to-slate-200';
  };
  return <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none" disabled={disabled}>
          <Palette className="w-4 h-4 mr-2" />
          <span>{t('palette.configPalettes')}</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            {t('palette.title')}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6">
            
            {/* Paleta de Cores */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Paleta de Cores</h3>
              <div className="grid grid-cols-1 gap-2">
                {palettes.map(palette => <Button key={palette.id} variant={currentPalette === palette.id ? "default" : "outline"} size="sm" onClick={() => applyPalette(palette.id)} className="justify-start gap-3 h-12">
                    <div className="flex gap-1">
                      {palette.preview.map((color, index) => <div key={index} className="w-4 h-4 rounded-full border border-border" style={{
                    backgroundColor: color
                  }} />)}
                    </div>
                    <span>{palette.name}</span>
                    {currentPalette === palette.id && <span className="ml-auto text-xs">✓</span>}
                  </Button>)}
              </div>
            </div>

            <Separator />
            
            {/* Paletas Básicas */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">{t('palette.basicPalettes')}</h3>
              
              <div className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{homeMode ? t('palette.homeActive') : t('palette.home')}</span>
                </div>
                <Switch checked={homeMode} onCheckedChange={onHomeModeToggle} />
              </div>
              
              <div className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{professionalMode ? t('palette.professionalActive') : t('palette.professional')}</span>
                </div>
                <Switch checked={professionalMode} onCheckedChange={onProfessionalModeToggle} />
              </div>
              
              <div className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{ecommerceMode ? t('palette.ecommerceActive') : t('palette.ecommerce')}</span>
                </div>
                <Switch checked={ecommerceMode} onCheckedChange={onEcommerceModeToggle} />
              </div>
              
              <div className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{fireMode ? t('palette.fireActive') : t('palette.fire')}</span>
                </div>
                <Switch checked={fireMode} onCheckedChange={onFireModeToggle} />
              </div>
            </div>

            <Separator />

            {/* Cores Simples */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">{t('palette.simpleColors')}</h3>
              <div className="grid grid-cols-1 gap-2">
                {Object.entries(colorToggleNames).map(([key, name]) => {
                const isActive = colorToggles[key as keyof typeof colorToggles];
                return <div key={key} className="flex items-center justify-between gap-2 p-3 border rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded-full ${getColorClass(key)}`} />
                        <span className="text-sm">{isActive ? `${name} Ativo` : name}</span>
                      </div>
                      <Switch checked={isActive} onCheckedChange={() => onColorToggle(key)} />
                    </div>;
              })}
              </div>
            </div>

            

            {/* Gradientes com Intensidades Separadas */}
            

            

            {/* Gradientes Suaves com Intensidades Separadas */}
            

          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>;
};