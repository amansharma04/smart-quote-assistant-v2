import { GoogleSpreadsheet } from 'google-spreadsheet'
import { JWT } from 'google-auth-library'

const LEADS_SHEET_TITLE = 'Leads'
const BUSINESSES_SHEET_TITLE = 'Businesses'
const SETTINGS_SHEET_TITLE = 'Settings'

// Generic, industry-agnostic schema. Per-industry question answers live in
// `answersJson` as a JSON blob keyed by question id — this is what lets a
// new industry config work with zero changes to the storage layer.
const LEADS_HEADER = [
  'leadId',
  'industryId',
  'citySlug',
  'referenceNumber',
  'createdAt',
  'status',
  'assignedBusinessId',
  'internalNotes',
  'score',
  'answersJson',
  'feedbackToken',
  'feedbackTokenExpiresAt',
  'feedbackJson',
  'submitterIp',
]

const BUSINESSES_HEADER = [
  'businessId',
  'industryId',
  'companyName',
  'ownerName',
  'phone',
  'email',
  'website',
  'serviceArea',
  'cities',
  'status',
  'pricing',
  'notes',
  'createdAt',
]

const SETTINGS_HEADER = ['key', 'valueJson', 'updatedAt']

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

export async function getLeadsSheet() {
  const doc = await getDoc()
  return getOrCreateSheet(doc, LEADS_SHEET_TITLE, LEADS_HEADER)
}

export async function getBusinessesSheet() {
  const doc = await getDoc()
  return getOrCreateSheet(doc, BUSINESSES_SHEET_TITLE, BUSINESSES_HEADER)
}

export async function getSettingsSheet() {
  const doc = await getDoc()
  return getOrCreateSheet(doc, SETTINGS_SHEET_TITLE, SETTINGS_HEADER)
}

function safeParse(json, fallback) {
  try {
    return json ? JSON.parse(json) : fallback
  } catch {
    return fallback
  }
}

export function rowToLead(row) {
  return {
    leadId: row.get('leadId'),
    industryId: row.get('industryId'),
    citySlug: row.get('citySlug'),
    referenceNumber: row.get('referenceNumber'),
    createdAt: row.get('createdAt'),
    status: row.get('status') || 'New',
    assignedBusinessId: row.get('assignedBusinessId') || '',
    internalNotes: row.get('internalNotes') || '',
    score: Number(row.get('score')) || 0,
    answers: safeParse(row.get('answersJson'), {}),
    feedbackToken: row.get('feedbackToken') || '',
    feedbackTokenExpiresAt: row.get('feedbackTokenExpiresAt') || '',
    feedback: safeParse(row.get('feedbackJson'), null),
  }
}

export function rowToBusiness(row) {
  return {
    businessId: row.get('businessId'),
    industryId: row.get('industryId'),
    companyName: row.get('companyName'),
    ownerName: row.get('ownerName'),
    phone: row.get('phone'),
    email: row.get('email'),
    website: row.get('website'),
    serviceArea: row.get('serviceArea'),
    cities: safeParse(row.get('cities'), []),
    status: row.get('status') || 'Prospect',
    pricing: row.get('pricing') || '',
    notes: row.get('notes') || '',
    createdAt: row.get('createdAt'),
  }
}
