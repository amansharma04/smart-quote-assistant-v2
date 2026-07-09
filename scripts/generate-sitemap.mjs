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

const industries = readJsonDir(path.join(root, 'src/config/industries')).filter((i) => i.enabled)
const cities = readJsonDir(path.join(root, 'src/config/cities')).filter((c) => c.enabled)

const staticPaths = ['/', '/privacy', '/terms']
const combinedPaths = []
for (const industry of industries) {
  for (const city of cities) {
    combinedPaths.push(`/${city.slug}-${industry.slug}`)
  }
}

const allPaths = [...staticPaths, ...combinedPaths]

const urlEntries = allPaths
  .map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`)
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`

fs.writeFileSync(path.join(root, 'public/sitemap.xml'), sitemap)

const robots = `User-agent: *\nAllow: /\nDisallow: /admin\nSitemap: ${SITE_URL}/sitemap.xml\n`

fs.writeFileSync(path.join(root, 'public/robots.txt'), robots)

console.log(`Generated sitemap.xml with ${allPaths.length} URLs and robots.txt`)
