import { useEffect, useState } from 'react'
import { api } from '../lib/api.js'

export function useOverrides() {
  const [overrides, setOverrides] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    api
      .siteConfig()
      .then((data) => {
        if (!cancelled) setOverrides(data.overrides || {})
      })
      .catch(() => {
        if (!cancelled) setOverrides({})
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { overrides: overrides || {}, loading }
}
