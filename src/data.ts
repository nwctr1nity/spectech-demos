// Demo sites for Astana equipment-rental firms. One build serves every tenant at /s/<slug>/.
// Contacts, address, hours, rating and payments come from the firm's public 2GIS card.
// Machine prices are typical Astana "from" rates, NOT the firm's price list: replace on sale.

export type Photo = 'lift' | 'crane' | 'excavator' | 'loader' | 'dump'

export type Machine = {
  id: string
  cat: string
  name: string
  spec: string
  use: string
  /** ₸ per hour */
  rate: number
  /** minimum paid hours per order */
  minHours: number
  photo: Photo
}

export type Zone = { id: string; name: string; extra: number }

export type Tenant = {
  slug: string
  /** logo: bold part + light part */
  logo: [string, string]
  name: string
  eyebrow: string
  h1: string
  lead: string
  hero: Photo
  hours: string
  address: string
  phones: { display: string; tel: string }[]
  whatsapp: string
  instagram?: string
  rating?: { value: string; count: number }
  payments: string
  machines: Machine[]
  /** extra service line shown under the catalog (e.g. sand delivery) */
  extra?: string
}

export const ZONES: Zone[] = [
  { id: 'city', name: 'Астана, в черте города', extra: 0 },
  { id: 'sub', name: 'Пригород до 20 км', extra: 10000 },
  { id: 'reg', name: 'Область до 60 км', extra: 25000 },
]

const LIFT18: Machine = { id: 'lift18', cat: 'Автовышка', name: 'Автовышка 18 м', spec: 'Телескоп, люлька до 200 кг', use: 'Вывески, освещение, мойка окон', rate: 12000, minHours: 2, photo: 'lift' }
const LIFT22: Machine = { id: 'lift22', cat: 'Автовышка', name: 'Автовышка 22 м', spec: 'Телескоп, люлька до 250 кг', use: 'Фасады, деревья, кровля', rate: 15000, minHours: 2, photo: 'lift' }
const LIFT28: Machine = { id: 'lift28', cat: 'Автовышка', name: 'Автовышка 28 м', spec: 'Телескоп, люлька до 300 кг', use: 'Высотные работы, монтаж', rate: 20000, minHours: 3, photo: 'lift' }
const CRANE5: Machine = { id: 'crane5', cat: 'Манипулятор', name: 'Манипулятор 5 т', spec: 'Борт 6 м, стрела 3 т', use: 'Блоки, поддоны, контейнеры', rate: 13000, minHours: 2, photo: 'crane' }
const EXC: Machine = { id: 'exc', cat: 'Экскаватор', name: 'Экскаватор гусеничный', spec: 'Ковш 1 м³, 20 т', use: 'Котлованы, траншеи, планировка', rate: 20000, minHours: 4, photo: 'excavator' }
const LOADER: Machine = { id: 'loader', cat: 'Мини-погрузчик', name: 'Мини-погрузчик', spec: 'Ковш 0,4 м³, щётка, вилы', use: 'Уборка снега, планировка, погрузка', rate: 10000, minHours: 2, photo: 'loader' }
const DUMP: Machine = { id: 'dump', cat: 'Самосвал', name: 'Самосвал 25 т', spec: 'Кузов 15 м³', use: 'Вывоз грунта, снега, мусора', rate: 15000, minHours: 3, photo: 'dump' }

const wa = (n: string) => n.replace(/\D/g, '')
const ph = (tel: string) => {
  const d = tel.replace(/\D/g, '')
  return { tel: '+' + d, display: `+7 (${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9, 11)}` }
}

export const TENANTS: Tenant[] = [
  {
    slug: 'dida',
    logo: ['Dida', 'company'],
    name: 'Dida company',
    eyebrow: 'Центр строительного оборудования · Астана',
    h1: 'Техника и оборудование для стройки в аренду',
    lead: 'Автовышки, манипуляторы и мини-погрузчики с оператором. Выберите технику и время: калькулятор сразу покажет стоимость.',
    hero: 'lift',
    hours: 'пн–пт 9:00–18:00',
    address: 'проспект Акжол, 50',
    phones: [ph('+77753350937')],
    whatsapp: wa('77753350937'),
    rating: { value: '5,0', count: 22 },
    payments: 'наличные, карта, QR, безнал',
    machines: [LIFT18, LIFT22, CRANE5, LOADER],
  },
  {
    slug: 'avtovyshka-akmeshit',
    logo: ['Аренда', 'автовышки'],
    name: 'Аренда автовышки',
    eyebrow: 'Автовышки · Астана · круглосуточно',
    h1: 'Автовышка с оператором в любую точку Астаны',
    lead: 'Подъём от 18 до 28 метров для фасадов, вывесок, освещения и деревьев. Работаем 24/7, считайте стоимость прямо на сайте.',
    hero: 'lift',
    hours: 'круглосуточно',
    address: 'улица Акмешит, 7/2',
    phones: [ph('+77058882997'), ph('+77779959991')],
    whatsapp: wa('77058882997'),
    rating: { value: '5,0', count: 19 },
    payments: 'наличные, карта, безнал',
    machines: [LIFT18, LIFT22, LIFT28],
  },
  {
    slug: 'avtovyshki-isaev',
    logo: ['Автовышки', 'ИП Исаев'],
    name: 'Аренда автовышек, ИП Исаев',
    eyebrow: 'Аренда автовышек · Астана · 24/7',
    h1: 'Автовышки 18–28 м с опытным оператором',
    lead: 'Монтаж вывесок, ремонт фасадов, обрезка деревьев и освещение. Выезд круглосуточно, оплата наличными, картой или по QR.',
    hero: 'lift',
    hours: 'круглосуточно',
    address: 'проспект Кабанбай батыр, 40',
    phones: [ph('+77765534704')],
    whatsapp: wa('77765534704'),
    rating: { value: '5,0', count: 18 },
    payments: 'наличные, карта, QR, безнал',
    machines: [LIFT18, LIFT22, LIFT28],
  },
  {
    slug: 'bm-trans',
    logo: ['БМ Транс', 'Астана'],
    name: 'БМ Транс Астана',
    eyebrow: 'Аренда спецтехники · Астана',
    h1: 'Манипуляторы и спецтехника с водителем с 7:00 до 22:00',
    lead: 'Перевезём блоки и поддоны, выроем траншею, вывезем грунт. Выберите технику и часы: стоимость видна сразу.',
    hero: 'crane',
    hours: 'ежедневно 7:00–22:00',
    address: 'улица Булбул, 14',
    phones: [ph('+77012538182')],
    whatsapp: wa('77012538182'),
    rating: { value: '4,8', count: 13 },
    payments: 'наличные, карта',
    machines: [CRANE5, EXC, DUMP, LOADER],
  },
  {
    slug: 'general-profit',
    logo: ['General', 'Profit'],
    name: 'General Profit',
    eyebrow: 'Спецтехника · песок и щебень · вывоз снега',
    h1: 'Уберём и вывезем снег, привезём песок и щебень',
    lead: 'Мини-погрузчики, самосвалы и экскаваторы с оператором для дворов, парковок и строек. Посчитайте заказ онлайн.',
    hero: 'loader',
    hours: 'ежедневно 9:00–20:00',
    address: 'улица Сыганак, 54а',
    phones: [ph('+77066907000'), ph('+77019222633'), ph('+77783506757')],
    whatsapp: wa('77066907000'),
    instagram: 'https://instagram.com/qazinertexpert',
    rating: { value: '5,0', count: 4 },
    payments: 'наличные, карта, безнал, опт',
    machines: [LOADER, DUMP, EXC],
    extra: 'Также поставляем песок и щебень с доставкой самосвалом: напишите объём и адрес.',
  },
]

export function tenantFromPath(path: string): Tenant | undefined {
  const m = path.match(/\/s\/([^/]+)/)
  return m ? TENANTS.find((t) => t.slug === m[1]) : undefined
}

export const fmt = (n: number) => Math.round(n).toLocaleString('ru-RU') + ' ₸'
export const fmtN = (n: number) => Math.round(n).toLocaleString('ru-RU')

export function quote(m: Machine, hours: number, z: Zone) {
  const paid = Math.max(m.minHours, Math.ceil(hours))
  const work = paid * m.rate
  return { paid, work, delivery: z.extra, total: work + z.extra }
}

export const waLink = (phone: string, text: string) => `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
