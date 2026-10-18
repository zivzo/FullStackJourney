import { useEffect, useState } from 'react'

function parseHash(): string[] {
  return window.location.hash
    .replace(/^#\/?/, '')
    .split('/')
    .filter(Boolean)
    .map(safeDecode)
}

function safeDecode(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

/**
 * Minimal hash-based router. Hash URLs (e.g. `#/frontend/react`) work on
 * GitHub Pages without any server-side rewrite rules.
 */
export function useHashRoute(): string[] {
  const [segments, setSegments] = useState<string[]>(parseHash)

  useEffect(() => {
    const onChange = () => {
      setSegments(parseHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return segments
}

export function href(...segments: string[]): string {
  return `#/${segments.map(encodeURIComponent).join('/')}`
}
