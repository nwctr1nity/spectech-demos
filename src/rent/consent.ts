// Cookie consent for the rental sites.
// Necessary cookies (always on): the consent choice itself and the guest's last quote,
// so the calculator shows the same car and dates when they come back.
// Analytics (GA4) and marketing (Meta Pixel) load only after the guest allows them,
// and only if the tenant has an id configured.

export type Consent = { v: 1; analytics: boolean; marketing: boolean; at: string }
export type Trackers = { ga4?: string; pixel?: string }

const DAY = 864e5
const KEY = 'rent_consent'
const QUOTE = 'rent_quote'
const path = () => location.pathname.match(/^\/rent\/[^/]+\//)?.[0] ?? '/'

export function getCookie(name: string) {
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : undefined
}
export function setCookie(name: string, value: string, days: number) {
  const secure = location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${Math.round((days * DAY) / 1000)}; Path=${path()}; SameSite=Lax${secure}`
}
function json<T>(raw: string | undefined): T | undefined {
  try { return raw ? (JSON.parse(raw) as T) : undefined } catch { return undefined }
}

export const readConsent = () => json<Consent>(getCookie(KEY))
export function saveConsent(analytics: boolean, marketing: boolean) {
  const c: Consent = { v: 1, analytics, marketing, at: new Date().toISOString() }
  setCookie(KEY, JSON.stringify(c), 180)
  return c
}

export type SavedQuote = { car: string; days: number; del: string; cov: string; start?: string }
export const readQuote = () => (readConsent() ? json<SavedQuote>(getCookie(QUOTE)) : undefined)
export function saveQuote(q: SavedQuote) { if (readConsent()) setCookie(QUOTE, JSON.stringify(q), 30) }

type W = Window & { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void; fbq?: ((...a: unknown[]) => void) & { q?: unknown[] } }
const w = window as W
function script(src: string) {
  if (document.querySelector(`script[src="${src}"]`)) return
  const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s)
}

/** Loads the trackers the guest allowed. Safe to call repeatedly. */
export function applyConsent(c: Consent | undefined, t: Trackers) {
  if (!c) return
  if (c.analytics && t.ga4 && !w.gtag) {
    w.dataLayer = w.dataLayer || []
    w.gtag = function gtag() { w.dataLayer!.push(arguments) } // eslint-disable-line prefer-rest-params
    w.gtag('js', new Date()); w.gtag('config', t.ga4, { anonymize_ip: true })
    script(`https://www.googletagmanager.com/gtag/js?id=${t.ga4}`)
  }
  if (c.marketing && t.pixel && !w.fbq) {
    const f = ((...a: unknown[]) => { f.q!.push(a) }) as NonNullable<W['fbq']>
    f.q = []; w.fbq = f
    f('init', t.pixel); f('track', 'PageView')
    script('https://connect.facebook.net/en_US/fbevents.js')
  }
}

/** A booking lead: guest pressed a WhatsApp button. Counted only if trackers were allowed. */
export function trackLead(label: string, value?: number) {
  w.gtag?.('event', 'generate_lead', { method: 'whatsapp', label, value, currency: 'AED' })
  w.fbq?.('track', 'Contact', value ? { value, currency: 'AED' } : undefined)
}

export const openCookieSettings = () => window.dispatchEvent(new Event('cookie-settings'))
