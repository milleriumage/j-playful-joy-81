
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				gold: {
					DEFAULT: 'hsl(var(--gold))',
					foreground: 'hsl(var(--gold-foreground))'
				},
				'dream-white': 'hsl(var(--dream-white))',
				'dream-gray': 'hsl(var(--dream-gray))',
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Home Palette - Cores especiais para ícones e elementos
				'home-heart': 'hsl(var(--icon-heart))',
				'home-cart': 'hsl(var(--icon-cart))',
				'home-like': 'hsl(var(--icon-like))',
				'home-chat': 'hsl(var(--icon-chat))',
				// Glass effects para Home Palette
				'glass-light': 'rgba(255, 255, 255, 0.15)',
				'glass-medium': 'rgba(255, 255, 255, 0.25)',
				'glass-strong': 'rgba(255, 255, 255, 0.35)',
				'glass-border': 'rgba(255, 255, 255, 0.30)',
				
				// Professional Palette Prime - Cores corporativas com alta legibilidade
				'prof-button-primary': 'hsl(var(--prof-button-primary))',
				'prof-button-secondary': 'hsl(var(--prof-button-secondary))',
				'prof-icon-action': 'hsl(var(--prof-icon-action))',
				'prof-text-primary': 'hsl(var(--prof-text-primary))',
				'prof-text-secondary': 'hsl(var(--prof-text-secondary))',
				'prof-border': 'hsl(var(--prof-border))'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'gentle-pulse': {
					'0%, 100%': {
						transform: 'scale(1)',
						boxShadow: '0 0 0 0 hsl(var(--success) / 0.4)'
					},
					'50%': {
						transform: 'scale(1.02)',
						boxShadow: '0 0 0 6px hsl(var(--success) / 0.1)'
					}
				},
				'fade': {
					'0%': {
						opacity: '0.7'
					},
					'100%': {
						opacity: '1'
					}
				},
				'slide-right-to-left': {
					'0%': {
						transform: 'translateX(100%)'
					},
					'100%': {
						transform: 'translateX(-100%)'
					}
				},
				'slide-bottom-to-top': {
					'0%': {
						transform: 'translateY(100%)'
					},
					'100%': {
						transform: 'translateY(-100%)'
					}
				},
				// Home Palette - Animações especiais
				'home-gradient': {
					'0%': {
						backgroundPosition: '0% 50%'
					},
					'50%': {
						backgroundPosition: '100% 50%'
					},
					'100%': {
						backgroundPosition: '0% 50%'
					}
				},
				'glass-hover': {
					'0%': {
						backdropFilter: 'blur(16px)',
						backgroundColor: 'rgba(255, 255, 255, 0.15)'
					},
					'100%': {
						backdropFilter: 'blur(24px)',
						backgroundColor: 'rgba(255, 255, 255, 0.25)'
					}
				},
				'home-glow': {
					'0%': {
						filter: 'drop-shadow(0 0 10px rgba(155, 48, 255, 0.3))'
					},
					'50%': {
						filter: 'drop-shadow(0 0 20px rgba(155, 48, 255, 0.6))'
					},
					'100%': {
						filter: 'drop-shadow(0 0 10px rgba(155, 48, 255, 0.3))'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'wishlist-glow': {
					'0%': {
						boxShadow: '0 0 20px rgba(255, 77, 109, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(255, 77, 109, 0.6)'
					},
					'100%': {
						boxShadow: '0 0 20px rgba(255, 77, 109, 0.3)'
					}
				},
				'pulse-glow': {
					'0%': { 
						boxShadow: '0 0 20px rgba(var(--primary), 0.3)',
						transform: 'scale(1)'
					},
					'100%': { 
						boxShadow: '0 0 40px rgba(var(--primary), 0.6)',
						transform: 'scale(1.02)'
					}
				},
				'confetti': {
					'0%': {
						transform: 'translateY(-100vh) rotate(0deg)',
						opacity: '1'
					},
					'100%': {
						transform: 'translateY(100vh) rotate(720deg)',
						opacity: '0'
					}
				},
				'loading-progress': {
					'0%': { 
						transform: 'translateX(-100%)' 
					},
					'50%': { 
						transform: 'translateX(0%)' 
					},
					'100%': { 
						transform: 'translateX(100%)' 
					}
				},
				'blink-circle': {
					'0%, 50%': { 
						backgroundColor: 'hsl(var(--green-600))',
						boxShadow: '0 0 8px hsl(var(--green-600) / 0.6)'
					},
					'51%, 100%': { 
						backgroundColor: 'transparent',
						boxShadow: '0 0 0 transparent'
					}
				},
				'blink-red': {
					'0%, 50%': { 
						color: 'hsl(var(--red-500))'
					},
					'51%, 100%': { 
						color: 'hsl(var(--red-400))'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'gentle-pulse': 'gentle-pulse 2s ease-in-out infinite',
				'slide-right-to-left': 'slide-right-to-left 3s linear infinite',
				'slide-bottom-to-top': 'slide-bottom-to-top 3s linear infinite',
				// Home Palette - Animações especiais
				'home-gradient': 'home-gradient 8s ease-in-out infinite',
				'glass-hover': 'glass-hover 0.3s ease-out',
				'home-glow': 'home-glow 2s ease-in-out infinite',
				'float': 'float 3s ease-in-out infinite',
				'wishlist-glow': 'wishlist-glow 2s ease-in-out infinite',
				'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite alternate',
				'confetti': 'confetti 3s ease-out forwards',
				'loading-progress': 'loading-progress 2s ease-in-out infinite',
				'blink-circle': 'blink-circle 1s ease-in-out infinite',
				'blink-red': 'blink-red 1s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
