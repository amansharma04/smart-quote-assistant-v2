import fs from 'fs'
import path from 'path'

// Reads the same JSON template/demo-client files the frontend uses. Netlify
// includes these non-imported files via `included_files` in netlify.toml, so
// adding a new industry template requires no code change on either side.
const INDUSTRIES_DIR = path.join(process.cwd(), 'src', 'config', 'industries')
const DEMO_CLIENTS_DIR = path.join(process.cwd(), 'src', 'config', 'clients')

function readJsonDir(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

export function getIndustryTemplate(id) {
  const all = readJsonDir(INDUSTRIES_DIR)
  return all.find((t) => t.id === id) || null
}

export function listIndustryTemplates() {
  return readJsonDir(INDUSTRIES_DIR)
}

// Demo clients only — real paying clients live in the Clients sheet.
export function getStaticClient(slug) {
  const all = readJsonDir(DEMO_CLIENTS_DIR)
  return all.find((c) => c.slug === slug) || null
}
