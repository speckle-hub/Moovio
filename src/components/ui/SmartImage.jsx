import { useState } from 'react'

/**
 * `<img>` that falls back to a placeholder when the image fails to load (or
 * when `src` is missing). `fallback` is a React node rendered centered inside
 * a full-size container.
 */
export default function SmartImage({ src, alt = '', fallback = null, className = '', ...rest }) {
  const [failed, setFailed] = useState(false)
  const [prevSrc, setPrevSrc] = useState(src)

  if (src !== prevSrc) {
    setPrevSrc(src)
    setFailed(false)
  }

  if (failed || !src) {
    return (
      <div className={`flex h-full w-full items-center justify-center overflow-hidden bg-elevated ${className}`}>
        {fallback}
      </div>
    )
  }

  return <img src={src} alt={alt} onError={() => setFailed(true)} className={className} {...rest} />
}
