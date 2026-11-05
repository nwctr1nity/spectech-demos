// Demo sites for Dubai car-rental companies, served at /rent/<slug>/.
// Name, phone, address, hours, rating and the quoted review come from the company's public Google Maps listing.
// The fleet and prices are typical Dubai examples, NOT the company's real offer: replace on sale.

export type Body = 'coupe' | 'sedan' | 'suv'

export type Car = {
  id: string
  cls: string
  name: string
  body: Body
  /** paint for the drawn car */
  paint: 'silver' | 'white' | 'graphite' | 'black'
  seats: number
  /** AED per day */
  day: number
  /** AED per month (30 days) */
  month: number
  /** AED security deposit */
  deposit: number
}

export type Tenant = {
  slug: string
  name: string
  short: string
  area: string
  address: string
  phone: string
  whatsapp: string
  hours: string
  rating: { value: string; count: number }
  review: { text: string; author: string }
  noDeposit?: boolean
  headline: string
  lead: string
  fleet: string[]
}

export const CARS: Car[] = [
  { id: 'sunny', cls: 'Economy', name: 'Nissan Sunny', body: 'sedan', paint: 'white', seats: 5, day: 89, month: 1499, deposit: 1000 },
  { id: 'corolla', cls: 'Compact', name: 'Toyota Corolla', body: 'sedan', paint: 'silver', seats: 5, day: 119, month: 1999, deposit: 1000 },
  { id: 'camry', cls: 'Mid-size', name: 'Toyota Camry', body: 'sedan', paint: 'graphite', seats: 5, day: 169, month: 2799, deposit: 1500 },
  { id: 'patrol', cls: 'SUV', name: 'Nissan Patrol', body: 'suv', paint: 'white', seats: 7, day: 399, month: 6999, deposit: 2500 },
  { id: 'eclass', cls: 'Luxury', name: 'Mercedes-Benz E-Class', body: 'sedan', paint: 'black', seats: 5, day: 449, month: 7999, deposit: 3000 },
  { id: 'rrsport', cls: 'Luxury SUV', name: 'Range Rover Sport', body: 'suv', paint: 'silver', seats: 5, day: 899, month: 15999, deposit: 5000 },
  { id: 'p911', cls: 'Sports', name: 'Porsche 911 Carrera', body: 'coupe', paint: 'silver', seats: 4, day: 1499, month: 27999, deposit: 5000 },
]

export const DELIVERY = [
  { id: 'office', label: 'Pick up at our office', fee: 0 },
  { id: 'dubai', label: 'Delivery anywhere in Dubai', fee: 50 },
  { id: 'dxb', label: 'Dubai Airport (DXB)', fee: 100 },
]

export const COVER = [
  { id: 'basic', label: 'Basic insurance', perDay: 0, hint: 'Included in the price' },
  { id: 'full', label: 'Full insurance', perDay: 40, hint: 'Zero excess, +40 AED a day' },
]

const ph = (raw: string) => ({ phone: raw, whatsapp: raw.replace(/\D/g, '') })

export const TENANTS: Tenant[] = [
  {
    slug: 'hys', name: 'Hys Rent A Car', short: 'Hys', area: 'Deira', address: '54 26B St, Port Saeed, Deira, Dubai', ...ph('+971 52 911 1666'),
    hours: 'Open 24/7', rating: { value: '4.9', count: 221 },
    review: { text: 'Great service and very competitive pricing.', author: 'Google review' },
    headline: 'Rent a car in Dubai', lead: 'Clean, well-kept cars delivered to your door, day or night. Pick a car and dates, see the price instantly.',
    fleet: ['sunny', 'corolla', 'camry', 'patrol', 'eclass', 'rrsport'],
  },
  {
    slug: 'imperial', name: 'Imperial Rent A Car', short: 'Imperial', area: 'Deira', address: 'Omar Bin Al Khattab St, Deira, Dubai', ...ph('+971 50 501 1461'),
    hours: 'Open 24/7', rating: { value: '4.9', count: 155 },
    review: { text: 'The service was smooth, professional, and hassle-free from start to finish.', author: 'Google review' },
    headline: 'Drive Dubai in style', lead: 'From everyday sedans to luxury SUVs. Transparent prices, 24/7 support, delivery across the city.',
    fleet: ['corolla', 'camry', 'patrol', 'eclass', 'rrsport', 'p911'],
  },
  {
    slug: 'jvc', name: 'JVC Rent A Car', short: 'JVC', area: 'Jumeirah Village Circle', address: 'Milano by Giovanni Boutique, Al Barsha South Fourth, JVC, Dubai', ...ph('+971 56 200 4141'),
    hours: 'Daily 8 am – 10 pm', rating: { value: '4.7', count: 127 }, noDeposit: true,
    review: { text: 'Good car, comfortable to drive, and easy to handle.', author: 'Google review' },
    headline: 'No deposit car rental', lead: 'Rent a car in JVC without freezing money on your card. Choose a car and dates, the total is shown upfront.',
    fleet: ['sunny', 'corolla', 'camry', 'patrol', 'eclass'],
  },
  {
    slug: 'rent-ride', name: 'Rent & Ride Car Rental', short: 'Rent & Ride', area: 'Jumeirah Village Triangle', address: 'Al Barsha South Fifth, JVT, Dubai', ...ph('+971 56 414 1472'),
    hours: 'Open 24/7', rating: { value: '4.7', count: 112 },
    review: { text: 'Highly professional, very client oriented service!', author: 'Google review' },
    headline: 'Your car, delivered', lead: 'Daily, weekly and monthly rentals with free advice on the right car. Book in a minute on WhatsApp.',
    fleet: ['sunny', 'corolla', 'camry', 'patrol', 'rrsport', 'p911'],
  },
  {
    slug: 'alasad', name: 'Alasad Rent A Car', short: 'Alasad', area: 'Deira', address: 'Al Khabaisi, Deira, Dubai', ...ph('+971 55 454 5401'),
    hours: 'Open 24/7', rating: { value: '4.3', count: 106 },
    review: { text: 'Great car collection with good prices and great customer service.', author: 'Google review' },
    headline: 'Cars for every trip', lead: 'Economy to luxury, by the day or by the month. See your price before you call.',
    fleet: ['sunny', 'corolla', 'camry', 'patrol', 'eclass', 'rrsport'],
  },
]

export const tenantFromPath = (p: string) => {
  const m = p.match(/\/rent\/([^/]+)/)
  return m ? TENANTS.find((t) => t.slug === m[1]) : undefined
}

export const aed = (n: number) => `${Math.round(n).toLocaleString('en-US')} AED`

/** Daily rate for 1–6 days, 15 % off from 7 days, monthly rate pro rata from 30 days. */
export function quote(car: Car, days: number, deliveryFee: number, coverPerDay: number, noDeposit = false) {
  const d = Math.max(1, Math.round(days || 1))
  const perDay = d >= 30 ? car.month / 30 : d >= 7 ? car.day * 0.85 : car.day
  const rent = perDay * d
  const cover = coverPerDay * d
  return { d, perDay, rent, cover, delivery: deliveryFee, total: rent + cover + deliveryFee, deposit: noDeposit ? 0 : car.deposit }
}

export const wa = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
