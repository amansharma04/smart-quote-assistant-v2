import fs from 'fs'
import path from 'path'

// Reads the same JSON config files the frontend uses. Netlify includes these
// non-imported files via `included_files` in netlify.toml, so adding a new
// industry or city JSON file requires no code change on either side.
const INDUSTRIES_DIR = path.join(process.cwd(), 'src', 'config', 'industries')
const CITIES_DIR = path.join(process.cwd(), 'src', 'config', 'cities')

function readJsonDir(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

export function getIndustryConfig(slug) {
  const all = readJsonDir(INDUSTRIES_DIR)
  return all.find((i) => i.slug === slug) || null
}

export function getCityConfig(slug) {
  const all = readJsonDir(CITIES_DIR)
  return all.find((c) => c.slug === slug) || null
}

export function listIndustryConfigs() {
  return readJsonDir(INDUSTRIES_DIR)
}

export function listCityConfigs() {
  return readJsonDir(CITIES_DIR)
}
