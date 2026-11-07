// Sign in, guest account and owner admin for the rental demo sites.
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Select } from '../Select'
import { CarArt } from './Car'
import { CARS, aed, wa, type Tenant } from './data'
import {
  AuthError, STATUS, createRequest, endDate, fmtDate, me, ownerLogin, resetDemo, setNote, setStatus, signIn, signOut, signUp,
  today, updateFleet, updateProfile, type Request, type Status, type useDb,
} from './store'
import { Arrow, I, Ico } from './ui'

type Db = NonNullable<ReturnType<typeof useDb>>
export const PENDING = 'rent_pending_request'

function takePending(): Omit<Request, 'id' | 'no' | 'userId' | 'status' | 'created'> | undefined {
  try {
    const raw = sessionStorage.getItem(PENDING); sessionStorage.removeItem(PENDING)
    return raw ? JSON.parse(raw) : undefined
  } catch { return undefined }
}

const Badge = ({ s }: { s: Status }) => <span className={`badge b-${s}`}>{STATUS[s]}</span>
const carOf = (id: string) => CARS.find((c) => c.id === id) ?? CARS[0]

/* ---------- Sign in / sign up ---------- */

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
      const p = takePending(); if (p) createRequest(p)
      location.hash = p ? '#/account?new' : '#/account'
    } catch (x) { setErr(x instanceof AuthError ? x.message : 'Something went wrong. Try again.') } finally { setBusy(false) }
  }

  return (
    <main className="wrap cab auth">
      <form className="panel auth-card" onSubmit={submit}>
        <h1>{mode === 'in' ? 'Sign in' : 'Create account'}</h1>
        <p className="mut">{pending ? 'Sign in to send your booking request. Your quote is saved.' : 'See your bookings and their status.'}</p>
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
          <button type="button" onClick={() => { setMode('in'); setF({ ...f, email: 'anna@example.com', pass: 'demo1234' }) }}>Guest: anna@example.com</button>
          <span>Password for both: demo1234</span>
        </div>
      </form>
    </main>
  )
}

/* ---------- Guest account ---------- */

function NeedSignIn({ owner }: { owner?: boolean }) {
  return (
    <main className="wrap cab">
      <div className="panel empty"><h1>{owner ? 'Owner access only' : 'Please sign in'}</h1>
        <p className="mut">{owner ? 'Sign in with the owner account to open the admin panel.' : 'Sign in to see your bookings.'}</p>
        <a className="btn btn-light" href="#/login">Sign in <Arrow /></a></div>
    </main>
  )
}

export function Account({ t, db }: { t: Tenant; db: Db }) {
  const u = me(db)
  const [fresh] = useState(() => location.hash.includes('new'))
  useEffect(() => { if (!u) return; const p = takePending(); if (p) { createRequest(p); history.replaceState(null, '', '#/account?new') } }, [u])
  if (!u) return <NeedSignIn />
  if (u.role === 'owner') { location.hash = '#/admin'; return null }
  const mine = db.requests.filter((r) => r.userId === u.id)

  return (
    <main className="wrap cab">
      <div className="cab-head">
        <div><p className="eyebrow">My account</p><h1>Hello, {u.name.split(' ')[0]}</h1></div>
        <button type="button" className="btn btn-line" onClick={() => { signOut(); location.hash = '' }}><Ico d={I.out} />Sign out</button>
      </div>
      {(fresh || location.hash.includes('new')) && mine[0]?.status === 'new' && (
        <div className="notice" role="status"><b>Request #{mine[0].no} sent.</b> {t.short} will confirm it on WhatsApp, usually within 15 minutes.</div>
      )}
      <div className="cab-grid">
        <section aria-label="My bookings">
          <h2 className="cab-h">My bookings</h2>
          {mine.length === 0 && <div className="panel empty"><p className="mut">No bookings yet.</p><a className="btn btn-light" href="#book" onClick={() => { location.hash = ''; setTimeout(() => document.getElementById('book')?.scrollIntoView(), 50) }}>Choose a car <Arrow /></a></div>}
          <div className="reqs">
            {mine.map((r) => (
              <article className="panel req" key={r.id}>
                <div className="pic"><CarArt car={carOf(r.carId)} /></div>
                <div className="req-body">
                  <div className="req-top"><span className="mut small">#{r.no}</span><Badge s={r.status} /></div>
                  <h3>{r.carName}</h3>
                  <p className="mut small">{fmtDate(r.start)} → {fmtDate(endDate(r.start, r.days))} · {r.days} day{r.days > 1 ? 's' : ''}</p>
                  <p className="mut small">{r.delivery} · {r.cover}</p>
                  <div className="req-sum"><b>{aed(r.total)}</b>{r.deposit ? <span className="mut small">+ {aed(r.deposit)} deposit</span> : <span className="mut small">no deposit</span>}</div>
                  <div className="req-act">
                    <a className="btn btn-line" href={wa(t.whatsapp, `Hello! About my booking #${r.no}: ${r.carName} from ${fmtDate(r.start)}.`)} target="_blank" rel="noopener">WhatsApp us</a>
                    {r.status === 'new' && <button type="button" className="btn btn-line danger" onClick={() => setStatus(r.id, 'cancelled')}>Cancel request</button>}
                  </div>
                </div>
              </article>
            ))}
          </div>
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

/* ---------- Owner admin ---------- */

type Tab = 'overview' | 'requests' | 'fleet' | 'customers'
const TABS: [Tab, string, string][] = [['overview', 'Overview', I.grid], ['requests', 'Requests', I.list], ['fleet', 'Fleet & prices', I.car], ['customers', 'Customers', I.people]]

export function Admin({ t, db }: { t: Tenant; db: Db }) {
  const u = me(db)
  const [tab, setTab] = useState<Tab>('overview')
  const [filter, setFilter] = useState<Status | 'all'>('all')
  if (!u || u.role !== 'owner') return <NeedSignIn owner />
  const newCount = db.requests.filter((r) => r.status === 'new').length
  const open = (f: Status | 'all') => { setFilter(f); setTab('requests') }

  return (
    <main className="wrap cab admin">
      <div className="cab-head">
        <div><p className="eyebrow">Owner panel · demo data</p><h1>{t.name}</h1></div>
        <div className="cab-head-act">
          <button type="button" className="ck-link" onClick={() => { if (confirmReset()) void resetDemo(t).then(() => signIn(ownerLogin(t).email, ownerLogin(t).pass)) }}>Reset demo data</button>
          <button type="button" className="btn btn-line" onClick={() => { signOut(); location.hash = '' }}><Ico d={I.out} />Sign out</button>
        </div>
      </div>
      <nav className="tabs" aria-label="Admin sections">
        {TABS.map(([id, label, icon]) => (
          <button key={id} type="button" aria-current={tab === id ? 'page' : undefined} onClick={() => setTab(id)}>
            <Ico d={icon} />{label}{id === 'requests' && newCount > 0 && <span className="dot">{newCount}</span>}
          </button>
        ))}
      </nav>
      {tab === 'overview' && <Overview db={db} open={open} />}
      {tab === 'requests' && <Requests t={t} db={db} filter={filter} setFilter={setFilter} />}
      {tab === 'fleet' && <Fleet db={db} />}
      {tab === 'customers' && <Customers t={t} db={db} />}
    </main>
  )
}

// A plain inline confirmation without a browser dialog.
let armed = 0
function confirmReset() { const now = Date.now(); if (now - armed < 4000) { armed = 0; return true } armed = now; alertOnce(); return false }
function alertOnce() { const el = document.querySelector('.cab-head-act .ck-link'); if (el) { el.textContent = 'Click again to reset'; setTimeout(() => { el.textContent = 'Reset demo data' }, 4000) } }

function Overview({ db, open }: { db: Db; open: (f: Status | 'all') => void }) {
  const r = db.requests
  const month = today().slice(0, 7)
  const revenue = r.filter((x) => x.status !== 'cancelled' && x.status !== 'new' && x.start.slice(0, 7) === month).reduce((a, x) => a + x.total, 0)
  const upcoming = r.filter((x) => x.status === 'confirmed' && x.start >= today()).sort((a, b) => a.start.localeCompare(b.start))
  const tiles: [string, string | number, string, Status | 'all'][] = [
    ['New requests', r.filter((x) => x.status === 'new').length, 'waiting for your answer', 'new'],
    ['Upcoming pick-ups', upcoming.length, 'confirmed bookings', 'confirmed'],
    ['Cars out now', r.filter((x) => x.status === 'active').length, 'handed over to guests', 'active'],
    ['Revenue this month', aed(revenue), 'confirmed, active and completed', 'all'],
  ]
  const fresh = r.filter((x) => x.status === 'new')
  return (
    <div className="ov">
      <div className="tiles">
        {tiles.map(([l, v, h, f]) => <button key={l} type="button" className="panel tile" onClick={() => open(f)}><span className="mut small">{l}</span><b>{v}</b><span className="mut small">{h}</span></button>)}
      </div>
      <section className="panel">
        <h2 className="cab-h">Needs your answer</h2>
        {fresh.length === 0 ? <p className="mut">All requests answered.</p> : fresh.map((x) => {
          const g = db.users.find((u) => u.id === x.userId)
          return (
            <div className="line" key={x.id}>
              <div><b>#{x.no} · {x.carName}</b><span className="mut small">{g?.name} · {fmtDate(x.start)}, {x.days} days · {aed(x.total)}</span></div>
              <div className="line-act">
                <button type="button" className="btn btn-light sm" onClick={() => setStatus(x.id, 'confirmed')}>Confirm</button>
                <button type="button" className="btn btn-line sm" onClick={() => setStatus(x.id, 'cancelled')}>Decline</button>
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}

const ORDER: Status[] = ['new', 'confirmed', 'active', 'done', 'cancelled']

function Requests({ t, db, filter, setFilter }: { t: Tenant; db: Db; filter: Status | 'all'; setFilter: (f: Status | 'all') => void }) {
  const [q, setQ] = useState('')
  const users = db.users
  const list = db.requests.filter((r) => {
    if (filter !== 'all' && r.status !== filter) return false
    if (!q.trim()) return true
    const g = users.find((u) => u.id === r.userId)
    return `${r.no} ${r.carName} ${g?.name} ${g?.phone} ${g?.email}`.toLowerCase().includes(q.trim().toLowerCase())
  })
  return (
    <section>
      <div className="req-tools">
        <div className="chips">
          {(['all', ...ORDER] as const).map((s) => (
            <button key={s} type="button" aria-pressed={filter === s} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : STATUS[s]} <span>{s === 'all' ? db.requests.length : db.requests.filter((r) => r.status === s).length}</span>
            </button>
          ))}
        </div>
        <input className="field search" type="search" placeholder="Search name, phone, # or car" aria-label="Search requests" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      {list.length === 0 && <div className="panel empty"><p className="mut">No requests here.</p></div>}
      <div className="adm-list">
        {list.map((r) => {
          const g = users.find((u) => u.id === r.userId)
          return (
            <article className="panel adm-req" key={r.id}>
              <div className="pic"><CarArt car={carOf(r.carId)} /></div>
              <div className="adm-main">
                <div className="req-top"><span className="mut small">#{r.no} · sent {fmtDate(r.created.slice(0, 10))}</span><Badge s={r.status} /></div>
                <h3>{r.carName}</h3>
                <p className="small">{fmtDate(r.start)} → {fmtDate(endDate(r.start, r.days))} · {r.days} days · {r.delivery}</p>
                <p className="small"><b>{aed(r.total)}</b> <span className="mut">{r.deposit ? `+ ${aed(r.deposit)} deposit` : 'no deposit'} · {r.cover}</span></p>
                <input className="field note" placeholder="Private note, e.g. flight number" aria-label={`Note for #${r.no}`} defaultValue={r.note} onBlur={(e) => setNote(r.id, e.target.value)} />
              </div>
              <div className="adm-side">
                <div className="who"><b>{g?.name}</b><span className="mut small">{g?.phone}</span><span className="mut small">{g?.email}</span></div>
                <div className="fld">
                  <label htmlFor={`st-${r.id}`}>Status</label>
                  <Select id={`st-${r.id}`} value={r.status} onChange={(v) => setStatus(r.id, v as Status)}
                    options={ORDER.map((s) => ({ value: s, label: STATUS[s] }))} />
                </div>
                {g && <a className="btn btn-light sm" target="_blank" rel="noopener"
                  href={wa(g.phone.replace(/\D/g, ''), `Hello ${g.name.split(' ')[0]}! This is ${t.name} about your request #${r.no}: ${r.carName} from ${fmtDate(r.start)}.`)}>WhatsApp guest <Arrow /></a>}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function Fleet({ db }: { db: Db }) {
  return (
    <section className="panel fleet-tbl">
      <h2 className="cab-h">Fleet & prices</h2>
      <p className="mut small">Changes show on the website right away. Hidden cars disappear from the catalog and the calculator.</p>
      {db.fleet.map((f) => {
        const c = carOf(f.id)
        const num = (k: 'day' | 'month' | 'deposit', label: string) => (
          <label className="fld num"><span className="lbl">{label}</span>
            <input className="field" type="number" min={0} step={1} inputMode="numeric" defaultValue={f[k]}
              onBlur={(e) => { const v = Math.max(0, Math.round(Number(e.target.value) || 0)); e.target.value = String(v); updateFleet(f.id, { [k]: v }) }} />
          </label>
        )
        return (
          <div className={`frow${f.available ? '' : ' off'}`} key={f.id}>
            <div className="pic"><CarArt car={c} /></div>
            <div className="fname"><b>{c.name}</b><span className="mut small">{c.cls} · {c.seats} seats</span></div>
            {num('day', 'AED / day')}
            {num('month', 'AED / month')}
            {num('deposit', 'Deposit')}
            <label className="ck-row avail"><span className="small">{f.available ? 'On site' : 'Hidden'}</span>
              <input type="checkbox" checked={f.available} onChange={(e) => updateFleet(f.id, { available: e.target.checked })} aria-label={`${c.name} on site`} /></label>
          </div>
        )
      })}
    </section>
  )
}

function Customers({ t, db }: { t: Tenant; db: Db }) {
  const rows = db.users.filter((u) => u.role === 'guest').map((u) => {
    const rs = db.requests.filter((r) => r.userId === u.id)
    const spent = rs.filter((r) => r.status === 'done' || r.status === 'active' || r.status === 'confirmed').reduce((a, r) => a + r.total, 0)
    const last = rs.map((r) => r.start).sort().pop()
    return { u, n: rs.length, spent, last }
  }).sort((a, b) => b.spent - a.spent)
  return (
    <section className="panel">
      <h2 className="cab-h">Customers <span className="mut">{rows.length}</span></h2>
      <div className="tbl" role="table" aria-label="Customers">
        <div className="tr th" role="row"><span role="columnheader">Name</span><span role="columnheader">Contact</span><span role="columnheader">Bookings</span><span role="columnheader">Spent</span><span role="columnheader">Last</span><span /></div>
        {rows.map(({ u, n, spent, last }) => (
          <div className="tr" role="row" key={u.id}>
            <span role="cell"><b>{u.name}</b></span>
            <span role="cell" className="mut small">{u.phone}<br />{u.email}</span>
            <span role="cell">{n}</span>
            <span role="cell">{aed(spent)}</span>
            <span role="cell" className="mut small">{last ? fmtDate(last) : '—'}</span>
            <span role="cell"><a className="btn btn-line sm" href={wa(u.phone.replace(/\D/g, ''), `Hello ${u.name.split(' ')[0]}! This is ${t.name}.`)} target="_blank" rel="noopener"><Ico d={I.phone} /></a></span>
          </div>
        ))}
      </div>
    </section>
  )
}
