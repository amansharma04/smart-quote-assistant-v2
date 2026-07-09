// Only demo/sample clients live here as static JSON. Real paying clients are
// created through /admin/clients and stored in Google Sheets — adding a new
// client never requires a code change or deploy.
const modules = import.meta.glob('./*.json', { eager: true })

const demoClients = Object.values(modules).map((mod) => mod.default || mod)

export function getDemoClient(slug) {
  return demoClients.find((c) => c.slug === slug) || null
}

export function listDemoClients() {
  return demoClients
}
