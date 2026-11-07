import { useEffect, useMemo, useState } from 'react'
import { Select } from '../Select'
import { CarArt } from './Car'
import { openCookieSettings, readQuote, saveQuote, trackLead } from './consent'
import { Cookies } from './Cookies'
import { Account, Admin, Auth, PENDING } from './Cabinet'
import { initStore, liveFleet, me, today, useDb, type Request } from './store'
import { Arrow, Head, I, Ico } from './ui'
import { COVER, DELIVERY, TENANTS, aed, quote, tenantFromPath, wa, type Car, type Tenant } from './data'

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
  const [start, setStart] = useState(() => (saved?.start && saved.start >= today() ? saved.start : today()))
  const car = fleet.find((c) => c.id === carId) ?? fleet[0]
  const d = DELIVERY.find((x) => x.id === del)!
  const c = COVER.find((x) => x.id === cov)!
  const q = useMemo(() => quote(car, days, d.fee, c.perDay, t.noDeposit), [car, days, d, c, t.noDeposit])
  useEffect(() => { saveQuote({ car: car.id, days: q.d, del, cov, start }) }, [car.id, q.d, del, cov, start])
  const request = () => {
    const r: Omit<Request, 'id' | 'no' | 'userId' | 'status' | 'created'> = {
      carId: car.id, carName: car.name, start, days: q.d, delivery: d.label, cover: c.label, total: Math.round(q.total), deposit: q.deposit,
    }
    try { sessionStorage.setItem(PENDING, JSON.stringify(r)) } catch { /* ignore */ }
    trackLead(car.name, q.total)
    location.hash = me() ? '#/account' : '#/login'
  }
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
          <label htmlFor="b-start">Pick-up date</label>
          <input id="b-start" className="field" type="date" min={today()} value={start} onChange={(e) => e.target.value && setStart(e.target.value)} />
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
        <button type="button" className="btn btn-light" onClick={request}>Request booking <Arrow /></button>
        <a className="btn btn-line wide" href={msg} target="_blank" rel="noopener" onClick={() => trackLead(car.name, q.total)}>Ask on WhatsApp</a>
      </div>
    </div>
  )
}

export default function App() {
  const t = tenantFromPath(location.pathname)
  const db = useDb()
  const [route, setRoute] = useState(location.hash)
  useEffect(() => { if (t) void initStore(t) }, [t])
  useEffect(() => {
    const on = () => { setRoute(location.hash); if (location.hash.startsWith('#/')) scrollTo(0, 0) }
    addEventListener('hashchange', on); return () => removeEventListener('hashchange', on)
  }, [])
  const fleet = useMemo(() => (t ? liveFleet(t, db) : []), [t, db])
  const [chosen, setCarId] = useState(() => readQuote()?.car ?? '')
  const carId = fleet.some((c) => c.id === chosen) ? chosen : fleet[0]?.id ?? ''
  const trackers = useMemo(() => ({ ga4: t?.ga4, pixel: t?.pixel }), [t])
  useEffect(() => { if (t) document.title = `${t.name}: car rental in ${t.area}, Dubai` }, [t])
  if (!t) return <Index />
  if (!db) return <div className="loading" aria-busy="true" />
  const user = me(db)
  const view = route.startsWith('#/') ? route.slice(2).split('?')[0] : ''

  const hero = ['p911', 'rrsport', 'patrol'].map((id) => fleet.find((c) => c.id === id)).find(Boolean) ?? fleet[0] ?? { id: 'p911', name: t.name }
  const from = fleet.length ? Math.min(...fleet.map((c) => c.day)) : 0
  const pick = (id: string) => { setCarId(id); document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' }) }
  const hello = wa(t.whatsapp, 'Hello! I would like to rent a car.')
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.name} ${t.address}`)}`

  return (
    <>
      <div className="demo-bar">Demo website prepared for {t.name}. Fleet and prices are examples.</div>
      <div className="frame">
        <header className="nav">
          <a className="logo" href="#top" onClick={() => { if (view) location.hash = '' }}>{t.short}<span>Rent A Car</span></a>
          <nav aria-label="Sections">
            <a href="#fleet">Fleet</a>
            <a href="#book">Prices</a>
            <a href="#how">How it works</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="nav-acc" href={user ? (user.role === 'owner' ? '#/admin' : '#/account') : '#/login'}>
            <Ico d={I.user} />{user ? (user.role === 'owner' ? 'Admin' : user.name.split(' ')[0]) : 'Sign in'}
          </a>
          <a className="btn btn-line" href="#book">Book now</a>
        </header>

        {view ? null : <section className="hero" id="top">
          <p className="eyebrow">{t.area} · Dubai · {t.hours}</p>
          <h1>{t.headline}</h1>
          <p className="lead">{t.lead}</p>
          <a className="connect" href={hello} target="_blank" rel="noopener" onClick={() => trackLead('hero')}>Let’s connect <Arrow /></a>
          <div className="stage" aria-hidden="true">
            <CarArt car={hero} className="hero-car" hero />
          </div>
        </section>}
      </div>

      {view === 'login' && <Auth t={t} />}
      {view === 'account' && <Account t={t} db={db} />}
      {view === 'admin' && <Admin t={t} db={db} />}
      {!view && <>

      <main className="wrap">
        <ul className="facts">
          <li><span className="ico"><Ico d={I.star} /></span><div><b>{t.rating.value} on Google</b><span>{t.rating.count} reviews</span></div></li>
          <li><span className="ico"><Ico d={I.clock} /></span><div><b>{t.hours.replace('Open ', '')}</b><span>{t.hours.startsWith('Open') ? 'bookings any time' : 'every day'}</span></div></li>
          <li><span className="ico"><Ico d={I.tag} /></span><div><b>From {aed(from)}</b><span>per day, insurance included</span></div></li>
          <li><span className="ico"><Ico d={t.noDeposit ? I.shield : I.truck} /></span><div><b>{t.noDeposit ? 'No deposit' : 'Free advice, fast delivery'}</b><span>{t.noDeposit ? 'nothing frozen on your card' : 'to your hotel or home'}</span></div></li>
        </ul>

        <section className="book-sec" aria-label="Booking">
          <Head pill="Instant quote" title="Get your price" sub="Pick a car and dates. The total is shown upfront, no hidden fees." />
          {fleet.length > 0 && <Booking t={t} fleet={fleet} carId={carId} setCarId={setCarId} />}
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
      </>}

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} {t.name}</span>
        <span className="mut">Car rental in {t.area}, Dubai · <button type="button" className="ck-link" onClick={openCookieSettings}>Cookie settings</button></span>
      </footer>
      <Cookies trackers={trackers} />
    </>
  )
}
