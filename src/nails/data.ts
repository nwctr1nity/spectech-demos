// Demo sites for Dubai nail salons (/nails/<slug>/), barbershops (/barber/<slug>/, tenants in barbers.ts)
// and car garages (/garage/<slug>/, tenants in garages.ts).
// Name, phone, address, hours, rating and the quoted review come from the salon's public Google Maps listing.
// Services, prices and the team are typical examples, NOT the salon's real offer: replace on sale.

import { BARBERS } from './barbers'
import { GARAGES } from './garages'

export type Kind = 'nails' | 'barber' | 'garage'
export type Cat = 'Manicure' | 'Pedicure' | 'Extensions' | 'Lashes & brows' | 'Haircut' | 'Beard & shave' | 'Grooming'
  | 'Service & oil' | 'Brakes & tyres' | 'AC & electrics' | 'Diagnostics'
export type Service = { id: string; cat: Cat; name: string; mins: number; price: number; note?: string }
export type Master = { id: string; name: string; role: string; langs: string }
export type Tenant = {
  kind?: Kind
  slug: string; name: string; short: string; tag: string; area: string; address: string; phone: string; whatsapp: string
  /** opening hours, 24h clock */
  open: number; close: number; hours: string
  /** weekdays the place is closed, as Date.getDay() (0 = Sunday, 5 = Friday) */
  closed?: number[]
  /** other hours on some weekdays, e.g. { 5: [15.5, 22] } for Friday 3:30 pm – 10 pm */
  days?: Record<number, [number, number]>
  /** small line under the hours on the site, e.g. 'Friday till 8 pm' */
  hoursSub?: string
  rating: { value: string; count: number }
  review: { text: string; author: string }
  headline: string; lead: string
  masters: Master[]
  /** service categories in this order (default: the kind's order), e.g. AC first for an AC specialist */
  cats?: Cat[]
  services: string[]
  homeService?: boolean
  ga4?: string; pixel?: string
}

export const CATS_BY: Record<Kind, Cat[]> = { nails: ['Manicure', 'Pedicure', 'Extensions', 'Lashes & brows'], barber: ['Haircut', 'Beard & shave', 'Grooming'],
  garage: ['Service & oil', 'Brakes & tyres', 'AC & electrics', 'Diagnostics'],
}
export const CATS = CATS_BY.nails

export const SERVICES: Service[] = [
  { id: 'mani-classic', cat: 'Manicure', name: 'Classic manicure', mins: 45, price: 90 },
  { id: 'mani-gel', cat: 'Manicure', name: 'Gel manicure', mins: 75, price: 160, note: 'Cuticle care, shape, gel colour' },
  { id: 'mani-russian', cat: 'Manicure', name: 'Russian manicure with gel', mins: 90, price: 190, note: 'Dry e-file cuticle work, colour under the cuticle' },
  { id: 'mani-french', cat: 'Manicure', name: 'French gel manicure', mins: 100, price: 210 },
  { id: 'remove', cat: 'Manicure', name: 'Gel removal', mins: 20, price: 40 },
  { id: 'pedi-classic', cat: 'Pedicure', name: 'Classic pedicure', mins: 60, price: 120 },
  { id: 'pedi-gel', cat: 'Pedicure', name: 'Gel pedicure', mins: 80, price: 180 },
  { id: 'mani-pedi', cat: 'Pedicure', name: 'Gel mani + pedi combo', mins: 150, price: 320, note: 'Two masters at once on request' },
  { id: 'ext-gel', cat: 'Extensions', name: 'Gel extensions, new set', mins: 150, price: 320 },
  { id: 'ext-fill', cat: 'Extensions', name: 'Extensions refill', mins: 120, price: 250 },
  { id: 'art', cat: 'Extensions', name: 'Nail art, per nail', mins: 10, price: 15 },
  { id: 'lash-classic', cat: 'Lashes & brows', name: 'Classic lash extensions', mins: 120, price: 280 },
  { id: 'lash-volume', cat: 'Lashes & brows', name: 'Volume lash extensions', mins: 150, price: 350 },
  { id: 'lash-lift', cat: 'Lashes & brows', name: 'Lash lift & tint', mins: 60, price: 200 },
  { id: 'brows', cat: 'Lashes & brows', name: 'Brow shaping & tint', mins: 40, price: 120 },
  // barbershop menu
  { id: 'cut-classic', cat: 'Haircut', name: "Men's haircut", mins: 30, price: 50, note: 'Wash, cut, styling' },
  { id: 'cut-fade', cat: 'Haircut', name: 'Skin fade', mins: 45, price: 70, note: 'Clippers and scissors, sharp line-up' },
  { id: 'cut-beard', cat: 'Haircut', name: 'Haircut + beard', mins: 60, price: 90 },
  { id: 'cut-kids', cat: 'Haircut', name: 'Kids haircut', mins: 30, price: 40, note: 'Under 12' },
  { id: 'head-shave', cat: 'Haircut', name: 'Head shave', mins: 30, price: 40 },
  { id: 'beard-trim', cat: 'Beard & shave', name: 'Beard trim & shape', mins: 20, price: 35 },
  { id: 'hot-towel', cat: 'Beard & shave', name: 'Hot towel shave', mins: 30, price: 50, note: 'Straight razor, hot towel, aftershave balm' },
  { id: 'beard-color', cat: 'Beard & shave', name: 'Beard colour', mins: 30, price: 50 },
  { id: 'hair-color', cat: 'Grooming', name: 'Hair colour', mins: 45, price: 120 },
  { id: 'facial', cat: 'Grooming', name: "Men's facial", mins: 45, price: 120, note: 'Scrub, steam, mask' },
  { id: 'hair-spa', cat: 'Grooming', name: 'Hair spa & head massage', mins: 30, price: 80 },
  { id: 'mani-men', cat: 'Grooming', name: 'Manicure & pedicure', mins: 75, price: 130 },
  // garage menu: labour prices for a typical sedan, parts priced separately unless noted
  { id: 'oil-basic', cat: 'Service & oil', name: 'Oil & filter change', mins: 45, price: 149, note: 'Up to 4 L semi-synthetic oil, new filter, 20-point check' },
  { id: 'oil-full', cat: 'Service & oil', name: 'Full synthetic oil service', mins: 60, price: 249, note: 'Up to 5 L fully synthetic oil, oil and air filters' },
  { id: 'minor', cat: 'Service & oil', name: 'Minor service', mins: 90, price: 399, note: 'Oil, filters, fluids top-up, 50-point inspection' },
  { id: 'major', cat: 'Service & oil', name: 'Major service', mins: 180, price: 899, note: 'Spark plugs, all filters, brake fluid, full inspection' },
  { id: 'brake-front', cat: 'Brakes & tyres', name: 'Front brake pads', mins: 60, price: 299, note: 'Standard pads and fitting' },
  { id: 'brake-disc', cat: 'Brakes & tyres', name: 'Brake disc skimming', mins: 90, price: 250, note: 'Front pair, removes vibration when braking' },
  { id: 'tyre-fit', cat: 'Brakes & tyres', name: 'Tyre fitting & balancing', mins: 45, price: 120, note: 'Four wheels, tyres priced separately' },
  { id: 'align', cat: 'Brakes & tyres', name: 'Wheel alignment', mins: 45, price: 150, note: 'Computerised 4-wheel alignment' },
  { id: 'ac-check', cat: 'AC & electrics', name: 'AC check & regas', mins: 60, price: 249, note: 'Leak test, gas top-up, vent temperature check' },
  { id: 'ac-repair', cat: 'AC & electrics', name: 'AC not cooling: diagnosis', mins: 60, price: 150, note: 'Compressor, condenser, fan and sensor checks' },
  { id: 'battery', cat: 'AC & electrics', name: 'Battery test & replacement', mins: 30, price: 79, note: 'Fitting, battery priced separately' },
  { id: 'electrics', cat: 'AC & electrics', name: 'Electrical fault finding', mins: 60, price: 199, note: 'Warning lights, windows, starter, alternator' },
  { id: 'diag', cat: 'Diagnostics', name: 'Computer diagnostics', mins: 45, price: 150, note: 'OBD scan, every fault code explained before any work' },
  { id: 'inspect', cat: 'Diagnostics', name: 'Pre-purchase inspection', mins: 90, price: 350, note: 'Before you buy a used car: engine, gearbox, body, test drive' },
  { id: 'suspension', cat: 'Diagnostics', name: 'Suspension & steering check', mins: 45, price: 120, note: 'Noises, knocks, pulling to one side' },
  { id: 'rta', cat: 'Diagnostics', name: 'RTA test preparation', mins: 60, price: 199, note: 'Pre-test check and fixes for the annual RTA test' },
]

export const ph = (raw: string) => ({ phone: raw, whatsapp: raw.replace(/\D/g, '') })
const ALL = SERVICES.filter((s) => CATS_BY.nails.includes(s.cat)).map((s) => s.id)

const NAILS: Tenant[] = [
  {
    slug: 'ayas-beauty', name: "Aya's Beauty Studio", short: "Aya's", tag: 'Beauty Studio', area: 'JLT',
    address: 'Lake View Tower, B2, Cluster B, Jumeirah Lakes Towers, Dubai', ...ph('+971 52 128 9922'),
    open: 10, close: 23, hours: 'Daily 10 am – 11 pm', rating: { value: '4.5', count: 137 },
    review: { text: 'One of the best salons in Dubai I have tried. Very polite staff and excellent service.', author: 'Google review' },
    headline: 'Nails done right', lead: 'Gel manicure, pedicure and extensions in JLT. Choose a service and a master, book a time in a minute.',
    masters: [
      { id: 'm1', name: 'Tahmina', role: 'Senior nail master', langs: 'EN · RU' },
      { id: 'm2', name: 'Alina', role: 'Nail master', langs: 'EN · RU' },
      { id: 'm3', name: 'Sara', role: 'Nail & lash master', langs: 'EN · AR' },
    ],
    services: ALL,
  },
  {
    slug: 'nails-and-more', name: 'Nails And More Ladies Salon', short: 'Nails & More', tag: 'Ladies Salon', area: 'Al Barsha',
    address: 'Al Murad Tower, Shop G02, 1 Al Barsha Rd, Al Barsha 1, Dubai', ...ph('+971 58 577 0820'),
    open: 9, close: 21, hours: 'Daily 9 am – 9 pm', rating: { value: '5.0', count: 255 },
    review: { text: 'My nails are very sensitive to friction but here I get them done without any pain or discomfort.', author: 'Google review' },
    headline: 'Nails, brows and more', lead: 'Gel manicure, pedicure, extensions and brow lamination in Al Barsha, next to Mall of the Emirates. Book a master and a time in a minute.',
    masters: [
      { id: 'm1', name: 'Ainura', role: 'Senior nail master', langs: 'EN · RU' },
      { id: 'm2', name: 'Alina', role: 'Nail master', langs: 'EN · RU' },
      { id: 'm3', name: 'Maryna', role: 'Nail & brow master', langs: 'EN · RU · UA' },
    ],
    services: ALL.filter((id) => id !== 'lash-classic' && id !== 'lash-volume'),
  },
  {
    slug: 'only-u', name: 'Only U nail salon', short: 'Only U', tag: 'Nail Salon', area: 'Meydan',
    address: 'Azizi Riviera 20, Al Merkadh, Meydan, Dubai', ...ph('+971 50 126 8080'),
    open: 9, close: 21, hours: 'Daily 9 am – 9 pm', rating: { value: '4.8', count: 99 },
    review: { text: 'One of the nicest and cleanest nail services I’ve experienced in Dubai.', author: 'Google review' },
    headline: 'Clean lines, perfect shine', lead: 'Manicure, pedicure and extensions in Azizi Riviera, Meydan. Pick a service and a free time, the confirmation comes on WhatsApp.',
    masters: [
      { id: 'm1', name: 'Kristina', role: 'Owner, nail master', langs: 'EN · RU' },
      { id: 'm2', name: 'Dilnoza', role: 'Nail master', langs: 'EN · RU' },
      { id: 'm3', name: 'Viktoria', role: 'Pedicure master', langs: 'EN · RU' },
    ],
    services: ['mani-classic', 'mani-gel', 'mani-russian', 'mani-french', 'remove', 'pedi-classic', 'pedi-gel', 'mani-pedi', 'ext-gel', 'ext-fill', 'art'],
  },
  {
    slug: 'nails-by-muskan', name: 'Nails by Muskan Zaveri', short: 'Muskan Zaveri', tag: 'Nail Studio', area: 'Al Fahidi',
    address: 'The 26th Hour, Khalid Bin Al Waleed Rd, Al Souq Al Kabeer, Al Fahidi, Dubai', ...ph('+971 52 188 6998'),
    open: 8, close: 23, hours: 'Daily 8 am – 11:30 pm', rating: { value: '4.9', count: 79 },
    review: { text: 'I am so glad I found Muskan because she can bring any vision and design to life.', author: 'Google review' },
    headline: 'Any design, brought to life', lead: 'Nail art, gelish and extensions by Muskan in Al Fahidi. Open late every day: choose a design and book your time.',
    masters: [
      { id: 'm1', name: 'Muskan', role: 'Nail artist', langs: 'EN · HI' },
    ],
    services: ['mani-classic', 'mani-gel', 'mani-french', 'remove', 'ext-gel', 'ext-fill', 'art', 'lash-classic', 'lash-lift'],
  },
  {
    slug: 'glamour-and-glow', name: 'Glamour And Glow Beauty Salon', short: 'Glamour & Glow', tag: 'Beauty Salon', area: 'Deira',
    address: 'Al Dana Center, Al Maktoum Rd, Al Muraqqabat, Deira, Dubai', ...ph('+971 56 366 5950'),
    open: 11, close: 23, hours: 'Daily 11 am – 11 pm', rating: { value: '4.7', count: 150 },
    review: { text: 'Great salon with reasonable prices! Clean, welcoming atmosphere and an amazing result.', author: 'Google review' },
    headline: 'Glow up in Deira', lead: 'Manicure, pedicure, lashes and brows at Al Dana Center. Choose a service and a master, book a time in a minute.',
    masters: [
      { id: 'm1', name: 'Bishnu', role: 'Nail master', langs: 'EN · HI · NE' },
      { id: 'm2', name: 'Jibana', role: 'Pedicure & nail master', langs: 'EN · NE' },
      { id: 'm3', name: 'Aruj', role: 'Lash & brow master', langs: 'EN · UR' },
    ],
    services: ALL,
  },
]

export const TENANTS: Tenant[] = [...NAILS, ...BARBERS, ...GARAGES]
export const kindOf = (t: Tenant): Kind => t.kind ?? 'nails'
export const kindFromPath = (p: string): Kind => (p.startsWith('/barber/') ? 'barber' : p.startsWith('/garage/') ? 'garage' : 'nails')
export const tenantFromPath = (p: string) => {
  const m = p.match(/^\/(nails|barber|garage)\/([^/]+)/)
  return m ? TENANTS.find((t) => t.slug === m[2] && kindOf(t) === m[1]) : undefined
}
/** words that differ between salons, barbershops and garages */
export const WORDS: Record<Kind, { pro: string; pros: string; what: string; client: string }> = {
  nails: { pro: 'master', pros: 'masters', what: 'nails and beauty', client: 'anna@example.com' },
  barber: { pro: 'barber', pros: 'barbers', what: 'barbershop', client: 'ahmed@example.com' },
  garage: { pro: 'mechanic', pros: 'mechanics', what: 'car service', client: 'ahmed@example.com' },
}
export const catsOf = (t: Tenant): Cat[] => t.cats ?? CATS_BY[t.kind ?? 'nails']
export const isClosed = (t: Tenant, date: string) => !!t.closed?.includes(new Date(date + 'T00:00:00').getDay())
/** opening and closing hour on that date */
export const hoursOn = (t: Tenant, date: string): [number, number] => t.days?.[new Date(date + 'T00:00:00').getDay()] ?? [t.open, t.close]
export const aed = (n: number) => `${Math.round(n).toLocaleString('en-US')} AED`
export const dur = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ''}`)
export const wa = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
export const hhmm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
