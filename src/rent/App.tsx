import { useEffect, useMemo, useState } from 'react'
import { Select } from '../Select'
import { CarArt } from './Car'
import { openCookieSettings, readQuote, saveQuote, trackLead } from './consent'
import { Cookies } from './Cookies'
import { CARS, COVER, DELIVERY, TENANTS, aed, quote, tenantFromPath, wa, type Car, type Tenant } from './data'

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
)

const I = {
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
  tag: 'M3.5 12.5V4.5a1 1 0 0 1 1-1h8l8 8-9 9zM8.5 8.5h.01',
  shield: 'M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6zM8.8 12l2.2 2.2 4.2-4.4',
  truck: 'M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3.2v2.8h-7M6.5 18.5a1.8 1.8 0 1 0 0-.01M17 18.5a1.8 1.8 0 1 0 0-.01',
  doc: 'M6.5 3.5h7l4 4v13h-11zM13.5 3.5v4h4M9 12h6M9 15.5h6',
  car: 'M4 15.5v-3l2-4.5h12l2 4.5v3M3.5 15.5h17v3h-17zM7 18.5v1.5M17 18.5v1.5M4.5 12.5h15',
  key: 'M14.5 4a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11zM10.6 13.4 3.5 20.5M6 18l2 2M8 16l1.5 1.5',
}
const Ico = ({ d }: { d: string }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d={d} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const Head = ({ pill, title, sub }: { pill: string; title: string; sub?: string }) => (
  <div className="head">
    <span className="pill"><i aria-hidden="true" />{pill}</span>
    <h2>{title}</h2>
    {sub && <p className="mut">{sub}</p>}
  </div>
)

function Index() {
  return (
    <main className="index">
      <h1>Demo sites</h1>
      {TENANTS.map((t) => <a key={t.slug} href={`/rent/${t.slug}/`}>{t.name}</a>)}
    </main>
  )
}

function Booking({ t, fleet, carId, setCarId }: { t: Tenant; fleet: Car[]; carId: string; setCarId: (id: string) => void }) {
  const [saved] = useState(readQuote)
  const [days, setDays] = useState(saved?.days ?? 3)
  const [del, setDel] = useState(DELIVERY.some((x) => x.id === saved?.del) ? saved!.del : DELIVERY[1].id)
  const [cov, setCov] = useState(COVER.some((x) => x.id === saved?.cov) ? saved!.cov : COVER[0].id)
  const car = fleet.find((c) => c.id === carId) ?? fleet[0]
  const d = DELIVERY.find((x) => x.id === del)!
  const c = COVER.find((x) => x.id === cov)!
  const q = useMemo(() => quote(car, days, d.fee, c.perDay, t.noDeposit), [car, days, d, c, t.noDeposit])
  useEffect(() => { saveQuote({ car: car.id, days: q.d, del, cov }) }, [car.id, q.d, del, cov])
  const msg = wa(t.whatsapp,
    `Hello! I'd like to rent ${car.name} for ${q.d} day${q.d > 1 ? 's' : ''}.\n${d.label}, ${c.label}.\nPrice on the website: ${aed(q.total)}.`)

  return (
    <div className="book" id="book">
      <div className="book-form">
        <div className="fld">
          <label htmlFor="b-car">Car</label>
          <Select id="b-car" value={car.id} onChange={setCarId}
            options={fleet.map((x) => ({ value: x.id, label: x.name, hint: `${x.cls} · from ${aed(x.day)} a day` }))} />
        </div>
        <div className="fld">
          <span className="lbl" id="b-days-l">Rental period</span>
          <div className="days" role="group" aria-labelledby="b-days-l">
            <button type="button" onClick={() => setDays((v) => Math.max(1, v - 1))} aria-label="One day less">−</button>
            <input type="number" min={1} max={365} inputMode="numeric" value={days} aria-label="Days" onChange={(e) => setDays(Number(e.target.value))} />
            <span className="unit">{q.d === 1 ? 'day' : 'days'}</span>
            <button type="button" onClick={() => setDays((v) => v + 1)} aria-label="One day more">+</button>
          </div>
          <div className="chips">
            {[[1, '1 day'], [7, '1 week'], [30, '1 month']].map(([n, l]) => (
              <button key={n} type="button" aria-pressed={q.d === n} onClick={() => setDays(Number(n))}>{l}</button>
            ))}
          </div>
        </div>
        <div className="row2">
          <div className="fld">
            <label htmlFor="b-del">Delivery</label>
            <Select id="b-del" value={del} onChange={setDel}
              options={DELIVERY.map((x) => ({ value: x.id, label: x.label, hint: x.fee ? `+${aed(x.fee)}` : 'Free' }))} />
          </div>
          <div className="fld">
            <label htmlFor="b-cov">Insurance</label>
            <Select id="b-cov" value={cov} onChange={setCov} options={COVER.map((x) => ({ value: x.id, label: x.label, hint: x.hint }))} />
          </div>
        </div>
      </div>
      <div className="book-sum">
        <div className="pic sum-pic"><CarArt car={car} /></div>
        <p className="mut">{car.cls} · {car.seats} seats · automatic</p>
        <h3>{car.name}</h3>
        <dl>
          <div><dt>{q.d} × {aed(q.perDay)}{q.d >= 30 ? ' (monthly rate)' : q.d >= 7 ? ' (weekly −15%)' : ''}</dt><dd>{aed(q.rent)}</dd></div>
          <div><dt>{c.label}</dt><dd>{q.cover ? aed(q.cover) : 'Included'}</dd></div>
          <div><dt>{d.label}</dt><dd>{q.delivery ? aed(q.delivery) : 'Free'}</dd></div>
          <div><dt>Security deposit, refundable</dt><dd>{q.deposit ? aed(q.deposit) : 'No deposit'}</dd></div>
        </dl>
        <div className="total" aria-live="polite"><span>Total</span><b>{aed(q.total)}</b></div>
        <a className="btn btn-light" href={msg} target="_blank" rel="noopener" onClick={() => trackLead(car.name, q.total)}>Book on WhatsApp <Arrow /></a>
      </div>
    </div>
  )
}

export default function App() {
  const t = tenantFromPath(location.pathname)
  const fleet = useMemo(() => (t ? t.fleet.map((id) => CARS.find((c) => c.id === id)!) : []), [t])
  const [carId, setCarId] = useState(() => { const id = readQuote()?.car; return fleet.some((c) => c.id === id) ? id! : fleet[0]?.id ?? '' })
  const trackers = useMemo(() => ({ ga4: t?.ga4, pixel: t?.pixel }), [t])
  useEffect(() => { if (t) document.title = `${t.name}: car rental in ${t.area}, Dubai` }, [t])
  if (!t) return <Index />

  const hero = ['p911', 'rrsport', 'patrol'].map((id) => fleet.find((c) => c.id === id)).find(Boolean) ?? fleet[0]
  const from = Math.min(...fleet.map((c) => c.day))
  const pick = (id: string) => { setCarId(id); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  const hello = wa(t.whatsapp, 'Hello! I would like to rent a car.')
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.name} ${t.address}`)}`

  return (
    <>
      <div className="demo-bar">Demo website prepared for {t.name}. Fleet and prices are examples.</div>
      <div className="frame">
        <header className="nav">
          <a className="logo" href="#top">{t.short}<span>Rent A Car</span></a>
          <nav aria-label="Sections">
            <a href="#fleet">Fleet</a>
            <a href="#book">Prices</a>
            <a href="#how">How it works</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="btn btn-line" href="#book">Book now</a>
        </header>

        <section className="hero" id="top">
          <p className="eyebrow">{t.area} · Dubai · {t.hours}</p>
          <h1>{t.headline}</h1>
          <p className="lead">{t.lead}</p>
          <a className="connect" href={hello} target="_blank" rel="noopener" onClick={() => trackLead('hero')}>Let’s connect <Arrow /></a>
          <div className="stage" aria-hidden="true">
            <CarArt car={hero} className="hero-car" hero />
          </div>
        </section>
      </div>

      <main className="wrap">
        <ul className="facts">
          <li><span className="ico"><Ico d={I.star} /></span><div><b>{t.rating.value} on Google</b><span>{t.rating.count} reviews</span></div></li>
          <li><span className="ico"><Ico d={I.clock} /></span><div><b>{t.hours.replace('Open ', '')}</b><span>{t.hours.startsWith('Open') ? 'bookings any time' : 'every day'}</span></div></li>
          <li><span className="ico"><Ico d={I.tag} /></span><div><b>From {aed(from)}</b><span>per day, insurance included</span></div></li>
          <li><span className="ico"><Ico d={t.noDeposit ? I.shield : I.truck} /></span><div><b>{t.noDeposit ? 'No deposit' : 'Free advice, fast delivery'}</b><span>{t.noDeposit ? 'nothing frozen on your card' : 'to your hotel or home'}</span></div></li>
        </ul>

        <section className="book-sec" aria-label="Booking">
          <Head pill="Instant quote" title="Get your price" sub="Pick a car and dates. The total is shown upfront, no hidden fees." />
          <Booking t={t} fleet={fleet} carId={carId} setCarId={setCarId} />
        </section>

        <section className="sec" id="fleet">
          <Head pill="Fleet" title="Choose your car" sub="Daily and monthly rates. Insurance included." />
          <div className="grid">
            {fleet.map((c) => (
              <button type="button" className="card" key={c.id} onClick={() => pick(c.id)} aria-label={`${c.name}: get price`}>
                <span className="pic"><CarArt car={c} /></span>
                <span className="mut small">{c.cls} · {c.seats} seats · automatic</span>
                <h3>{c.name}</h3>
                <span className="price"><b>{aed(c.day)}</b> / day</span>
                <span className="mut small">{aed(c.month)} / month</span>
                <span className="more">Get price <Arrow /></span>
              </button>
            ))}
          </div>
        </section>

        <section className="sec" id="how">
          <Head pill="Choose · Send · Drive" title="How it works" sub="From message to keys in about an hour." />
          <ol className="steps">
            <li>
              <h3>Choose a car</h3><p>Pick a car and dates above, or message us and we’ll suggest one.</p>
              <div className="viz viz-list" aria-hidden="true">
                {fleet.slice(0, 4).map((c, i) => <span key={c.id} className={i === 1 ? 'on' : ''}><Ico d={I.car} />{c.name}</span>)}
              </div>
            </li>
            <li>
              <h3>Send documents</h3><p>Passport, visa page and driving licence. Tourists may need an international permit.</p>
              <div className="viz viz-docs" aria-hidden="true">
                {['Passport', 'Visa', 'Licence'].map((d) => <span key={d}><Ico d={I.doc} />{d}</span>)}
              </div>
            </li>
            <li>
              <h3>Get the keys</h3><p>Collect the car in {t.area} or get it delivered to your door.</p>
              <div className="viz viz-chat" aria-hidden="true">
                <span className="bubble">Your car is outside 🔑</span>
                <span className="input">Message us on WhatsApp <i><Arrow /></i></span>
              </div>
            </li>
          </ol>
        </section>

        <figure className="quote">
          <blockquote>“{t.review.text}”</blockquote>
          <figcaption>{t.review.author} · {t.rating.value} ★ from {t.rating.count} reviews</figcaption>
        </figure>

        <section className="sec contact" id="contact">
          <div>
            <p className="eyebrow">{t.hours}</p>
            <a className="big-phone" href={`tel:${t.whatsapp ? '+' + t.whatsapp : t.phone}`}>{t.phone}</a>
            <p className="mut">{t.address}</p>
            <a className="connect" href={map} target="_blank" rel="noopener">Open in Google Maps <Arrow /></a>
          </div>
          <a className="btn btn-light" href={hello} target="_blank" rel="noopener" onClick={() => trackLead('contact')}>Message on WhatsApp <Arrow /></a>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} {t.name}</span>
        <span className="mut">Car rental in {t.area}, Dubai · <button type="button" className="ck-link" onClick={openCookieSettings}>Cookie settings</button></span>
      </footer>
      <Cookies trackers={trackers} />
    </>
  )
}
