import { ENVIRONMENTS, EnvironmentValue } from 'src/globals/types'

const KNOWN_ENVIRONMENTS = new Set<string>(Object.values(ENVIRONMENTS))

export function isKnownEnvironment(value: EnvironmentValue): value is ENVIRONMENTS {
  return KNOWN_ENVIRONMENTS.has(value)
}

// Uses the WHATWG URL parser to validate the value, then requires the hostname to
// have at least two non-empty dot-separated labels. This rejects bare strings like
// `prodution`, `localhost`, or `prodution.` so typos of known environments don't
// silently pass through.
export function isValidCustomDomain(value: string): boolean {
  try {
    const candidate = /^https?:\/\//.test(value) ? value : `https://${value}`
    const { hostname } = new URL(candidate)
    const labels = hostname.split('.')
    return labels.length >= 2 && labels.every((label) => label.length > 0)
  } catch {
    return false
  }
}
