import { listIndustries, getIndustry as getStaticIndustry } from '../config/industries/index.js'
import { listCities, getCity as getStaticCity } from '../config/cities/index.js'

/**
 * Applies admin-configured overrides (enable/disable, hero/cta/faq edits,
 * homepage ordering) on top of the static JSON configs. Overrides shape:
 * {
 *   industries: { [slug]: { enabled, hero, cta, faqs } },
 *   cities: { [slug]: { enabled } },
 *   homepageOrder: [slug, ...]
 * }
 */
export function mergeIndustry(industry, overrides) {
  const o = overrides?.industries?.[industry.slug]
  if (!o) return industry
  return {
    ...industry,
    enabled: o.enabled ?? industry.enabled,
    hero: { ...industry.hero, ...(o.hero || {}) },
    faqs: o.faqs ?? industry.faqs,
  }
}

export function mergeCity(city, overrides) {
  const o = overrides?.cities?.[city.slug]
  if (!o) return city
  return { ...city, enabled: o.enabled ?? city.enabled }
}

export function getEffectiveIndustries(overrides, { onlyEnabled = false } = {}) {
  let industries = listIndustries().map((i) => mergeIndustry(i, overrides))
  if (overrides?.homepageOrder?.length) {
    const order = overrides.homepageOrder
    industries = [
      ...order.map((slug) => industries.find((i) => i.slug === slug)).filter(Boolean),
      ...industries.filter((i) => !order.includes(i.slug)),
    ]
  }
  return onlyEnabled ? industries.filter((i) => i.enabled) : industries
}

export function getEffectiveCities(overrides, { onlyEnabled = false } = {}) {
  const cities = listCities().map((c) => mergeCity(c, overrides))
  return onlyEnabled ? cities.filter((c) => c.enabled) : cities
}

export function getEffectiveIndustry(slug, overrides) {
  const industry = getStaticIndustry(slug)
  return industry ? mergeIndustry(industry, overrides) : null
}

export function getEffectiveCity(slug, overrides) {
  const city = getStaticCity(slug)
  return city ? mergeCity(city, overrides) : null
}
