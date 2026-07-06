import { useState } from 'react'
import { useAuthenticatedImageSrc } from '../../utils/useAuthenticatedImageSrc'

export default function Avatar({ name, size = 'sm', src = null, fallbackSrc = null }) {
  const resolvedSrc = useAuthenticatedImageSrc(src)
  const resolvedFallbackSrc = useAuthenticatedImageSrc(fallbackSrc)
  const [state, setState] = useState({
    trackedSrc: resolvedSrc,
    trackedFallback: resolvedFallbackSrc,
    currentSrc: resolvedSrc,
    imageFailed: false,
  })

  if (state.trackedSrc !== resolvedSrc || state.trackedFallback !== resolvedFallbackSrc) {
    setState({
      trackedSrc: resolvedSrc,
      trackedFallback: resolvedFallbackSrc,
      currentSrc: resolvedSrc,
      imageFailed: false,
    })
  }

  const { currentSrc, imageFailed } = state
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-12 h-12 text-lg' }

  const handleImageError = () => {
    if (resolvedFallbackSrc && currentSrc !== resolvedFallbackSrc) {
      setState(previous => ({ ...previous, currentSrc: resolvedFallbackSrc }))
      return
    }

    setState(previous => ({ ...previous, imageFailed: true }))
  }

  if (currentSrc && !imageFailed) {
    return (
      <img
        src={currentSrc}
        alt={name}
        onError={handleImageError}
        className={`${sizes[size]} rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0`}
      />
    )
  }

  return (
    <div className={`${sizes[size]} rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 flex items-center justify-center font-bold flex-shrink-0`}>
      {initials}
    </div>
  )
}
