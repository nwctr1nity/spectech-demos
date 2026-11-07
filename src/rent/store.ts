// Demo backend for the rental sites: accounts, booking requests and fleet settings.
// Everything lives in this browser's localStorage, one database per tenant, so a
// prospect can try the whole flow without a server. The functions are async and
// shaped like API calls, so they can be swapped for a real backend (Supabase) on sale.
import { useSyncExternalStore } from 'react'
import { CARS, type Car, type Tenant } from './data'

export type Role = 'guest' | 'owner'
export type User = { id: string; role: Role; name: string; email: string; phone: string; pass: string; created: string }
export type Status = 'new' | 'confirmed' | 'active' | 'done' | 'cancelled'
export type Request = {
  id: string; no: number; userId: string; carId: string; carName: string
  start: string; days: number; delivery: string; cover: string
  total: number; deposit: number; status: Status; created: string; note?: string
}
export type FleetItem = { id: string; day: number; month: number; deposit: number; available: boolean }
type Db = { v: 1; users: User[]; requests: Request[]; fleet: FleetItem[]; session?: string; seq: number }

export const STATUS: Record<Status, string> = {
  new: 'New', confirmed: 'Confirmed', active: 'Car handed over', done: 'Completed', cancelled: 'Cancelled',
}

let slug = ''
let db: Db | undefined
const subs = new Set<() => void>()
const key = () => `rent:${slug}:db`
const uid = () => Math.random().toString(36).slice(2, 10)
const iso = (d: Date) => d.toISOString().slice(0, 10)
const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 864e5)

async function hash(email: string, pass: string) {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${pass}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export const ownerLogin = (t: Tenant) => ({ email: `owner@${t.slug}.demo`, pass: 'demo1234' })

/** Example data so the owner panel is not empty on first open. Clearly marked as demo in the UI. */
async function seed(t: Tenant): Promise<Db> {
  const o = ownerLogin(t)
  const now = new Date()
  const guests: [string, string, string][] = [
    ['Anna Petrova', 'anna@example.com', '+971 50 000 0101'],
    ['James Miller', 'james@example.com', '+971 50 000 0102'],
    ['Aigerim Sadykova', 'aigerim@example.com', '+971 50 000 0103'],
    ['Omar Khalid', 'omar@example.com', '+971 50 000 0104'],
  ]
  const users: User[] = [
    { id: 'owner', role: 'owner', name: `${t.short} manager`, email: o.email, phone: t.phone, pass: await hash(o.email, o.pass), created: now.toISOString() },
    ...(await Promise.all(guests.map(async ([name, email, phone], i) => ({
      id: `g${i}`, role: 'guest' as Role, name, email, phone, pass: await hash(email, 'demo1234'), created: addDays(now, -20 + i).toISOString(),
    })))),
  ]
  const fleet = t.fleet.map((id) => { const c = CARS.find((x) => x.id === id)!; return { id, day: c.day, month: c.month, deposit: c.deposit, available: true } })
  const pick = (i: number) => fleet[i % fleet.length]
  const plan: [number, number, number, Status, string, number][] = [
    // guest, car, start offset, status, delivery, days
    [0, 3, 1, 'new', 'Dubai Airport (DXB)', 5],
    [1, 1, 0, 'new', 'Delivery anywhere in Dubai', 3],
    [2, 4, 2, 'confirmed', 'Pick up at our office', 7],
    [3, 0, -2, 'active', 'Delivery anywhere in Dubai', 4],
    [0, 2, -12, 'done', 'Pick up at our office', 2],
    [1, 5, -6, 'cancelled', 'Dubai Airport (DXB)', 1],
  ]
  const fee: Record<string, number> = { 'Pick up at our office': 0, 'Delivery anywhere in Dubai': 50, 'Dubai Airport (DXB)': 100 }
  const requests: Request[] = plan.map(([g, c, off, status, delivery, days], i) => {
    const f = pick(c); const car = CARS.find((x) => x.id === f.id)!
    const perDay = days >= 7 ? f.day * 0.85 : f.day
    return {
      id: uid(), no: 1001 + i, userId: `g${g}`, carId: f.id, carName: car.name, start: iso(addDays(now, off)), days, delivery,
      cover: 'Basic insurance', total: Math.round(perDay * days + fee[delivery]), deposit: t.noDeposit ? 0 : f.deposit, status,
      created: addDays(now, off - 3).toISOString(),
    }
  })
  return { v: 1, users, requests, fleet, seq: 1001 + plan.length }
}

function save() {
  db = { ...db! } // new reference so React sees the change
  try { localStorage.setItem(key(), JSON.stringify(db)) } catch { /* private mode: keep in memory */ }
  subs.forEach((f) => f())
}

/** Load (or create) this tenant's demo database. Call once on page start. */
export async function initStore(t: Tenant) {
  slug = t.slug
  try { const raw = localStorage.getItem(key()); if (raw) db = JSON.parse(raw) as Db } catch { db = undefined }
  if (!db || db.v !== 1) { db = await seed(t); save() }
  // Cars added to the template later show up in the fleet table.
  for (const id of t.fleet) if (!db.fleet.some((f) => f.id === id)) {
    const c = CARS.find((x) => x.id === id)!; db.fleet.push({ id, day: c.day, month: c.month, deposit: c.deposit, available: true })
  }
  window.addEventListener('storage', (e) => { if (e.key === key() && e.newValue) { db = JSON.parse(e.newValue); subs.forEach((f) => f()) } })
  subs.forEach((f) => f())
}

export async function resetDemo(t: Tenant) { db = await seed(t); save() }

let snap: { db?: Db } = {}
function getSnap() { if (snap.db !== db) snap = { db }; return snap }
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }
/** React hook: re-renders on any change, also from other tabs. */
export function useDb() { return useSyncExternalStore(subscribe, getSnap).db }

export const me = (d = db) => d?.users.find((u) => u.id === d.session)

export class AuthError extends Error {}

export async function signIn(email: string, pass: string) {
  const u = db!.users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
  if (!u || u.pass !== (await hash(u.email, pass))) throw new AuthError('Wrong email or password.')
  db!.session = u.id; save(); return u
}

export async function signUp(name: string, email: string, phone: string, pass: string) {
  const e = email.trim().toLowerCase()
  if (db!.users.some((x) => x.email.toLowerCase() === e)) throw new AuthError('This email already has an account. Sign in instead.')
  const u: User = { id: uid(), role: 'guest', name: name.trim(), email: e, phone: phone.trim(), pass: await hash(e, pass), created: new Date().toISOString() }
  db!.users.push(u); db!.session = u.id; save(); return u
}

export function signOut() { db!.session = undefined; save() }

export function updateProfile(patch: Pick<User, 'name' | 'phone'>) {
  const u = me(); if (!u) return
  Object.assign(u, patch); save()
}

export function createRequest(r: Omit<Request, 'id' | 'no' | 'userId' | 'status' | 'created'>) {
  const u = me(); if (!u) throw new AuthError('Sign in first.')
  const req: Request = { ...r, id: uid(), no: ++db!.seq, userId: u.id, status: 'new', created: new Date().toISOString() }
  db!.requests.unshift(req); save(); return req
}

export function setStatus(id: string, status: Status) {
  const r = db!.requests.find((x) => x.id === id); if (!r) return
  const u = me()
  // Guests may only cancel their own new requests.
  if (u?.role !== 'owner' && !(r.userId === u?.id && r.status === 'new' && status === 'cancelled')) return
  r.status = status; save()
}

export function setNote(id: string, note: string) {
  if (me()?.role !== 'owner') return
  const r = db!.requests.find((x) => x.id === id); if (r) { r.note = note; save() }
}

export function updateFleet(id: string, patch: Partial<Omit<FleetItem, 'id'>>) {
  if (me()?.role !== 'owner') return
  const f = db!.fleet.find((x) => x.id === id); if (f) { Object.assign(f, patch); save() }
}

/** Public catalog: template cars with the owner's prices; hidden cars left out. */
export function liveFleet(t: Tenant, d = db): Car[] {
  return t.fleet.map((id) => {
    const c = CARS.find((x) => x.id === id)!
    const f = d?.fleet.find((x) => x.id === id)
    return f ? { ...c, day: f.day, month: f.month, deposit: f.deposit, available: f.available } : c
  }).filter((c) => (c as Car & { available?: boolean }).available !== false)
}

export const endDate = (start: string, days: number) => iso(addDays(new Date(start + 'T00:00:00'), days))
export const today = () => iso(new Date())
export const fmtDate = (s: string) => new Date(s + (s.length === 10 ? 'T00:00:00' : '')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
