import { getEffectiveCities, getEffectiveIndustries } from './siteConfig.js'

export function parseLandingSlug(combinedSlug, overrides) {
  const cities = getEffectiveCities(overrides, { onlyEnabled: true })
  const industries = getEffectiveIndustries(overrides, { onlyEnabled: true })

  for (const city of cities) {
    const prefix = `${city.slug}-`
    if (combinedSlug.startsWith(prefix)) {
      const industrySlug = combinedSlug.slice(prefix.length)
      const industry = industries.find((i) => i.slug === industrySlug)
      if (industry) return { city, industry }
    }
  }

  // Fall back to an industry-only slug (no city), so /hvac still works.
  const industryOnly = industries.find((i) => i.slug === combinedSlug)
  if (industryOnly) return { city: null, industry: industryOnly }

  return null
}
