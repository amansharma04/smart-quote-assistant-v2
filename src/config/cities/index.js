// Registry of city configs. Adding a new city requires ONLY adding a new
// JSON file to src/config/cities/ — no component or route code changes.
const modules = import.meta.glob('./*.json', { eager: true })

const cities = Object.values(modules).map((mod) => mod.default || mod)

export function listCities({ onlyEnabled = false } = {}) {
  return onlyEnabled ? cities.filter((c) => c.enabled) : cities
}

export function getCity(slug) {
  return cities.find((c) => c.slug === slug) || null
}
