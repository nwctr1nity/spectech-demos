// Sign in, client account and owner panel for the salon demo sites.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Select } from '../Select'
import { Arrow, I, Ico } from '../rent/ui'
import { CATS, aed, dur, hhmm, wa, type Tenant } from './data'
import {
  AuthError, STATUS, addDays, createAppt, fmtDay, livePrices, me, ownerLogin, resetDemo, setNote, setStatus, signIn, signOut, signUp,
  today, updatePrice, updateProfile, type Appt, type DbT, type Status,
} from './store'

export const PENDING = 'nails_pending_appt'
type Pending = Omit<Appt, 'id' | 'no' | 'userId' | 'status' | 'created'>
function takePending(): Pending | undefined {
  try { const raw = sessionStorage.getItem(PENDING); sessionStorage.removeItem(PENDING); return raw ? JSON.parse(raw) : undefined } catch { return undefined }
}
const Badge = ({ s }: { s: Status }) => <span className={`badge n-${s}`}>{STATUS[s]}</span>
const when = (a: Appt) => `${fmtDay(a.date)}, ${hhmm(a.start)}–${hhmm(a.start + a.mins)}`
const phoneDigits = (p: string) => p.replace(/\D/g, '')

/* ---------- Sign in ---------- */

export function Auth({ t }: { t: Tenant }) {
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [f, setF] = useState({ name: '', email: '', phone: '', pass: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const pending = useMemo(() => { try { return !!sessionStorage.getItem(PENDING) } catch { return false } }, [])
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value })
  const owner = ownerLogin(t)
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try {
      const u = mode === 'in' ? await signIn(f.email, f.pass) : await signUp(f.name, f.email, f.phone, f.pass)
      if (u.role === 'owner') { location.hash = '#/admin'; return }
      const p = takePending()
      if (p) { try { createAppt(p) } catch (x) { setErr(x instanceof AuthError ? x.message : 'Could not book.'); return } }
      location.hash = p ? '#/account?new' : '#/account'
    } catch (x) { setErr(x instanceof AuthError ? x.message : 'Something went wrong. Try again.') } finally { setBusy(false) }
  }
  return (
    <main className="wrap cab auth">
      <form className="panel auth-card" onSubmit={submit}>
        <h1>{mode === 'in' ? 'Sign in' : 'Create account'}</h1>
        <p className="mut">{pending ? 'Sign in to confirm your booking. Your time is held for you.' : 'See your appointments and book again in one tap.'}</p>
        <div className="seg" role="tablist">
          <button type="button" role="tab" aria-selected={mode === 'in'} onClick={() => setMode('in')}>Sign in</button>
          <button type="button" role="tab" aria-selected={mode === 'up'} onClick={() => setMode('up')}>New here</button>
        </div>
        {mode === 'up' && <>
          <div className="fld"><label htmlFor="a-name">Full name</label><input id="a-name" className="field" required autoComplete="name" value={f.name} onChange={set('name')} /></div>
          <div className="fld"><label htmlFor="a-phone">Phone (WhatsApp)</label><input id="a-phone" className="field" required type="tel" autoComplete="tel" placeholder="+971 50 123 4567" value={f.phone} onChange={set('phone')} /></div>
        </>}
        <div className="fld"><label htmlFor="a-email">Email</label><input id="a-email" className="field" required type="email" autoComplete="email" value={f.email} onChange={set('email')} /></div>
        <div className="fld"><label htmlFor="a-pass">Password</label><input id="a-pass" className="field" required type="password" minLength={6} autoComplete={mode === 'in' ? 'current-password' : 'new-password'} value={f.pass} onChange={set('pass')} /></div>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn btn-light" disabled={busy}>{mode === 'in' ? 'Sign in' : 'Create account'} <Arrow /></button>
        <div className="demo-hint">
          <b>Demo accounts</b>
          <button type="button" onClick={() => { setMode('in'); setF({ ...f, email: owner.email, pass: owner.pass }) }}>Owner: {owner.email}</button>
          <button type="button" onClick={() => { setMode('in'); setF({ ...f, email: 'anna@example.com', pass: 'demo1234' }) }}>Client: anna@example.com</button>
          <span>Password for both: demo1234</span>
        </div>
      </form>
    </main>
  )
}

function NeedSignIn({ owner }: { owner?: boolean }) {
  return (
    <main className="wrap cab"><div className="panel empty">
      <h1>{owner ? 'Owner access only' : 'Please sign in'}</h1>
      <p className="mut">{owner ? 'Sign in with the owner account to open the admin panel.' : 'Sign in to see your appointments.'}</p>
      <a className="btn btn-light" href="#/login">Sign in <Arrow /></a>
    </div></main>
  )
}

/* ---------- Client account ---------- */

export function Account({ t, db }: { t: Tenant; db: DbT }) {
  const u = me(db)
  const [err, setErr] = useState('')
  useEffect(() => {
    if (!u || u.role === 'owner') return
    const p = takePending()
    if (p) { try { createAppt(p); history.replaceState(null, '', '#/account?new') } catch (x) { setErr(x instanceof AuthError ? x.message : 'Could not book.') } }
  }, [u])
  useEffect(() => { if (u?.role === 'owner') location.hash = '#/admin' }, [u])
  if (!u) return <NeedSignIn />
  if (u.role === 'owner') return null
  const mine = db.appts.filter((a) => a.userId === u.id)
  const upcoming = mine.filter((a) => a.date >= today() && (a.status === 'new' || a.status === 'confirmed')).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))
  const past = mine.filter((a) => !upcoming.includes(a))
  const master = (id: string) => t.masters.find((m) => m.id === id)?.name ?? 'Master'
  const fresh = location.hash.includes('new') && mine[0]?.status === 'new'

  const Item = ({ a }: { a: Appt }) => (
    <article className="panel appt">
      <div className="appt-date"><b>{new Date(a.date + 'T00:00:00').getDate()}</b><span>{new Date(a.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}</span></div>
      <div className="req-body">
        <div className="req-top"><span className="mut small">#{a.no} · {hhmm(a.start)}–{hhmm(a.start + a.mins)}</span><Badge s={a.status} /></div>
        <h3>{a.title}</h3>
        <p className="mut small">with {master(a.masterId)} · {dur(a.mins)} · {aed(a.price)}</p>
        <div className="req-act">
          <a className="btn btn-line" href={wa(t.whatsapp, `Hello! About my appointment #${a.no} on ${when(a)}.`)} target="_blank" rel="noopener">WhatsApp us</a>
          {(a.status === 'new' || a.status === 'confirmed') && a.date >= today() && <button type="button" className="btn btn-line danger" onClick={() => setStatus(a.id, 'cancelled')}>Cancel</button>}
          {(a.status === 'done' || a.status === 'cancelled' || a.status === 'noshow') && <a className="btn btn-line" href="#book" onClick={() => { location.hash = ''; setTimeout(() => document.getElementById('book')?.scrollIntoView(), 60) }}>Book again</a>}
        </div>
      </div>
    </article>
  )

  return (
    <main className="wrap cab">
      <div className="cab-head">
        <div><p className="eyebrow">My account</p><h1>Hello, {u.name.split(' ')[0]}</h1></div>
        <button type="button" className="btn btn-line" onClick={() => { signOut(); location.hash = '' }}><Ico d={I.out} />Sign out</button>
      </div>
      {err && <p className="err notice-err" role="alert">{err}</p>}
      {fresh && <div className="notice" role="status"><b>Booked: {when(mine[0])}.</b> {t.short} will confirm on WhatsApp shortly.</div>}
      <div className="cab-grid">
        <section aria-label="My appointments">
          <h2 className="cab-h">Upcoming</h2>
          {upcoming.length === 0 && <div className="panel empty"><p className="mut">No upcoming appointments.</p>
            <a className="btn btn-light" href="#book" onClick={() => { location.hash = ''; setTimeout(() => document.getElementById('book')?.scrollIntoView(), 60) }}>Book now <Arrow /></a></div>}
          <div className="reqs">{upcoming.map((a) => <Item key={a.id} a={a} />)}</div>
          {past.length > 0 && <><h2 className="cab-h past-h">History</h2><div className="reqs">{past.map((a) => <Item key={a.id} a={a} />)}</div></>}
        </section>
        <Profile name={u.name} phone={u.phone} email={u.email} />
      </div>
    </main>
  )
}

function Profile(p: { name: string; phone: string; email: string }) {
  const [f, setF] = useState({ name: p.name, phone: p.phone })
  const [ok, setOk] = useState(false)
  return (
    <form className="panel profile" onSubmit={(e) => { e.preventDefault(); updateProfile(f); setOk(true); setTimeout(() => setOk(false), 1800) }}>
      <h2 className="cab-h">Profile</h2>
      <div className="fld"><label htmlFor="p-name">Full name</label><input id="p-name" className="field" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
      <div className="fld"><label htmlFor="p-phone">Phone (WhatsApp)</label><input id="p-phone" className="field" required type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></div>
      <div className="fld"><span className="lbl">Email</span><p>{p.email}</p></div>
      <button className="btn btn-line">{ok ? 'Saved ✓' : 'Save'}</button>
    </form>
  )
}

/* ---------- Owner panel ---------- */

type Tab = 'overview' | 'schedule' | 'bookings' | 'prices' | 'clients'
const TABS: [Tab, string, string][] = [
  ['overview', 'Overview', I.grid], ['schedule', 'Schedule', I.clock], ['bookings', 'Bookings', I.list], ['prices', 'Services & prices', I.tag], ['clients', 'Clients', I.people],
]
const ORDER: Status[] = ['new', 'confirmed', 'done', 'noshow', 'cancelled']

let armed = 0
function confirmReset(el: HTMLButtonElement) {
  if (Date.now() - armed < 4000) { armed = 0; return true }
  armed = Date.now(); el.textContent = 'Click again to reset'; setTimeout(() => { el.textContent = 'Reset demo data' }, 4000); return false
}

export function Admin({ t, db }: { t: Tenant; db: DbT }) {
  const u = me(db)
  const [tab, setTab] = useState<Tab>('overview')
  const [filter, setFilter] = useState<Status | 'all'>('all')
  if (!u || u.role !== 'owner') return <NeedSignIn owner />
  const newCount = db.appts.filter((a) => a.status === 'new').length
  return (
    <main className="wrap cab admin">
      <div className="cab-head">
        <div><p className="eyebrow">Owner panel · demo data</p><h1>{t.name}</h1></div>
        <div className="cab-head-act">
          <button type="button" className="ck-link" onClick={(e) => { if (confirmReset(e.currentTarget)) void resetDemo(t).then(() => signIn(ownerLogin(t).email, ownerLogin(t).pass)) }}>Reset demo data</button>
          <button type="button" className="btn btn-line" onClick={() => { signOut(); location.hash = '' }}><Ico d={I.out} />Sign out</button>
        </div>
      </div>
      <nav className="tabs" aria-label="Admin sections">
        {TABS.map(([id, label, icon]) => (
          <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
            <Ico d={icon} />{label}{id === 'bookings' && newCount > 0 && <span className="dot">{newCount}</span>}
          </button>
        ))}
      </nav>
      {tab === 'overview' && <Overview t={t} db={db} go={(f) => { setFilter(f); setTab(f === 'all' ? 'schedule' : 'bookings') }} />}
      {tab === 'schedule' && <Schedule t={t} db={db} />}
      {tab === 'bookings' && <Bookings t={t} db={db} filter={filter} setFilter={setFilter} />}
      {tab === 'prices' && <Prices t={t} db={db} />}
      {tab === 'clients' && <Clients t={t} db={db} />}
    </main>
  )
}

function Overview({ t, db, go }: { t: Tenant; db: DbT; go: (f: Status | 'all') => void }) {
  const a = db.appts
  const d = today()
  const live = (x: Appt) => x.status === 'confirmed' || x.status === 'new'
  const todays = a.filter((x) => x.date === d && live(x))
  const weekEnd = addDays(d, 7)
  const week = a.filter((x) => x.date >= d && x.date < weekEnd && live(x))
  const hours = t.masters.length * (t.close - t.open) * 60
  const load = hours ? Math.round((todays.reduce((s, x) => s + x.mins, 0) / hours) * 100) : 0
  const fresh = a.filter((x) => x.status === 'new')
  const tiles: [string, string | number, string, Status | 'all'][] = [
    ['New bookings', fresh.length, 'waiting for confirmation', 'new'],
    ['Today', todays.length, `${aed(todays.reduce((s, x) => s + x.price, 0))} expected`, 'all'],
    ['Masters busy today', `${load}%`, 'of working hours booked', 'all'],
    ['Next 7 days', aed(week.reduce((s, x) => s + x.price, 0)), `${week.length} appointments`, 'confirmed'],
  ]
  const who = (id: string) => db.users.find((u) => u.id === id)
  return (
    <div className="ov">
      <div className="tiles">
        {tiles.map(([l, v, h, f]) => <button key={l} type="button" className="panel tile" onClick={() => go(f)}><span className="mut small">{l}</span><b>{v}</b><span className="mut small">{h}</span></button>)}
      </div>
      <section className="panel">
        <h2 className="cab-h">Needs confirmation</h2>
        {fresh.length === 0 ? <p className="mut">All bookings confirmed.</p> : fresh.map((x) => (
          <div className="line" key={x.id}>
            <div><b>#{x.no} · {x.title}</b><span className="mut small">{who(x.userId)?.name} · {when(x)} · {t.masters.find((m) => m.id === x.masterId)?.name} · {aed(x.price)}</span></div>
            <div className="line-act">
              <button type="button" className="btn btn-light sm" onClick={() => setStatus(x.id, 'confirmed')}>Confirm</button>
              <button type="button" className="btn btn-line sm" onClick={() => setStatus(x.id, 'cancelled')}>Decline</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}

const PX = 1.1 // pixels per minute in the schedule

function Schedule({ t, db }: { t: Tenant; db: DbT }) {
  const [date, setDate] = useState(today())
  const [sel, setSel] = useState<string | null>(null)
  const list = db.appts.filter((a) => a.date === date && a.status !== 'cancelled')
  const a = db.appts.find((x) => x.id === sel)
  const client = a && db.users.find((u) => u.id === a.userId)
  const hours = Array.from({ length: t.close - t.open }, (_, i) => t.open + i)
  const height = (t.close - t.open) * 60 * PX
  return (
    <section className="sched-wrap">
      <div className="sched-bar">
        <button type="button" className="btn btn-line sm" onClick={() => setDate(addDays(date, -1))} aria-label="Previous day">←</button>
        <b>{date === today() ? 'Today · ' : ''}{fmtDay(date)}</b>
        <button type="button" className="btn btn-line sm" onClick={() => setDate(addDays(date, 1))} aria-label="Next day">→</button>
        {date !== today() && <button type="button" className="ck-link" onClick={() => setDate(today())}>Today</button>}
        <span className="mut small push">{list.length} appointments · {aed(list.filter((x) => x.status !== 'noshow').reduce((s, x) => s + x.price, 0))}</span>
      </div>
      <div className="panel sched" style={{ ['--cols' as string]: t.masters.length }}>
        <div className="sch-head"><span />{t.masters.map((m) => <b key={m.id}>{m.name}<small>{m.role}</small></b>)}</div>
        <div className="sch-body" style={{ height }}>
          <div className="sch-hours">{hours.map((h) => <span key={h} style={{ top: (h - t.open) * 60 * PX }}>{hhmm(h * 60)}</span>)}</div>
          {t.masters.map((m) => (
            <div className="sch-col" key={m.id}>
              {hours.map((h) => <i key={h} style={{ top: (h - t.open) * 60 * PX }} />)}
              {list.filter((x) => x.masterId === m.id).map((x) => (
                <button key={x.id} type="button" className={`blk n-${x.status}${sel === x.id ? ' on' : ''}`}
                  style={{ top: (x.start - t.open * 60) * PX, height: Math.max(x.mins * PX - 3, 22) }} onClick={() => setSel(x.id)}>
                  <b>{hhmm(x.start)} {db.users.find((u) => u.id === x.userId)?.name.split(' ')[0]}</b>
                  <span>{x.title}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
      {a && client && (
        <div className="panel sched-detail" role="region" aria-label="Appointment details">
          <div className="req-top"><span className="mut small">#{a.no} · {when(a)}</span><Badge s={a.status} /></div>
          <h3>{a.title}</h3>
          <p className="small">{client.name} · {client.phone} · {aed(a.price)}</p>
          <div className="sd-act">
            <Select id={`sd-${a.id}`} value={a.status} onChange={(v) => setStatus(a.id, v as Status)} options={ORDER.map((s) => ({ value: s, label: STATUS[s] }))} />
            <a className="btn btn-light sm" target="_blank" rel="noopener" href={wa(phoneDigits(client.phone), `Hello ${client.name.split(' ')[0]}! This is ${t.name} about your appointment on ${when(a)}.`)}>WhatsApp client <Arrow /></a>
            <button type="button" className="ck-link" onClick={() => setSel(null)}>Close</button>
          </div>
        </div>
      )}
    </section>
  )
}

function Bookings({ t, db, filter, setFilter }: { t: Tenant; db: DbT; filter: Status | 'all'; setFilter: (f: Status | 'all') => void }) {
  const [q, setQ] = useState('')
  const list = db.appts.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false
    const g = db.users.find((u) => u.id === a.userId)
    return !q.trim() || `${a.no} ${a.title} ${g?.name} ${g?.phone} ${g?.email}`.toLowerCase().includes(q.trim().toLowerCase())
  }).sort((a, b) => (b.date + hhmm(b.start)).localeCompare(a.date + hhmm(a.start)))
  return (
    <section>
      <div className="req-tools">
        <div className="chips">
          {(['all', ...ORDER] as const).map((s) => (
            <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : STATUS[s]} <span>{s === 'all' ? db.appts.length : db.appts.filter((a) => a.status === s).length}</span>
            </button>
          ))}
        </div>
        <input className="field search" type="search" placeholder="Search name, phone, # or service" aria-label="Search bookings" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 && <div className="panel empty"><p className="mut">No bookings here.</p></div>}
      <div className="adm-list">
        {list.map((a) => {
          const g = db.users.find((u) => u.id === a.userId)
          return (
            <article className="panel adm-req n-adm" key={a.id}>
              <div className="appt-date"><b>{new Date(a.date + 'T00:00:00').getDate()}</b><span>{new Date(a.date + 'T00:00:00').toLocaleDateString('en-GB', { month: 'short' })}</span></div>
              <div className="adm-main">
                <div className="req-top"><span className="mut small">#{a.no} · {hhmm(a.start)}–{hhmm(a.start + a.mins)}</span><Badge s={a.status} /></div>
                <h3>{a.title}</h3>
                <p className="small">with {t.masters.find((m) => m.id === a.masterId)?.name} · {dur(a.mins)} · <b>{aed(a.price)}</b></p>
                <input className="field note" placeholder="Private note, e.g. allergy or colour" aria-label={`Note for #${a.no}`} defaultValue={a.note} onBlur={(e) => setNote(a.id, e.target.value)} />
              </div>
              <div className="adm-side">
                <div className="who"><b>{g?.name}</b><span className="mut small">{g?.phone}</span><span className="mut small">{g?.email}</span></div>
                <div className="fld"><label htmlFor={`st-${a.id}`}>Status</label>
                  <Select id={`st-${a.id}`} value={a.status} onChange={(v) => setStatus(a.id, v as Status)} options={ORDER.map((s) => ({ value: s, label: STATUS[s] }))} /></div>
                {g && <a className="btn btn-light sm" target="_blank" rel="noopener" href={wa(phoneDigits(g.phone), `Hello ${g.name.split(' ')[0]}! This is ${t.name} about your appointment on ${when(a)}.`)}>WhatsApp client <Arrow /></a>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Prices({ t, db }: { t: Tenant; db: DbT }) {
  const items = livePrices(t, db)
  return (
    <section className="panel fleet-tbl">
      <h2 className="cab-h">Services & prices</h2>
      <p className="mut small">Changes show on the website and in online booking right away.</p>
      {CATS.map((c) => items.some((s) => s.cat === c) && (
        <div key={c} className="pr-group">
          <h3 className="pr-cat">{c}</h3>
          {items.filter((s) => s.cat === c).map((s) => (
            <div className={`prow${s.available ? '' : ' off'}`} key={s.id}>
              <div className="fname"><b>{s.name}</b>{s.note && <span className="mut small">{s.note}</span>}</div>
              <label className="fld num"><span className="lbl">Price, AED</span>
                <input className="field" type="number" min={0} inputMode="numeric" defaultValue={s.price}
                  onBlur={(e) => { const v = Math.max(0, Math.round(Number(e.target.value) || 0)); e.target.value = String(v); updatePrice(s.id, { price: v }) }} /></label>
              <label className="fld num"><span className="lbl">Minutes</span>
                <input className="field" type="number" min={10} step={5} inputMode="numeric" defaultValue={s.mins}
                  onBlur={(e) => { const v = Math.max(10, Math.round((Number(e.target.value) || 10) / 5) * 5); e.target.value = String(v); updatePrice(s.id, { mins: v }) }} /></label>
              <label className="ck-row avail"><span className="small">{s.available ? 'Bookable' : 'Hidden'}</span>
                <input type="checkbox" checked={s.available} onChange={(e) => updatePrice(s.id, { available: e.target.checked })} aria-label={`${s.name} bookable`} /></label>
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}

function Clients({ t, db }: { t: Tenant; db: DbT }) {
  const rows = db.users.filter((u) => u.role === 'guest').map((u) => {
    const as = db.appts.filter((a) => a.userId === u.id)
    return { u, n: as.filter((a) => a.status === 'done').length, spent: as.filter((a) => a.status === 'done').reduce((s, a) => s + a.price, 0),
      next: as.filter((a) => a.date >= today() && (a.status === 'new' || a.status === 'confirmed')).map((a) => a.date).sort()[0], noshow: as.filter((a) => a.status === 'noshow').length }
  }).sort((a, b) => b.spent - a.spent)
  return (
    <section className="panel">
      <h2 className="cab-h">Clients <span className="mut">{rows.length}</span></h2>
      <div className="tbl" role="table" aria-label="Clients">
        <div className="tr th" role="row"><span role="columnheader">Name</span><span role="columnheader">Contact</span><span role="columnheader">Visits</span><span role="columnheader">Spent</span><span role="columnheader">Next</span><span /></div>
        {rows.map(({ u, n, spent, next, noshow }) => (
          <div className="tr" role="row" key={u.id}>
            <span role="cell"><b>{u.name}</b>{noshow > 0 && <span className="badge n-noshow tiny">{noshow} no-show</span>}</span>
            <span role="cell" className="mut small">{u.phone}<br />{u.email}</span>
            <span role="cell">{n}</span>
            <span role="cell">{aed(spent)}</span>
            <span role="cell" className="mut small">{next ? fmtDay(next) : '—'}</span>
            <span role="cell"><a className="btn btn-line sm" aria-label={`WhatsApp ${u.name}`} href={wa(phoneDigits(u.phone), `Hello ${u.name.split(' ')[0]}! This is ${t.name}.`)} target="_blank" rel="noopener"><Ico d={I.phone} /></a></span>
          </div>
        ))}
      </div>
    </section>
  )
}
