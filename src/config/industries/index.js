// Registry of industry templates (question sets, FAQs, scoring rules, email
// copy). Adding a new template requires ONLY adding a new JSON file here —
// no component or route code changes. Templates are always available; a
// client's own `enabled` flag controls whether their page is live.
const modules = import.meta.glob('./*.json', { eager: true })

const templates = Object.values(modules).map((mod) => mod.default || mod)

export function listIndustries() {
  return templates
}

export function getIndustry(id) {
  return templates.find((t) => t.id === id) || null
}
