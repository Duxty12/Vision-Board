import type { Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';
import animate from 'tailwindcss-animate';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ─── Brand Fonts ──────────────────────────────────────────────
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', ...fontFamily.sans],
        serif: ['var(--font-lora)', ...fontFamily.serif],
        display: ['var(--font-playfair)', ...fontFamily.serif],
        handwriting: ['var(--font-caveat)', 'cursive'],
      },

      // ─── Brand Colors ─────────────────────────────────────────────
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Primary warm amber / cork palette
        cork: {
          50:  '#fdf8f0',
          100: '#faefd8',
          200: '#f5ddb0',
          300: '#edc67a',
          400: '#e4a94a',
          500: '#d9902e',
          600: '#c07423',
          700: '#9f5b1e',
          800: '#82491f',
          900: '#6b3d1d',
        },
        // Warm cream / linen
        linen: {
          50:  '#fdfaf5',
          100: '#f9f2e6',
          200: '#f2e4cc',
          300: '#e8d0a8',
          400: '#dab87e',
          500: '#cda05a',
          600: '#b8884a',
          700: '#99703d',
          800: '#7d5b35',
          900: '#674c2e',
        },
        // Pastel sticky-note palette (8 swatches)
        sticky: {
          yellow:  '#FFF3B0',
          peach:   '#FFD8B1',
          pink:    '#FFB3C6',
          lavender:'#E0C3FC',
          mint:    '#B7F0D4',
          sky:     '#BAE6FD',
          sage:    '#D1FAE5',
          blush:   '#FECDD3',
        },
        // Collections default palette
        collection: {
          DEFAULT: '#F5E6CC',
        },
        // UI neutrals (warm)
        sand: {
          50:  '#fafaf8',
          100: '#f5f4ef',
          200: '#eeeada',
          300: '#e1dbc5',
          400: '#cfc7ac',
          500: '#b9ae90',
          600: '#9e9378',
          700: '#837861',
          800: '#6b624f',
          900: '#585041',
        },
        // Dark theme surface
        charcoal: {
          50:  '#f6f6f6',
          100: '#e0e0e0',
          200: '#b8b8b8',
          300: '#909090',
          400: '#686868',
          500: '#484848',
          600: '#383838',
          700: '#2e2e2e',
          800: '#242424',
          900: '#1a1a1a',
          950: '#111111',
        },
      },

      // ─── Board Theme Backgrounds ──────────────────────────────────
      backgroundImage: {
        'cork-texture':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Cpath d='M0 0h4v4H0z' fill='%23c8944a' fill-opacity='0.12'/%3E%3Ccircle cx='1' cy='1' r='.5' fill='%23a07040' fill-opacity='0.18'/%3E%3Ccircle cx='3' cy='3' r='.4' fill='%238b6030' fill-opacity='0.14'/%3E%3C/svg%3E\")",
        'linen-texture':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='6' height='6'%3E%3Cpath d='M0 0h6v6H0z' fill='%23e8dcc8' fill-opacity='0.4'/%3E%3Cpath d='M0 0l6 6M6 0L0 6' stroke='%23d4c4a8' stroke-width='.4' opacity='.3'/%3E%3C/svg%3E\")",
        'board-gradient':
          'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 25%, #eff6ff 50%, #f0fdf4 75%, #fefce8 100%)',
        'hero-gradient':
          'linear-gradient(135deg, #fdf8f0 0%, #faefd8 40%, #fdf4ff 70%, #f0f9ff 100%)',
        'sidebar-gradient':
          'linear-gradient(180deg, #1a1512 0%, #231c15 40%, #1e1810 100%)',
      },

      // ─── Border Radius ────────────────────────────────────────────
      borderRadius: {
        'sticky': '10px',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },

      // ─── Box Shadows ──────────────────────────────────────────────
      boxShadow: {
        'sticky':  '3px 4px 14px rgba(0,0,0,0.18), 1px 2px 4px rgba(0,0,0,0.12)',
        'sticky-hover': '6px 8px 20px rgba(0,0,0,0.22), 2px 4px 8px rgba(0,0,0,0.14)',
        'card':    '0 2px 12px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
        'sidebar': '4px 0 24px rgba(0,0,0,0.3)',
        'pin':     '0 2px 8px rgba(0,0,0,0.35)',
        'glass':   '0 4px 32px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6)',
      },

      // ─── Animations ───────────────────────────────────────────────
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(var(--tw-rotate, 0deg))' },
          '50%':       { transform: 'translateY(-8px) rotate(var(--tw-rotate, 0deg))' },
        },
        'pin-drop': {
          '0%':   { transform: 'translateY(-20px) scale(0.8)', opacity: '0' },
          '60%':  { transform: 'translateY(4px) scale(1.02)', opacity: '1' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(24px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%':      { transform: 'rotate(2deg)' },
        },
        'accordion-down': {
          from: { height: '0' },
          to:   { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to:   { height: '0' },
        },
      },
      animation: {
        float:           'float 4s ease-in-out infinite',
        'float-slow':    'float 6s ease-in-out infinite',
        'float-slower':  'float 8s ease-in-out infinite',
        'pin-drop':      'pin-drop 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        'fade-in':       'fade-in 0.4s ease-out forwards',
        'slide-up':      'slide-up 0.4s ease-out forwards',
        'slide-in-right':'slide-in-right 0.35s ease-out forwards',
        wiggle:          'wiggle 0.4s ease-in-out',
        'accordion-down':'accordion-down 0.2s ease-out',
        'accordion-up':  'accordion-up 0.2s ease-out',
      },

      // ─── Spacing / Sizing ─────────────────────────────────────────
      spacing: {
        'sidebar': '260px',
        'sidebar-collapsed': '64px',
        'topbar':  '60px',
        'card':    '220px',
      },
    },
  },
  plugins: [animate],
};

export default config;
