import { useEffect, useMemo, useState } from 'react'
import { Select } from '../Select'
import { openCookieSettings, trackLead } from '../rent/consent'
import { Cookies } from '../rent/Cookies'
import { Arrow, Head, I, Ico } from '../rent/ui'
import { Account, Admin, Auth, PENDING } from './Cabinet'
import { TENANTS, WORDS, catsOf, aed, dur, hhmm, isClosed, kindFromPath, kindOf, tenantFromPath, wa, type Tenant } from './data'
import { addDays, fmtDay, freeSlots, initStore, livePrices, me, today, useDb, type Appt, type DbT } from './store'

function Index() {
  return (
    <main className="index">
      <h1>Demo sites</h1>
      {TENANTS.filter((t) => kindOf(t) === kindFromPath(location.pathname)).map((t) => <a key={t.slug} href={`/${kindOf(t)}/${t.slug}/`}>{t.name}</a>)}
    </main>
  )
}

function Booking({ t, db, pick, setPick, master, setMaster }: {
  t: Tenant; db: DbT; pick: string[]; setPick: (v: string[]) => void; master: string; setMaster: (v: string) => void
}) {
  const menu = livePrices(t, db).filter((s) => s.available)
  const CATS = catsOf(t)
  const pro = WORDS[kindOf(t)].pro
  const Pro = pro[0].toUpperCase() + pro.slice(1)
  const garage = kindOf(t) === 'garage'
  const n0 = garage ? 1 : 0 // garages ask for the car first, so the other steps move down by one
  const [car, setCar] = useState('')
  const [cat, setCat] = useState(CATS[0])
  const days = useMemo(() => Array.from({ length: 16 }, (_, i) => addDays(today(), i)).filter((d) => !isClosed(t, d)).slice(0, 14), [t])
  const [date, setDate] = useState(days[0])
  const [time, setTime] = useState<number | null>(null)
  const chosen = menu.filter((s) => pick.includes(s.id))
  const mins = chosen.reduce((a, s) => a + s.mins, 0)
  const price = chosen.reduce((a, s) => a + s.price, 0)
  const slots = useMemo(() => (mins ? freeSlots(t, db, date, master as 'any', mins) : []), [t, db, date, master, mins])
  useEffect(() => { if (time !== null && !slots.some((s) => s.start === time)) setTime(null) }, [slots, time])
  const slot = slots.find((s) => s.start === time)
  const who = t.masters.find((m) => m.id === (slot?.master ?? master))
  const toggle = (id: string) => setPick(pick.includes(id) ? pick.filter((x) => x !== id) : [...pick, id])
  const ready = !!slot && (!garage || car.trim().length > 1)
  const msg = wa(t.whatsapp, chosen.length
    ? `Hello! I'd like to book ${chosen.map((s) => s.name).join(' + ')}${car.trim() ? ` for my ${car.trim()}` : ''}${slot ? ` on ${fmtDay(date)} at ${hhmm(slot.start)}` : ''}${who && master !== 'any' ? ` with ${who.name}` : ''}.`
    : 'Hello! I would like to book an appointment.')

  const book = () => {
    if (!slot || !ready) return
    const a: Omit<Appt, 'id' | 'no' | 'userId' | 'status' | 'created'> = {
      services: chosen.map((s) => s.id), title: chosen.map((s) => s.name).join(' + '), masterId: slot.master, date, start: slot.start, mins, price,
      ...(garage ? { car: car.trim() } : {}),
    }
    try { sessionStorage.setItem(PENDING, JSON.stringify(a)) } catch { /* ignore */ }
    trackLead(a.title, price)
    location.hash = me() ? '#/account' : '#/login'
  }

  return (
    <div className="book nb" id="book">
      <div className="book-form">
        {garage && <div className="fld">
          <label htmlFor="n-car">1. Your car</label>
          <input id="n-car" className="field" placeholder="Make, model and year, e.g. Toyota Camry 2019" autoComplete="off" value={car} onChange={(e) => setCar(e.target.value)} />
        </div>}
        <div className="fld">
          <span className="lbl">{n0 + 1}. Services</span>
          <div className="chips cat-chips" role="tablist">
            {CATS.filter((c) => menu.some((s) => s.cat === c)).map((c) => (
              <button key={c} type="button" role="tab" aria-pressed={cat === c} onClick={() => setCat(c)}>
                {c}{menu.some((s) => s.cat === c && pick.includes(s.id)) && <i className="on-dot" />}
              </button>
            ))}
          </div>
          <ul className="svc">
            {menu.filter((s) => s.cat === cat).map((s) => (
              <li key={s.id}>
                <button type="button" aria-pressed={pick.includes(s.id)} onClick={() => toggle(s.id)}>
                  <span className="chk" aria-hidden="true" />
                  <span className="svc-name"><b>{s.name}</b>{s.note && <small>{s.note}</small>}</span>
                  <span className="svc-meta"><b>{aed(s.price)}</b><small>{dur(s.mins)}</small></span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className="fld">
          <label htmlFor="n-master">{n0 + 2}. {Pro}</label>
          <Select id="n-master" value={master} onChange={setMaster}
            options={[{ value: 'any', label: `Any available ${pro}`, hint: 'More free times' }, ...t.masters.map((m) => ({ value: m.id, label: m.name, hint: `${m.role} · ${m.langs}` }))]} />
        </div>
        <div className="fld">
          <span className="lbl">{n0 + 3}. Day</span>
          <div className="days-row" role="group" aria-label="Day">
            {days.map((d, i) => {
              const [wd, dd] = [new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' }), new Date(d + 'T00:00:00').getDate()]
              return <button key={d} type="button" aria-pressed={date === d} onClick={() => setDate(d)}><small>{i === 0 && d === today() ? 'Today' : wd}</small><b>{dd}</b></button>
            })}
          </div>
        </div>
        <div className="fld">
          <span className="lbl">{n0 + 4}. Time</span>
          {!mins ? <p className="mut small">Choose a service to see free times.</p>
            : slots.length === 0 ? <p className="mut small">No free time this day. Try another day or any {pro}.</p>
              : <div className="slots" role="group" aria-label="Time">
                {slots.map((s) => <button key={s.start} type="button" aria-pressed={time === s.start} onClick={() => setTime(s.start)}>{hhmm(s.start)}</button>)}
              </div>}
        </div>
      </div>
      <div className="book-sum">
        <h3>Your appointment</h3>
        {chosen.length === 0 ? <p className="mut small">Nothing selected yet.</p> : (
          <dl>
            {garage && <div><dt>Car</dt><dd>{car.trim() || 'Not entered'}</dd></div>}
            {chosen.map((s) => <div key={s.id}><dt>{s.name}</dt><dd>{aed(s.price)}</dd></div>)}
            <div><dt>{Pro}</dt><dd>{who && (master !== 'any' || slot) ? who.name : 'Any'}</dd></div>
            <div><dt>When</dt><dd>{slot ? `${fmtDay(date)}, ${hhmm(slot.start)}–${hhmm(slot.start + mins)}` : 'Pick a time'}</dd></div>
            <div><dt>Duration</dt><dd>{dur(mins)}</dd></div>
          </dl>
        )}
        <div className="total" aria-live="polite"><span>Total</span><b>{aed(price)}</b></div>
        <button type="button" className="btn btn-light" disabled={!ready} onClick={book}>{ready ? 'Book appointment' : slot ? 'Enter your car' : 'Choose service and time'} <Arrow /></button>
        <a className="btn btn-line wide" href={msg} target="_blank" rel="noopener" onClick={() => trackLead('whatsapp', price)}>Ask on WhatsApp</a>
        <p className="mut small center">{garage ? 'You approve the final price before any work starts.' : 'Free cancellation up to 3 hours before.'}</p>
      </div>
    </div>
  )
}

export default function App() {
  const t = tenantFromPath(location.pathname)
  const db = useDb()
  const [route, setRoute] = useState(location.hash)
  const [pick, setPick] = useState<string[]>([])
  const [master, setMaster] = useState('any')
  useEffect(() => { if (t) void initStore(t) }, [t])
  useEffect(() => {
    const on = () => { setRoute(location.hash); if (location.hash.startsWith('#/')) scrollTo(0, 0) }
    addEventListener('hashchange', on); return () => removeEventListener('hashchange', on)
  }, [])
  const trackers = useMemo(() => ({ ga4: t?.ga4, pixel: t?.pixel }), [t])
  const kind = t ? kindOf(t) : kindFromPath(location.pathname)
  const barber = kind === 'barber', garage = kind === 'garage'
  const W = WORDS[kind]
  const what = W.what
  useEffect(() => { document.documentElement.dataset.kind = kind }, [kind])
  useEffect(() => { if (t) document.title = `${t.name}: ${what} in ${t.area}, Dubai` }, [t, what])
  if (!t) return <Index />
  if (!db) return <div className="loading" aria-busy="true" />
  const user = me(db)
  const view = route.startsWith('#/') ? route.slice(2).split('?')[0] : ''
  const menu = livePrices(t, db).filter((s) => s.available)
  const first = catsOf(t)[0]
  const fromList = menu.filter((s) => s.cat === first && s.id !== 'remove' && s.id !== 'cut-kids').map((s) => s.price)
  const from = fromList.length ? Math.min(...fromList) : 0
  const hello = wa(t.whatsapp, garage ? 'Hello! I would like to book my car in.' : 'Hello! I would like to book an appointment.')
  const map = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${t.name} ${t.address}`)}`
  const toBook = () => document.getElementById('book')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <>
      <div className="demo-bar">Demo website prepared for {t.name}. Services, prices and team are examples.</div>
      <div className="frame">
        <header className="nav">
          <a className="logo" href="#top" onClick={() => { if (view) location.hash = '' }}>{t.short}<span>{t.tag}</span></a>
          <nav aria-label="Sections">
            <a href="#book">Prices</a>
            <a href="#team">Team</a>
            <a href="#contact">Contact</a>
          </nav>
          <a className="nav-acc" href={user ? (user.role === 'owner' ? '#/admin' : '#/account') : '#/login'}>
            <Ico d={I.user} />{user ? (user.role === 'owner' ? 'Admin' : user.name.split(' ')[0]) : 'Sign in'}
          </a>
          <a className="btn btn-line" href="#book">Book now</a>
        </header>

        {!view && <section className="hero" id="top">
          <p className="eyebrow">{t.area} · Dubai · {t.hours}</p>
          <h1>{t.headline}</h1>
          <p className="lead">{t.lead}</p>
          <a className="connect" href="#book">Book online <Arrow /></a>
          <div className="stage n-stage" aria-hidden="true">
            {garage ? <img className="hero-photo hp-barber" src="/garage/hero-wrench.webp" srcSet="/garage/hero-wrench-sm.webp 480w, /garage/hero-wrench.webp 840w"
              sizes="(max-width: 640px) 80vw, 520px" width={840} height={1050} alt="" /> : barber ? <img className="hero-photo hp-barber" src="/barber/hero-fade.webp" srcSet="/barber/hero-fade-sm.webp 480w, /barber/hero-fade.webp 840w"
              sizes="(max-width: 640px) 80vw, 520px" width={840} height={1050} alt="" /> : <img className="hero-photo" src="/nails/hero-smoky.webp" srcSet="/nails/hero-smoky-sm.webp 480w, /nails/hero-smoky.webp 840w"
              sizes="(max-width: 640px) 80vw, 520px" width={840} height={941} alt="" />}
          </div>
        </section>}
      </div>

      {view === 'login' && <Auth t={t} />}
      {view === 'account' && <Account t={t} db={db} />}
      {view === 'admin' && <Admin t={t} db={db} />}
      {!view && <main className="wrap">
        <ul className="facts">
          <li><span className="ico"><Ico d={I.star} /></span><div><b>{t.rating.value} on Google</b><span>{t.rating.count} reviews</span></div></li>
          <li><span className="ico"><Ico d={I.clock} /></span><div><b>{t.hours.replace(/^(Daily|Sat–Thu|Mon–Sat) /, '')}</b><span>{t.hoursSub ?? (t.hours.startsWith('Daily') ? 'every day' : t.hours.split(' ')[0].toLowerCase().replace('sat–thu', 'Saturday to Thursday').replace('mon–sat', 'Monday to Saturday'))}</span></div></li>
          <li><span className="ico"><Ico d={I.tag} /></span><div><b>{first} from {aed(from)}</b><span>prices shown upfront</span></div></li>
          <li><span className="ico"><Ico d={I.shield} /></span>{garage
            ? <div><b>No surprise bills</b><span>work starts after your OK</span></div>
            : <div><b>Sterile tools</b><span>{barber ? 'fresh blade for every client' : 'single-use files, autoclave'}</span></div>}</li>
        </ul>

        <section className="book-sec" aria-label="Booking">
          <Head pill="Online booking" title="Book your appointment" sub={garage ? 'Tell us your car, choose services and a free time. You get a confirmation on WhatsApp.' : `Choose services, a ${W.pro} and a free time. You get a confirmation on WhatsApp.`} />
          {db && <Booking t={t} db={db} pick={pick} setPick={setPick} master={master} setMaster={setMaster} />}
        </section>

        <section className="sec" id="team">
          <Head pill="Team" title={barber || garage ? `Our ${W.pros}` : t.masters.length > 1 ? 'Our masters' : 'Your master'} sub={garage ? 'Book your car in with the mechanic you trust, or take the first free one.' : t.masters.length > 1 ? `Pick your favourite ${W.pro} or let us choose the first one free.` : `Every set is done personally by ${t.masters[0].name}.`} />
          <div className="team">
            {t.masters.map((m) => (
              <button key={m.id} type="button" className="card master" onClick={() => { setMaster(m.id); toBook() }}>
                <span className="ava" aria-hidden="true">{m.name[0]}</span>
                <h3>{m.name}</h3>
                <span className="mut small">{m.role}</span>
                <span className="mut small">{m.langs}</span>
                <span className="more">Book with {m.name} <Arrow /></span>
              </button>
            ))}
          </div>
        </section>

        <figure className="quote">
          <blockquote>“{t.review.text}”</blockquote>
          <figcaption>{t.review.author} · {t.rating.value} ★ from {t.rating.count} reviews</figcaption>
        </figure>

        <section className="sec contact" id="contact">
          <div>
            <p className="eyebrow">{t.hours}</p>
            <a className="big-phone" href={`tel:+${t.whatsapp}`}>{t.phone}</a>
            <p className="mut">{t.address}</p>
            <a className="connect" href={map} target="_blank" rel="noopener">Open in Google Maps <Arrow /></a>
          </div>
          <a className="btn btn-light" href={hello} target="_blank" rel="noopener" onClick={() => trackLead('contact')}>Message on WhatsApp <Arrow /></a>
        </section>
      </main>}

      <footer className="foot wrap">
        <span>© {new Date().getFullYear()} {t.name}</span>
        <span className="mut">{what[0].toUpperCase() + what.slice(1)} in {t.area}, Dubai · <button type="button" className="ck-link" onClick={openCookieSettings}>Cookie settings</button></span>
      </footer>
      <Cookies trackers={trackers} />
    </>
  )
}
