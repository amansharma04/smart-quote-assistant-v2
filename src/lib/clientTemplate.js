import { fillTemplate } from './validators.js'

/**
 * Combines a client's own fields (business name, brand color, extra
 * questions, copy overrides) with its industry template (question set,
 * FAQs, scoring rules, email copy) into one object the quote page and the
 * lead-submission function both use. This is the only place that knows how
 * client + template fit together — everything else just reads the result.
 */
export function resolveClientPage(client, template) {
  const defaults = template.clientPageDefaults || {}

  const headline =
    client.headline || fillTemplate(defaults.headlineTemplate || '{businessName}', { businessName: client.businessName })
  const subheadline =
    client.subheadline ||
    fillTemplate(defaults.subheadlineTemplate || '', { businessName: client.businessName })
  const submitButtonText = client.submitButtonText || defaults.submitButtonText || 'Submit Request'

  const questions = [...(template.questions || []), ...(client.extraQuestions || [])]

  return {
    clientId: client.clientId,
    slug: client.slug,
    businessName: client.businessName,
    logo: client.logo,
    brandColor: client.brandColor || '#0E7C86',
    services: client.services || [],
    phone: client.phone,
    website: client.website,
    serviceArea: client.serviceArea,
    industryTemplateId: template.id,
    serviceCategories: template.serviceCategories || [],
    referencePrefix: template.referencePrefix || 'REQ',
    headline,
    subheadline,
    submitButtonText,
    questions,
    faqs: template.faqs || [],
    feedbackQuestions: template.feedbackQuestions || [],
    leadScoringRules: template.leadScoringRules || [],
    followUpTemplate: template.followUpTemplate || '',
    emailTemplates: template.emailTemplates || {},
    seo: {
      title: fillTemplate(template.seo?.titleTemplate || '{businessName}', { businessName: client.businessName }),
      description: fillTemplate(template.seo?.descriptionTemplate || '', { businessName: client.businessName }),
      ogImage: template.seo?.ogImage || '',
    },
  }
}
