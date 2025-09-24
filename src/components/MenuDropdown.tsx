import React, { useState, useEffect } from 'react';
import { Menu, Timer, RotateCcw, Lock, Heart, Crown, KeyRound, Briefcase, ShoppingBag, Flame, Calendar, CreditCard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SettingsDialog } from "@/components/SettingsDialog";
import { WishlistDialog } from "@/components/WishlistDialog";
import { PasswordDialog } from "@/components/PasswordDialog";
import { AutoLockConfigDialog } from "@/components/AutoLockConfigDialog";
import { PaletteConfigDialog } from "@/components/PaletteConfigDialog";
import { PaymentPortalSelector } from "@/components/PaymentPortalSelector";
import { usePasswordProtection } from "@/hooks/usePasswordProtection";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface MenuDropdownProps {
  onImageUpload: (file: File) => void;
  onVideoUpload: (file: File) => void;
  onSaveState: () => void;
  onLoadState: () => void;
  onTimerClick: () => void;
  disabled?: boolean;
}
export const MenuDropdown = ({
  onImageUpload,
  onVideoUpload,
  onSaveState,
  onLoadState,
  onTimerClick,
  disabled = false
}: MenuDropdownProps) => {
  const [showCreatorMode, setShowCreatorMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showAutoLockConfig, setShowAutoLockConfig] = useState(false);
  const [showWishlistDialog, setShowWishlistDialog] = useState(false);
  const [professionalMode, setProfessionalMode] = useState(false);
  const [homeMode, setHomeMode] = useState(false);
  const [ecommerceMode, setEcommerceMode] = useState(false);
  const [fireMode, setFireMode] = useState(false);

  // Estados para os 40 toggles de cores (20 cores vibrantes + 20 cores suaves)
  const [colorToggles, setColorToggles] = useState({
    neonPink: false,
    electricBlue: false,
    vibrantGreen: false,
    goldenYellow: false,
    deepPurple: false,
    crimsonRed: false,
    oceanTeal: false,
    sunsetOrange: false,
    lavenderDream: false,
    emeraldMist: false,
    rosePetal: false,
    midnightBlue: false,
    forestGreen: false,
    coralReef: false,
    amethystGlow: false,
    copperBronze: false,
    skyBlue: false,
    mintGreen: false,
    rubyStar: false,
    silverMoon: false,
    // Cores suaves
    softBlue: false,
    softPink: false,
    softGreen: false,
    softYellow: false,
    softPurple: false,
    softCoral: false,
    softTeal: false,
    softLavender: false,
    softMint: false,
    softRose: false,
    softPeach: false,
    softSky: false,
    softAmber: false,
    softEmerald: false,
    softLilac: false,
    softAqua: false,
    softCream: false,
    softBlush: false,
    softFrost: false,
    softPearl: false
  });

  // Estados para os 15 novos gradientes
  const [gradientStates, setGradientStates] = useState({
    sunset: {
      active: false,
      intensity: 1
    },
    ocean: {
      active: false,
      intensity: 1
    },
    forest: {
      active: false,
      intensity: 1
    },
    cosmic: {
      active: false,
      intensity: 1
    },
    aurora: {
      active: false,
      intensity: 1
    },
    volcano: {
      active: false,
      intensity: 1
    },
    crystal: {
      active: false,
      intensity: 1
    },
    galaxy: {
      active: false,
      intensity: 1
    },
    neon: {
      active: false,
      intensity: 1
    },
    royal: {
      active: false,
      intensity: 1
    },
    tropical: {
      active: false,
      intensity: 1
    },
    arctic: {
      active: false,
      intensity: 1
    },
    desert: {
      active: false,
      intensity: 1
    },
    storm: {
      active: false,
      intensity: 1
    },
    rainbow: {
      active: false,
      intensity: 1
    }
  });

  // Estados para os 20 novos gradientes suaves
  const [lightGradientStates, setLightGradientStates] = useState({
    whiteBlue: {
      active: false,
      intensity: 1
    },
    whitePink: {
      active: false,
      intensity: 1
    },
    whiteGreen: {
      active: false,
      intensity: 1
    },
    whiteYellow: {
      active: false,
      intensity: 1
    },
    whitePurple: {
      active: false,
      intensity: 1
    },
    whiteCoral: {
      active: false,
      intensity: 1
    },
    whiteTeal: {
      active: false,
      intensity: 1
    },
    whiteLavender: {
      active: false,
      intensity: 1
    },
    whiteMint: {
      active: false,
      intensity: 1
    },
    whiteRose: {
      active: false,
      intensity: 1
    },
    whitePeach: {
      active: false,
      intensity: 1
    },
    whiteSky: {
      active: false,
      intensity: 1
    },
    whiteAmber: {
      active: false,
      intensity: 1
    },
    whiteEmerald: {
      active: false,
      intensity: 1
    },
    whiteLilac: {
      active: false,
      intensity: 1
    },
    whiteAqua: {
      active: false,
      intensity: 1
    },
    whiteCream: {
      active: false,
      intensity: 1
    },
    whiteBlush: {
      active: false,
      intensity: 1
    },
    whiteFrost: {
      active: false,
      intensity: 1
    },
    whitePearl: {
      active: false,
      intensity: 1
    }
  });
  const {
    autoLockDisabled,
    setAutoLockDisabled
  } = usePasswordProtection();
  const {
    subscribed,
    subscription_tier,
    subscription_end,
    openCustomerPortal,
    isLoggedIn
  } = useSubscription();

  // Countdown timer state
  const [timeRemaining, setTimeRemaining] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  // Update countdown timer
  useEffect(() => {
    if (!subscription_end) return;
    const updateTimer = () => {
      const now = new Date().getTime();
      const endTime = new Date(subscription_end).getTime();
      const difference = endTime - now;
      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(difference % (1000 * 60 * 60 * 24) / (1000 * 60 * 60)),
          minutes: Math.floor(difference % (1000 * 60 * 60) / (1000 * 60)),
          seconds: Math.floor(difference % (1000 * 60) / 1000)
        });
      } else {
        setTimeRemaining({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        });
      }
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [subscription_end]);
  const handleCancelSubscription = async () => {
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('cancel-subscription', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      if (error) throw error;
      toast.success("Assinatura será cancelada no final do período");
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast.error("Erro ao cancelar assinatura");
    }
  };

  // Função para aplicar paletas de forma consistente
  const applyPalette = (paletteClass: string, resetGradients: boolean = true) => {
    // Remover todas as outras paletas
    const allPalettes = ['home-palette', 'professional-palette', 'professional-palette-prime', 'ecommerce-palette', 'fire-palette'];
    // Adicionar as 20 novas paletas de cores
    const colorPalettes = Object.keys(colorToggleNames).map(key => `color-${key}`);
    const allClasses = [...allPalettes, ...colorPalettes];
    allClasses.forEach(palette => {
      document.documentElement.classList.remove(palette);
      document.body.classList.remove(palette);
    });

    // Aplicar a paleta desejada
    if (paletteClass) {
      document.documentElement.classList.add(paletteClass);
      document.body.classList.add(paletteClass);

      // Aplicar ao html também para garantir cobertura total
      document.querySelector('html')?.classList.add(paletteClass);
    }

    // Resetar gradientes se necessário
    if (resetGradients) {
      Object.keys(gradientNames).forEach(key => {
        document.documentElement.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
        document.body.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
        document.querySelector('html')?.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
      });
      // Resetar gradientes suaves também
      Object.keys(lightGradientNames).forEach(key => {
        document.documentElement.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
        document.body.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
        document.querySelector('html')?.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
      });
      setGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        return newState;
      });
      setLightGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        return newState;
      });
    }
  };

  // Nomes dos 40 toggles de cores (20 vibrantes + 20 suaves)
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
    silverMoon: 'Lua Prateada',
    // Cores suaves
    softBlue: 'Azul Suave',
    softPink: 'Rosa Suave',
    softGreen: 'Verde Suave',
    softYellow: 'Amarelo Suave',
    softPurple: 'Roxo Suave',
    softCoral: 'Coral Suave',
    softTeal: 'Verde-Água Suave',
    softLavender: 'Lavanda Suave',
    softMint: 'Menta Suave',
    softRose: 'Rosa Pétala Suave',
    softPeach: 'Pêssego Suave',
    softSky: 'Azul Céu Suave',
    softAmber: 'Âmbar Suave',
    softEmerald: 'Esmeralda Suave',
    softLilac: 'Lilás Suave',
    softAqua: 'Água Cristalina Suave',
    softCream: 'Creme Suave',
    softBlush: 'Blush Suave',
    softFrost: 'Gelo Suave',
    softPearl: 'Pérola Suave'
  };

  // Função para lidar com os novos toggles de cores
  const handleColorToggle = (colorKey: string) => {
    const isCurrentlyActive = colorToggles[colorKey as keyof typeof colorToggles];
    if (isCurrentlyActive) {
      // Desativar esta cor
      applyPalette('', false);
      setColorToggles(prev => ({
        ...prev,
        [colorKey]: false
      }));
    } else {
      // Desativar todas as outras cores e paletas
      setColorToggles(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = false;
        });
        newState[colorKey as keyof typeof newState] = true;
        return newState;
      });

      // Resetar estados das paletas e gradientes
      setHomeMode(false);
      setProfessionalMode(false);
      setEcommerceMode(false);
      setFireMode(false);
      setGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        return newState;
      });

      // Aplicar a nova cor
      applyPalette(`color-${colorKey}`, true);
    }
  };

  // Função para aplicar gradientes de forma consistente
  const applyGradient = (gradientKey: string, intensity: number = 1) => {
    // Remover todas as paletas primeiro
    applyPalette('', false);

    // Remover todos os outros gradientes
    Object.keys(gradientNames).forEach(key => {
      document.documentElement.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
      document.body.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
      document.querySelector('html')?.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
    });
    // Remover gradientes suaves também
    Object.keys(lightGradientNames).forEach(key => {
      document.documentElement.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
      document.body.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
      document.querySelector('html')?.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
    });

    // Aplicar o gradiente específico
    const classToAdd = `gradient-${gradientKey}${intensity > 1 ? `-${intensity}` : ''}`;
    document.documentElement.classList.add(classToAdd);
    document.body.classList.add(classToAdd);
    document.querySelector('html')?.classList.add(classToAdd);
  };

  // Função para aplicar gradientes suaves
  const applyLightGradient = (gradientKey: string, intensity: number = 1) => {
    // Remover todas as paletas primeiro
    applyPalette('', false);

    // Remover todos os outros gradientes
    Object.keys(gradientNames).forEach(key => {
      document.documentElement.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
      document.body.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
      document.querySelector('html')?.classList.remove(`gradient-${key}`, `gradient-${key}-2`, `gradient-${key}-3`);
    });
    Object.keys(lightGradientNames).forEach(key => {
      document.documentElement.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
      document.body.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
      document.querySelector('html')?.classList.remove(`light-gradient-${key}`, `light-gradient-${key}-2`, `light-gradient-${key}-3`);
    });

    // Aplicar o gradiente suave específico
    const classToAdd = `light-gradient-${gradientKey}${intensity > 1 ? `-${intensity}` : ''}`;
    document.documentElement.classList.add(classToAdd);
    document.body.classList.add(classToAdd);
    document.querySelector('html')?.classList.add(classToAdd);
  };
  const handleCreatorModeToggle = () => {
    setShowCreatorMode(!showCreatorMode);
    if (!showCreatorMode) {
      // Ativar modo criador de conteúdo
      document.documentElement.classList.add('creator-mode');
    } else {
      // Desativar modo criador de conteúdo
      document.documentElement.classList.remove('creator-mode');
    }
  };
  const handleProfessionalModeToggle = () => {
    setProfessionalMode(!professionalMode);
    if (!professionalMode) {
      // Resetar toggles de cores
      setColorToggles(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = false;
        });
        return newState;
      });
      // Resetar gradientes também
      setGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        return newState;
      });
      setLightGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        return newState;
      });
      // Ativar paleta profissional prime
      applyPalette('professional-palette-prime');
      setHomeMode(false);
      setEcommerceMode(false);
      setFireMode(false);
    } else {
      // Desativar paleta profissional prime
      applyPalette('');
    }
  };
  const handleHomeModeToggle = () => {
    setHomeMode(!homeMode);
    if (!homeMode) {
      // Resetar toggles de cores
      setColorToggles(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = false;
        });
        return newState;
      });
      // Ativar paleta home
      applyPalette('home-palette');
      setProfessionalMode(false);
      setEcommerceMode(false);
      setFireMode(false);
    } else {
      // Desativar paleta home
      applyPalette('');
    }
  };
  const handleEcommerceModeToggle = () => {
    setEcommerceMode(!ecommerceMode);
    if (!ecommerceMode) {
      // Resetar toggles de cores
      setColorToggles(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = false;
        });
        return newState;
      });
      // Ativar paleta e-commerce
      applyPalette('ecommerce-palette');
      setHomeMode(false);
      setProfessionalMode(false);
      setFireMode(false);
    } else {
      // Desativar paleta e-commerce
      applyPalette('');
    }
  };
  const handleFireModeToggle = () => {
    setFireMode(!fireMode);
    if (!fireMode) {
      // Resetar toggles de cores
      setColorToggles(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = false;
        });
        return newState;
      });
      // Ativar paleta fire
      applyPalette('fire-palette');
      setHomeMode(false);
      setProfessionalMode(false);
      setEcommerceMode(false);
    } else {
      // Desativar paleta fire
      applyPalette('');
    }
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
  const handleGradientToggle = (gradientKey: string) => {
    const currentState = gradientStates[gradientKey as keyof typeof gradientStates];

    // Resetar estados das paletas e cores
    setHomeMode(false);
    setProfessionalMode(false);
    setEcommerceMode(false);
    setFireMode(false);
    setColorToggles(prev => {
      const newState = {
        ...prev
      };
      Object.keys(newState).forEach(key => {
        newState[key as keyof typeof newState] = false;
      });
      return newState;
    });
    setLightGradientStates(prev => {
      const newState = {
        ...prev
      };
      Object.keys(newState).forEach(key => {
        newState[key as keyof typeof newState] = {
          active: false,
          intensity: 1
        };
      });
      return newState;
    });
    if (currentState.active) {
      // Desativar este gradiente
      applyPalette('', false);
      setGradientStates(prev => ({
        ...prev,
        [gradientKey]: {
          active: false,
          intensity: 1
        }
      }));
    } else {
      // Ativar este gradiente e desativar todos os outros
      setGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        newState[gradientKey as keyof typeof newState] = {
          active: true,
          intensity: 1
        };
        return newState;
      });
      // Resetar gradientes suaves também
      setLightGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        return newState;
      });
      applyGradient(gradientKey, 1);
    }
  };
  const handleLightGradientToggle = (gradientKey: string) => {
    const currentState = lightGradientStates[gradientKey as keyof typeof lightGradientStates];

    // Resetar estados das paletas e cores
    setHomeMode(false);
    setProfessionalMode(false);
    setEcommerceMode(false);
    setFireMode(false);
    setColorToggles(prev => {
      const newState = {
        ...prev
      };
      Object.keys(newState).forEach(key => {
        newState[key as keyof typeof newState] = false;
      });
      return newState;
    });
    setGradientStates(prev => {
      const newState = {
        ...prev
      };
      Object.keys(newState).forEach(key => {
        newState[key as keyof typeof newState] = {
          active: false,
          intensity: 1
        };
      });
      return newState;
    });
    if (currentState.active) {
      // Desativar este gradiente suave
      applyPalette('', false);
      setLightGradientStates(prev => ({
        ...prev,
        [gradientKey]: {
          active: false,
          intensity: 1
        }
      }));
    } else {
      // Ativar este gradiente suave e desativar todos os outros
      setLightGradientStates(prev => {
        const newState = {
          ...prev
        };
        Object.keys(newState).forEach(key => {
          newState[key as keyof typeof newState] = {
            active: false,
            intensity: 1
          };
        });
        newState[gradientKey as keyof typeof newState] = {
          active: true,
          intensity: 1
        };
        return newState;
      });
      applyLightGradient(gradientKey, 1);
    }
  };
  const handleLightIntensityChange = (gradientKey: string, intensity: number) => {
    const currentState = lightGradientStates[gradientKey as keyof typeof lightGradientStates];
    if (!currentState.active) return;

    // Aplicar nova intensidade do gradiente suave
    applyLightGradient(gradientKey, intensity);
    setLightGradientStates(prev => ({
      ...prev,
      [gradientKey]: {
        ...prev[gradientKey as keyof typeof prev],
        intensity
      }
    }));
  };
  const handleIntensityChange = (gradientKey: string, intensity: number) => {
    const currentState = gradientStates[gradientKey as keyof typeof gradientStates];
    if (!currentState.active) return;

    // Aplicar nova intensidade do gradiente
    applyGradient(gradientKey, intensity);
    setGradientStates(prev => ({
      ...prev,
      [gradientKey]: {
        ...prev[gradientKey as keyof typeof prev],
        intensity
      }
    }));
  };
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="bg-background hover:bg-secondary border-border" disabled={disabled} title="Menu de opções">
          <Menu className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-popover backdrop-blur-md border-border z-[100]">
        <DropdownMenuItem asChild className="p-0">
          <SettingsDialog onImageUpload={onImageUpload} onVideoUpload={onVideoUpload} onSaveState={onSaveState} onLoadState={onLoadState} disabled={disabled} />
        </DropdownMenuItem>
        

        <DropdownMenuItem asChild className="p-0">
          <PaymentPortalSelector disabled={disabled} />
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild className="p-0">
          <Button size="sm" variant="ghost" className="w-full justify-start bg-background hover:bg-secondary border-0 text-foreground p-2 h-auto rounded-none" disabled={disabled} onClick={() => setShowWishlistDialog(true)}>
            <Heart className="w-4 h-4 mr-2" />
            <span>Wishlist</span>
          </Button>
        </DropdownMenuItem>
        
        

        <DropdownMenuItem className="flex items-center justify-between gap-2 cursor-pointer hover:bg-secondary/80" disabled={disabled} onSelect={e => e.preventDefault()}>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Lock className="w-4 h-4 text-muted-foreground" />
              <Timer className="w-2 h-2 absolute -top-0.5 -right-0.5 text-primary cursor-pointer hover:text-primary/80 transition-colors" onClick={e => {
              e.stopPropagation();
              setShowAutoLockConfig(true);
            }} />
            </div>
            <span>{autoLockDisabled ? "Auto-Lock Desativado" : "Auto-Lock Ativo"}</span>
          </div>
          <Switch checked={!autoLockDisabled} onCheckedChange={checked => setAutoLockDisabled(!checked)} />
        </DropdownMenuItem>


        <DropdownMenuItem asChild className="p-0">
          <PaletteConfigDialog homeMode={homeMode} professionalMode={professionalMode} ecommerceMode={ecommerceMode} fireMode={fireMode} colorToggles={colorToggles} gradientStates={gradientStates} lightGradientStates={lightGradientStates} onHomeModeToggle={handleHomeModeToggle} onProfessionalModeToggle={handleProfessionalModeToggle} onEcommerceModeToggle={handleEcommerceModeToggle} onFireModeToggle={handleFireModeToggle} onColorToggle={handleColorToggle} onGradientToggle={handleGradientToggle} onLightGradientToggle={handleLightGradientToggle} onGradientIntensityChange={handleIntensityChange} onLightGradientIntensityChange={handleLightIntensityChange} disabled={disabled} />
        </DropdownMenuItem>

      </DropdownMenuContent>
      
      <PasswordDialog mode="set" isOpen={showPasswordDialog} onClose={() => setShowPasswordDialog(false)} />
      
      <AutoLockConfigDialog isOpen={showAutoLockConfig} onClose={() => setShowAutoLockConfig(false)} />
      
      <WishlistDialog open={showWishlistDialog} onOpenChange={setShowWishlistDialog} />
    </DropdownMenu>;
};