import type { Config } from 'tailwindcss';
import tailwindcssAnimate from 'tailwindcss-animate';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Theme-aware colors using CSS variables
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: {
          DEFAULT: 'hsl(var(--background))',
          secondary: 'hsl(var(--background-secondary))',
          tertiary: 'hsl(var(--background-tertiary))',
        },
        foreground: {
          DEFAULT: 'hsl(var(--foreground))',
          secondary: 'hsl(var(--foreground-secondary))',
          muted: 'hsl(var(--foreground-muted))',
        },
        // Brand Colors - Navy Blue (#001F3F)
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: '#e6eef5',
          100: '#b3cfe0',
          200: '#80b0cc',
          300: '#4d91b8',
          400: '#1a72a3',
          500: '#001F3F', // Brand Navy
          600: '#001933',
          700: '#001326',
          800: '#000d1a',
          900: '#00060d',
        },
        'primary-foreground': 'hsl(var(--primary-foreground))',
        // Brand Colors - Gold (#C2B280)
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
          50: '#faf9f5',
          100: '#f0ede2',
          200: '#e6e1cf',
          300: '#dcd5bc',
          400: '#d2c9a9',
          500: '#C2B280', // Brand Gold
          600: '#b5a473',
          700: '#9b8d61',
          800: '#80764f',
          900: '#665f3d',
        },
        'secondary-foreground': 'hsl(var(--secondary-foreground))',
        // Accent Colors
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
          50: '#fff5f5',
          100: '#ffe0e0',
          200: '#ffcccc',
          300: '#ffb3b3',
          400: '#ff9999',
          500: '#ff6b6b',
          600: '#ff4d4d',
          700: '#ff3333',
          800: '#e60000',
          900: '#cc0000',
        },
        'accent-foreground': 'hsl(var(--accent-foreground))',
        // Utility Colors
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        'destructive-foreground': 'hsl(var(--destructive-foreground))',
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        'success-foreground': 'hsl(var(--success-foreground))',
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        'warning-foreground': 'hsl(var(--warning-foreground))',
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        'info-foreground': 'hsl(var(--info-foreground))',
      },
      fontFamily: {
        sans: ['var(--font-Shabnam-FD)', 'system-ui', 'sans-serif'],
        display: ['var(--font-Shabnam-FD)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gradient-shine':
          'linear-gradient(110deg, transparent 33%, rgba(255,255,255,0.1) 50%, transparent 66%)',
        'gradient-primary': 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #001F3F 0%, #003366 50%, #C2B280 100%)',
      },
      animation: {
        shine: 'shine 2s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.5s ease-out',
        'slide-in-right': 'slideInRight 0.5s ease-out',
        'slide-in-left': 'slideInLeft 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        shine: {
          '0%, 100%': { backgroundPosition: '200% center' },
          '50%': { backgroundPosition: '0% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      boxShadow: {
        'glow-primary': '0 0 20px hsl(var(--primary) / 0.5)',
        'glow-secondary': '0 0 20px hsl(var(--secondary) / 0.5)',
        'glow-accent': '0 0 20px hsl(var(--accent) / 0.5)',
        'inner-glow': 'inset 0 0 20px hsl(var(--primary) / 0.2)',
        luxury: '0 10px 40px rgba(0, 31, 63, 0.3), 0 0 20px rgba(194, 178, 128, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
