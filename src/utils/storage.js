export const readJsonStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback

  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || 'null')
    return parsed ?? fallback
  } catch {
    return fallback
  }
}

export const writeJsonStorage = (key, value) => {
  if (typeof window === 'undefined') return false

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}
