import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const CLIENTS_SHEET_TITLE = 'Clients'
const LEADS_SHEET_TITLE = 'Leads'

const CLIENTS_HEADER = [
  'clientId',
  'slug',
  'businessName',
  'logo',
  'brandColor',
  'industryTemplateId',
  'servicesJson',
  'extraQuestionsJson',
  'notificationEmail',
  'secondaryNotifyEmail',
  'phone',
  'website',
  'serviceArea',
  'headline',
  'subheadline',
  'submitButtonText',
  'enabled',
  'createdAt',
]

// Per-lead answers live in `answersJson` as a JSON blob keyed by question id
// rather than fixed columns — that's what lets any industry template's
// question set work with zero changes to the storage layer.
const LEADS_HEADER = [
  'leadId',
  'clientId',
  'clientSlug',
  'industryTemplateId',
  'referenceNumber',
  'createdAt',
  'status',
  'source',
  'internalNotes',
  'score',
  'answersJson',
  'feedbackToken',
  'feedbackTokenExpiresAt',
  'feedbackJson',
  'submitterIp',
]

let cachedDoc = null

async function getDoc() {
  if (cachedDoc) return cachedDoc

  const sheetId = process.env.GOOGLE_SHEET_ID
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = (process.env.GOOGLE_PRIVATE_KEY || '').replace(/\\n/g, '\n')

  if (!sheetId || !email || !key) {
    throw new Error('Google Sheets is not configured.')
  }

  const jwt = new JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] })
  const doc = new GoogleSpreadsheet(sheetId, jwt)
  await doc.loadInfo()
  cachedDoc = doc
  return doc
}

async function getOrCreateSheet(doc, title, header) {
  let sheet = doc.sheetsByTitle[title]
  if (!sheet) {
    sheet = await doc.addSheet({ title, headerValues: header })
  } else if (!sheet.headerValues || sheet.headerValues.length === 0) {
    await sheet.setHeaderRow(header)
  }
  return sheet
}

export async function getClientsSheet() {
  const doc = await getDoc()
  return getOrCreateSheet(doc, CLIENTS_SHEET_TITLE, CLIENTS_HEADER)
}

export async function getLeadsSheet() {
  const doc = await getDoc()
  return getOrCreateSheet(doc, LEADS_SHEET_TITLE, LEADS_HEADER)
}

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback
  } catch {
    return fallback
  }
}

export function rowToClient(row) {
  return {
    clientId: row.get('clientId'),
    slug: row.get('slug'),
    businessName: row.get('businessName'),
    logo: row.get('logo') || '',
    brandColor: row.get('brandColor') || '#0E7C86',
    industryTemplateId: row.get('industryTemplateId'),
    services: safeParse(row.get('servicesJson'), []),
    extraQuestions: safeParse(row.get('extraQuestionsJson'), []),
    notificationEmail: row.get('notificationEmail') || '',
    secondaryNotifyEmail: row.get('secondaryNotifyEmail') || '',
    phone: row.get('phone') || '',
    website: row.get('website') || '',
    serviceArea: row.get('serviceArea') || '',
    headline: row.get('headline') || '',
    subheadline: row.get('subheadline') || '',
    submitButtonText: row.get('submitButtonText') || '',
    enabled: row.get('enabled') !== 'false',
    createdAt: row.get('createdAt'),
  }
}

export function rowToLead(row) {
  return {
    leadId: row.get('leadId'),
    clientId: row.get('clientId'),
    clientSlug: row.get('clientSlug'),
    industryTemplateId: row.get('industryTemplateId'),
    referenceNumber: row.get('referenceNumber'),
    createdAt: row.get('createdAt'),
    status: row.get('status') || 'New',
    source: row.get('source') || 'website',
    internalNotes: row.get('internalNotes') || '',
    score: Number(row.get('score')) || 0,
    answers: safeParse(row.get('answersJson'), {}),
    feedbackToken: row.get('feedbackToken') || '',
    feedbackTokenExpiresAt: row.get('feedbackTokenExpiresAt') || '',
    feedback: safeParse(row.get('feedbackJson'), null),
  }
}
