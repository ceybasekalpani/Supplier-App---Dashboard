export const themes = {
  light: {
    bg: '#F6F8F7',
    card: '#FFFFFF',
    cardBorder: '#DDE6E0',
    surface: '#F0F4F1',
    primary: '#237A45',
    primaryLight: '#3F9B5F',
    primaryDark: '#155E33',
    accent: '#2E6C45',
    text: '#17211B',
    textSecondary: '#526058',
    textMuted: '#7C8981',
    border: '#DDE6E0',
    success: '#237A45',
    warning: '#6E684D',
    error: '#B42318',
    info: '#237A45',
    white: '#FFFFFF',
    inputBg: '#FFFFFF',
    statusBar: 'dark-content',
    tabBar: '#FFFFFF',
    shadow: '#13251A18',
    disabled: '#A7B2AB',
    placeholder: '#87918B',
    backdrop: 'rgba(0,0,0,0.5)',
    notification: '#237A45',
    secondary: '#526058',
  },
  dark: {
    bg: '#0E1110',
    card: '#171B18',
    cardBorder: '#27312B',
    surface: '#111613',
    primary: '#4F9D66',
    primaryLight: '#67B77A',
    primaryDark: '#2F7344',
    accent: '#5EA370',
    text: '#F4F7F5',
    textSecondary: '#B8C2BC',
    textMuted: '#89958D',
    border: '#27312B',
    success: '#5AA86E',
    warning: '#B0A36A',
    error: '#D9655D',
    info: '#5AA86E',
    white: '#F5F8F6',
    inputBg: '#111613',
    statusBar: 'light-content',
    tabBar: '#171C19',
    shadow: '#00000099',
    disabled: '#68766E',
    placeholder: '#87958D',
    backdrop: 'rgba(0,0,0,0.8)',
    notification: '#5AA86E',
    secondary: '#B8C4BD',
  },
}

export const fontSizes = {
  small: {
    xs: 10,
    sm: 12,
    base: 13,
    md: 15,
    lg: 17,
    xl: 20,
    '2xl': 23,
    '3xl': 27,
  },
  medium: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 19,
    xl: 22,
    '2xl': 26,
    '3xl': 32,
  },
  large: {
    xs: 13,
    sm: 15,
    base: 17,
    md: 20,
    lg: 23,
    xl: 27,
    '2xl': 31,
    '3xl': 38,
  },
}

export const getThemeColors = (isDarkMode) => {
  return isDarkMode ? themes.dark : themes.light
}

const BASE_FONT_SIZES = { xs: 11, sm: 13, base: 15, md: 17, lg: 19, xl: 22, '2xl': 26, '3xl': 32 }

export function getScaledFontSizes(value) {
  const scale = 0.70 + ((value - 10) / 90) * 0.65
  const result = {}

  for (const key in BASE_FONT_SIZES) {
    result[key] = Math.max(8, Math.round(BASE_FONT_SIZES[key] * scale))
  }

  return result
}

export const hexToRgba = (hex, alpha = 1) => {
  const normalized = hex.replace('#', '')
  const bigint = parseInt(normalized, 16)
  const red = (bigint >> 16) & 255
  const green = (bigint >> 8) & 255
  const blue = bigint & 255

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
