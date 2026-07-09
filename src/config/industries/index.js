// Registry of industry configs. Adding a new industry requires ONLY adding a
// new JSON file to src/config/industries/ — no component or route code changes.
const modules = import.meta.glob('./*.json', { eager: true })

const industries = Object.values(modules).map((mod) => mod.default || mod)

export function listIndustries({ onlyEnabled = false } = {}) {
  return onlyEnabled ? industries.filter((i) => i.enabled) : industries
}

export function getIndustry(slug) {
  return industries.find((i) => i.slug === slug) || null
}
