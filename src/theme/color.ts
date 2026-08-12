// src/theme/colors.ts
export const colors = {
  // Primary Brand Colors
  primary: {
    dark: '#1B2A23',
    main: '#234E35',
    light: '#3B7A57',
    lighter: '#557060',
    bg: '#E3EFE6',
  },
  // Secondary/Accent Colors
  accent: {
    warm: '#E07A5F',
    warmBg: '#FADEC9',
    warmBorder: '#F5C29B',
    cream: '#FAF6EE',
    creamBorder: '#EBDEC0',
  },
  // UI States
  ui: {
    success: '#3B7A57',
    warning: '#E07A5F',
    danger: '#B95B5A',
    dangerBg: '#E79897',
    info: '#768E78',
  },
  // Neutrals
  neutral: {
    50: '#F7F2E8',
    100: '#F2F8F4',
    200: '#E3EFE6',
    300: '#C3DACB',
    400: '#557060',
    500: '#1B2A23',
    600: '#234E35',
    700: '#2D342E',
    800: '#6B756C',
    900: '#FAF6EE',
  },
};

export const getColorClass = (colorKey: string): string => {
  const colorMap: Record<string, string> = {
    'primary-main': 'bg-[#234E35] text-white',
    'primary-light': 'bg-[#3B7A57] text-white',
    'primary-bg': 'bg-[#E3EFE6] text-[#1B2A23]',
    'accent-warm': 'bg-[#E07A5F] text-white',
    'accent-warm-bg': 'bg-[#FADEC9] text-[#1B2A23]',
    'ui-success': 'bg-[#3B7A57] text-white',
    'ui-warning': 'bg-[#E07A5F] text-white',
    'ui-danger': 'bg-[#B95B5A] text-white',
    'neutral-bg': 'bg-[#F7F2E8] text-[#2D342E]',
    'neutral-card': 'bg-white text-[#1B2A23]',
    'neutral-border': 'border-[#C3DACB]',
  };
  
  return colorMap[colorKey] || '';
};