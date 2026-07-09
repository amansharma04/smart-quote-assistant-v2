import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

const SITE_URL = process.env.SITE_URL || 'https://smartquoteassistant.com'

function readJsonDir(dir) {
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')))
}

// Real client pages are created and managed through /admin/clients and live
// in Google Sheets, not in this codebase, so they can't be enumerated at
// build time. Only the marketing pages and any static demo clients are
// included here.
const demoClients = readJsonDir(path.join(root, 'src/config/clients')).filter((c) => c.enabled)

const staticPaths = ['/', '/privacy', '/terms', ...demoClients.map((c) => `/${c.slug}`)]

const urlEntries = staticPaths.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`

fs.writeFileSync(path.join(root, 'public/sitemap.xml'), sitemap)

const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${SITE_URL}/sitemap.xml\n`

fs.writeFileSync(path.join(root, 'public/robots.txt'), robots)

console.log(`Generated sitemap.xml with ${staticPaths.length} URLs and robots.txt`)
