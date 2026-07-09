import { useEffect } from 'react'
import { fillTemplate } from './validators.js'

function setMeta(name, content, attr = 'name') {
  if (!content) return
  let el = document.querySelector(`meta[${attr}="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

/**
 * Applies an industry's SEO config (title/description templates + Open
 * Graph image) for the current page, filling `{city}` placeholders.
 */
export function useSeo({ title, description, ogImage, path }) {
  useEffect(() => {
    if (title) document.title = title
    setMeta('description', description)
    setMeta('og:title', title, 'property')
    setMeta('og:description', description, 'property')
    setMeta('og:type', 'website', 'property')
    if (ogImage) setMeta('og:image', ogImage, 'property')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', title)
    setMeta('twitter:description', description)
    if (path && typeof window !== 'undefined') {
      setCanonical(`${window.location.origin}${path}`)
    }
  }, [title, description, ogImage, path])
}

export function buildSeo(industry, city) {
  const values = { city: city ? city.city : 'Your Area' }
  return {
    title: fillTemplate(industry.seo.title, values),
    description: fillTemplate(industry.seo.description, values),
    ogImage: industry.seo.ogImage,
  }
}
