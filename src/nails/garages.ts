// Dubai car garage demos, served at /garage/<slug>/ by the same app as the salons and barbershops.
// Name, phone, address, hours, rating and the quoted review come from the garage's public Google Maps listing;
// mechanics' first names come from its reviews where they are mentioned. Services and prices are typical
// examples: replace on sale. Only types are imported from data.ts, so the modules don't depend on each other at load time.
import type { Tenant } from './data'

const ph = (raw: string) => ({ phone: raw, whatsapp: raw.replace(/\D/g, '') })
const ALL = ['oil-basic', 'oil-full', 'minor', 'major', 'brake-front', 'brake-disc', 'tyre-fit', 'align', 'ac-check', 'ac-repair', 'battery', 'electrics', 'diag', 'inspect', 'suspension', 'rta']

export const GARAGES: Tenant[] = [
  {
    kind: 'garage', slug: 'pinoy-auto', name: 'Pinoy Auto Garage Dubai', short: 'Pinoy Auto', tag: 'Garage', area: 'Ras Al Khor',
    address: 'Ras Al Khor Industrial Area 2, Dubai', ...ph('+971 50 100 3532'),
    open: 10, close: 20, hours: 'Sat–Thu 10 am – 8 pm', closed: [5], rating: { value: '4.9', count: 382 },
    review: { text: 'I truly trust this shop to do honest work at a reasonable price.', author: 'Google review' },
    headline: 'Honest work, fair price', lead: 'Service, repairs and AC in Ras Al Khor Industrial 2. Book a time online, see every part on WhatsApp before we change it.',
    masters: [
      { id: 'm1', name: 'Mark', role: 'Owner, lead mechanic', langs: 'EN · TL' },
      { id: 'm2', name: 'Shwan', role: 'Senior mechanic', langs: 'EN · TL' },
      { id: 'm3', name: 'Jun', role: 'AC & electrics', langs: 'EN · TL' },
    ],
    services: ALL,
  },
  {
    kind: 'garage', slug: 'abdur-rehman-auto', name: 'Abdur Rehman Auto AC Electrical & Mechanical Repairing Garage', short: 'Abdur Rehman', tag: 'Auto AC & Repair', area: 'Al Quoz',
    address: '24B Street, Al Quoz Industrial Area 1, Dubai', ...ph('+971 56 725 3107'),
    cats: ['AC & electrics', 'Service & oil', 'Brakes & tyres', 'Diagnostics'],
    open: 9, close: 22, days: { 5: [9, 20] }, hours: 'Daily 9 am – 10 pm', hoursSub: 'Friday till 8 pm', rating: { value: '4.9', count: 329 },
    review: { text: 'They first provided a fair and reasonable quotation without any unnecessary upselling.', author: 'Google review' },
    headline: 'Cold AC, fair quote', lead: 'Car AC, electrics and mechanical repairs in Al Quoz 1. Choose a service and a free time, the confirmation comes on WhatsApp.',
    masters: [
      { id: 'm1', name: 'Abdur Rehman', role: 'Owner, AC specialist', langs: 'EN · UR · HI' },
      { id: 'm2', name: 'Muneer', role: 'Mechanic', langs: 'EN · UR · ML' },
      { id: 'm3', name: 'Bilal', role: 'Auto electrician', langs: 'EN · UR' },
    ],
    services: ALL,
  },
  {
    kind: 'garage', slug: 'cars-arabia', name: 'Cars Arabia', short: 'Cars Arabia', tag: 'Auto Repair', area: 'Al Qusais',
    address: '6 15th St, Al Qusais Industrial Area 1, Dubai', ...ph('+971 54 355 9393'),
    open: 9, close: 20, hours: 'Sat–Thu 9 am – 8 pm', closed: [5], rating: { value: '4.6', count: 209 },
    review: { text: 'I used to trust only the official service centre, but now this is my go-to garage.', author: 'Google review' },
    headline: 'Dealer quality, garage price', lead: 'Servicing, diagnostics and repairs in Al Qusais Industrial 1. Pick a service and a free time, we confirm on WhatsApp.',
    masters: [
      { id: 'm1', name: 'Noor', role: 'Service advisor', langs: 'EN · AR · UR' },
      { id: 'm2', name: 'Sameer', role: 'Lead mechanic', langs: 'EN · UR · HI' },
      { id: 'm3', name: 'Ali', role: 'Mechanic', langs: 'EN · AR' },
    ],
    services: ALL,
  },
  {
    kind: 'garage', slug: 'amjad-farooq', name: 'Amjad and Farooq Auto Electrical and AC Repair', short: 'Amjad & Farooq', tag: 'Auto AC & Electrics', area: 'Hor Al Anz',
    address: '34A St, Hor Al Anz, Deira, Dubai', ...ph('+971 50 677 1756'),
    cats: ['AC & electrics', 'Diagnostics', 'Service & oil', 'Brakes & tyres'],
    open: 8, close: 22, days: { 5: [15.5, 22] }, hours: 'Daily 8 am – 10 pm', hoursSub: 'Friday from 3:30 pm', rating: { value: '4.8', count: 111 },
    review: { text: 'My car AC was blowing hot air and they fixed it same day.', author: 'Google review' },
    headline: 'No more hot air', lead: 'Car AC and auto electrics in Hor Al Anz, Deira. Book a check online, most AC jobs are ready the same day.',
    masters: [
      { id: 'm1', name: 'Farooq', role: 'AC specialist', langs: 'EN · UR · HI' },
      { id: 'm2', name: 'Amjad', role: 'Auto electrician', langs: 'EN · UR · HI' },
    ],
    services: ['ac-check', 'ac-repair', 'battery', 'electrics', 'diag', 'oil-basic', 'brake-front', 'suspension'],
  },
  {
    kind: 'garage', slug: 'broadway-auto-care', name: 'Broadway Auto Care Garage', short: 'Broadway', tag: 'Auto Care', area: 'Al Khabaisi',
    address: '13B St, Al Khabaisi, Deira, Dubai', ...ph('+971 50 360 3594'),
    open: 9, close: 20, hours: 'Sat–Thu 9 am – 8 pm', closed: [5], rating: { value: '5.0', count: 39 },
    review: { text: 'They took the time to explain the issues with my vehicle and provided me with a detailed estimate before proceeding with any repairs.', author: 'Google review' },
    headline: 'Clear quote, then repair', lead: 'Servicing, brakes, AC and alignment in Al Khabaisi, Deira. Choose a service and a free time, the confirmation comes on WhatsApp.',
    masters: [
      { id: 'm1', name: 'Mark', role: 'Service advisor', langs: 'EN · TL' },
      { id: 'm2', name: 'Awais', role: 'Lead mechanic', langs: 'EN · UR' },
    ],
    services: ALL,
  },
]
