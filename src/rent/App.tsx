import { useEffect, useMemo, useState } from 'react'
import { Select } from '../Select'
import { CarArt } from './Car'
import { CARS, COVER, DELIVERY, TENANTS, aed, quote, tenantFromPath, wa, type Car, type Tenant } from './data'

const Arrow = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12 12 4M5.5 4H12v6.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
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
  const [days, setDays] = useState(3)
  const [del, setDel] = useState(DELIVERY[1].id)
  const [cov, setCov] = useState(COVER[0].id)
  const car = fleet.find((c) => c.id === carId) ?? fleet[0]
  const d = DELIVERY.find((x) => x.id === del)!
  const c = COVER.find((x) => x.id === cov)!
  const q = useMemo(() => quote(car, days, d.fee, c.perDay, t.noDeposit), [car, days, d, c, t.noDeposit])
  const msg = wa(t.whatsapp,
    `Hello! I'd like to rent ${car.name} for ${q.d} day${q.d > 1 ? 's' : ''}.\n${d.label}, ${c.label}.\nPrice on the website: ${aed(q.total)}.`)

  return (
    <section className="book" id="book" aria-label="Booking">
      <div className="book-form">
        <h2>Get your price</h2>
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
        <CarArt car={car} className="sum-car" />
        <p className="mut">{car.cls} · {car.seats} seats · automatic</p>
        <h3>{car.name}</h3>
        <dl>
          <div><dt>{q.d} × {aed(q.perDay)}{q.d >= 30 ? ' (monthly rate)' : q.d >= 7 ? ' (weekly −15%)' : ''}</dt><dd>{aed(q.rent)}</dd></div>
          <div><dt>{c.label}</dt><dd>{q.cover ? aed(q.cover) : 'Included'}</dd></div>
          <div><dt>{d.label}</dt><dd>{q.delivery ? aed(q.delivery) : 'Free'}</dd></div>
          <div><dt>Security deposit, refundable</dt><dd>{q.deposit ? aed(q.deposit) : 'No deposit'}</dd></div>
        </dl>
        <div className="total" aria-live="polite"><span>Total</span><b>{aed(q.total)}</b></div>
        <a className="btn btn-light" href={msg} target="_blank" rel="noopener">Book on WhatsApp <Arrow /></a>
      </div>
    </section>
  )
}

export default function App() {
  const t = tenantFromPath(location.pathname)
  const fleet = useMemo(() => (t ? t.fleet.map((id) => CARS.find((c) => c.id === id)!) : []), [t])
  const [carId, setCarId] = useState(fleet[0]?.id ?? '')
  useEffect(() => { if (t) document.title = `${t.name}: car rental in ${t.area}, Dubai` }, [t])
  if (!t) return <Index />

  const hero = [...fleet].sort((a, b) => b.day - a.day)[0]
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
          <a className="connect" href={hello} target="_blank" rel="noopener">Let’s connect <Arrow /></a>
          <div className="stage" aria-hidden="true">
            <CarArt car={hero} className="hero-car" />
            <CarArt car={hero} className="hero-car reflect" />
            <div className="floor" />
          </div>
        </section>
      </div>

      <main className="wrap">
        <ul className="facts">
          <li><b>{t.rating.value} ★</b><span>{t.rating.count} Google reviews</span></li>
          <li><b>{t.hours.replace('Open ', '')}</b><span>{t.hours.startsWith('Open') ? 'bookings any time' : 'every day'}</span></li>
          <li><b>{aed(from)}</b><span>per day, from</span></li>
          <li><b>{t.noDeposit ? 'No deposit' : 'Delivery'}</b><span>{t.noDeposit ? 'nothing frozen on your card' : 'to your hotel or home'}</span></li>
        </ul>

        <Booking t={t} fleet={fleet} carId={carId} setCarId={setCarId} />

        <section className="sec" id="fleet">
          <div className="head"><h2>Fleet</h2><p className="mut">Daily and monthly rates. Insurance included.</p></div>
          <div className="grid">
            {fleet.map((c) => (
              <button type="button" className="card" key={c.id} onClick={() => pick(c.id)} aria-label={`${c.name}: get price`}>
                <CarArt car={c} className="card-car" />
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
          <div className="head"><h2>How it works</h2></div>
          <ol className="steps">
            <li><h3>Choose a car</h3><p>Pick a car and dates above, or message us and we’ll suggest one.</p></li>
            <li><h3>Send documents</h3><p>Passport, visa page and driving licence. Tourists may need an international driving permit.</p></li>
            <li><h3>Get the keys</h3><p>Collect the car at our office in {t.area} or get it delivered to your door.</p></li>
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
          <a className="btn btn-light" href={hello} target="_blank" rel="noopener">Message on WhatsApp <Arrow /></a>
        </section>
      </main>

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} {t.name}</span>
        <span className="mut">Car rental in {t.area}, Dubai</span>
      </footer>
    </>
  )
}
