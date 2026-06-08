import { useEffect, useMemo, useState } from 'react'
import ThemeContext from './themeStore'
import { getScaledFontSizes, getThemeColors } from '../theme/colors'

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(false)
  const [fontScale, setFontScale] = useState(50)
  const theme = useMemo(() => getThemeColors(dark), [dark])
  const scaledFontSizes = useMemo(() => getScaledFontSizes(fontScale), [fontScale])

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    document.documentElement.dataset.theme = dark ? 'dark' : 'light'

    Object.entries(theme).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--theme-${key}`, value)
    })

    Object.entries(scaledFontSizes).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--font-${key}`, `${value}px`)
    })
  }, [dark, theme, scaledFontSizes])

  return (
    <ThemeContext.Provider value={{ dark, setDark, theme, fontScale, setFontScale, fontSizes: scaledFontSizes }}>
      {children}
    </ThemeContext.Provider>
  )
}

