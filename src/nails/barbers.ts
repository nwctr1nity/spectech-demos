// Dubai barbershop demos, served at /barber/<slug>/ by the same app as the nail salons.
// Name, phone, address, hours, rating, the quoted review and the barbers' first names come from the
// shop's public Google Maps listing and its reviews. Services and prices are typical examples: replace on sale.
// Only types are imported from data.ts, so the two modules don't depend on each other at load time.
import type { Tenant } from './data'

const ph = (raw: string) => ({ phone: raw, whatsapp: raw.replace(/\D/g, '') })
const CUTS = ['cut-classic', 'cut-fade', 'cut-beard', 'cut-kids', 'head-shave', 'beard-trim', 'hot-towel', 'beard-color', 'hair-color', 'facial', 'hair-spa']

export const BARBERS: Tenant[] = [
  {
    kind: 'barber', slug: 'ramy-gents', name: 'Ramy Gents Salon', short: 'Ramy', tag: 'Gents Salon', area: 'Deira',
    address: '28 Al Rigga Rd, Al Muraqqabat, Deira, Dubai', ...ph('+971 56 357 6066'),
    open: 10, close: 24, hours: 'Daily 10 am – 2 am', rating: { value: '4.9', count: 1076 },
    review: { text: 'He pays incredible attention to detail, understands exactly what you want, and delivers.', author: 'Google review' },
    headline: 'Sharp cuts till 2 am', lead: 'Haircuts, fades, beard and grooming on Al Rigga Road. Pick your barber and a free time, book in a minute.',
    masters: [
      { id: 'm1', name: 'Yahia', role: 'Senior barber', langs: 'EN · AR' },
      { id: 'm2', name: 'James', role: 'Barber', langs: 'EN · TL' },
      { id: 'm3', name: 'Muhammad', role: 'Barber', langs: 'EN · AR · UR' },
    ],
    services: [...CUTS, 'mani-men'],
  },
  {
    kind: 'barber', slug: 'alsharq-gents', name: 'Alsharq Gents Saloon', short: 'Alsharq', tag: 'Gents Saloon', area: 'Port Saeed',
    address: '1B St, Port Saeed, Deira, Dubai', ...ph('+971 54 722 9787'),
    open: 9, close: 24, hours: 'Daily 9 am – 1 am', rating: { value: '4.9', count: 742 },
    review: { text: 'A good barbershop, excellent value for money.', author: 'Google review' },
    headline: 'Cut, shave and unwind', lead: 'Haircut, beard, facial and massage in Port Saeed, Deira. Choose your barber and a free time.',
    masters: [
      { id: 'm1', name: 'Ibrahim', role: 'Senior barber', langs: 'EN · AR' },
      { id: 'm2', name: 'Mukhtar', role: 'Barber', langs: 'EN · AR' },
    ],
    services: CUTS,
  },
  {
    kind: 'barber', slug: 'hair-focus', name: 'Hair Focus Gents Salon', short: 'Hair Focus', tag: 'Gents Salon', area: 'Bur Dubai',
    address: 'Shop 4, Al Ghubaiba RTA Bus Station, opposite City Centre, Al Shindagha, Dubai', ...ph('+971 56 813 2701'),
    open: 10, close: 24, hours: 'Daily 10 am – 12 am', rating: { value: '4.9', count: 736 },
    review: { text: 'Arman did an amazing haircut and beard styling. The service was professional, friendly, and detailed.', author: 'Google review' },
    headline: 'Look sharp in Bur Dubai', lead: 'Haircut, beard styling, perm and colour at Al Ghubaiba bus station. Pick a barber and a free time, no waiting.',
    masters: [
      { id: 'm1', name: 'Arman', role: 'Senior barber', langs: 'EN · HI · UR' },
      { id: 'm2', name: 'Zaheer', role: 'Barber', langs: 'EN · HI · UR' },
      { id: 'm3', name: 'Karan', role: 'Hair stylist', langs: 'EN · HI' },
    ],
    services: CUTS,
  },
  {
    kind: 'barber', slug: 'bhaiber-gents', name: 'Bhaiber Gents Salon', short: 'Bhaiber', tag: 'Gents Salon', area: 'Al Barsha',
    address: 'Arabian Gulf Building, Street 11, Al Barsha 1, Dubai', ...ph('+971 55 691 3050'),
    open: 10, close: 24, hours: 'Daily 10 am – 12 am', rating: { value: '4.9', count: 496 },
    review: { text: 'Clean shop, fair price, and fresh fade. Will definitely be coming back.', author: 'Google review' },
    headline: 'Fresh fade, fair price', lead: 'Haircuts, beard, manicure and pedicure in Al Barsha 1. Choose a barber and book a time in a minute.',
    masters: [
      { id: 'm1', name: 'Awais', role: 'Senior barber', langs: 'EN · UR' },
      { id: 'm2', name: 'Kaif', role: 'Barber', langs: 'EN · HI' },
    ],
    services: [...CUTS, 'mani-men'],
  },
  {
    kind: 'barber', slug: 'philo-gents', name: 'Philo Gents Salon', short: 'Philo', tag: 'Barber Shop', area: 'JVC',
    address: 'Icon Casa 3, Lawns 1, Jumeirah Village Circle, Dubai', ...ph('+971 52 281 8649'),
    open: 9, close: 24, hours: 'Daily 9 am – 1 am', rating: { value: '4.9', count: 283 },
    review: { text: 'I’ve lived in JVC for two years without a regular salon, but Philo Gents Salon changed that.', author: 'Google review' },
    headline: 'Your barber in JVC', lead: 'Haircuts, fades, beard and spa in Lawns 1, JVC. Open late every day: pick a barber and a free time.',
    masters: [
      { id: 'm1', name: 'Khalid', role: 'Senior barber', langs: 'EN · AR' },
      { id: 'm2', name: 'Omar', role: 'Barber', langs: 'EN · AR' },
      { id: 'm3', name: 'Rashid', role: 'Barber', langs: 'EN · UR' },
    ],
    services: CUTS,
  },
]
