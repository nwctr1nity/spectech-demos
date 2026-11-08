// Demo backend for the salon sites: accounts, appointments and the price list.
// Lives in this browser's localStorage, one database per salon, so a prospect can try
// booking, the client account and the owner panel without a server. Async-free and
// API-shaped so it can be swapped for a real backend (Supabase) on sale.
import { useSyncExternalStore } from 'react'
import { SERVICES, type Service, type Tenant } from './data'

export type Role = 'guest' | 'owner'
export type User = { id: string; role: Role; name: string; email: string; phone: string; pass: string; created: string }
export type Status = 'new' | 'confirmed' | 'done' | 'noshow' | 'cancelled'
export type Appt = {
  id: string; no: number; userId: string; services: string[]; title: string; masterId: string
  date: string; start: number; mins: number; price: number; status: Status; created: string; note?: string
}
export type PriceItem = { id: string; price: number; mins: number; available: boolean }
type Db = { v: 1; users: User[]; appts: Appt[]; prices: PriceItem[]; session?: string; seq: number }

export const STATUS: Record<Status, string> = { new: 'New', confirmed: 'Confirmed', done: 'Completed', noshow: 'No-show', cancelled: 'Cancelled' }
export const SLOT = 30

let slug = ''
let db: Db | undefined
const subs = new Set<() => void>()
const key = () => `nails:${slug}:db`
const uid = () => Math.random().toString(36).slice(2, 10)
export const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const today = () => iso(new Date())
export const addDays = (s: string, n: number) => { const d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return iso(d) }
export const fmtDay = (s: string) => new Date(s + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })

async function hash(email: string, pass: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${email.toLowerCase()}:${pass}`))
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}
export const ownerLogin = (t: Tenant) => ({ email: `owner@${t.slug}.demo`, pass: 'demo1234' })

async function seed(t: Tenant): Promise<Db> {
  const o = ownerLogin(t)
  const now = new Date().toISOString()
  const guests: [string, string, string][] = [
    ['Anna Petrova', 'anna@example.com', '+971 50 000 0101'], ['Laura Smith', 'laura@example.com', '+971 50 000 0102'],
    ['Dana Akhmetova', 'dana@example.com', '+971 50 000 0103'], ['Mariam Hassan', 'mariam@example.com', '+971 50 000 0104'],
    ['Olga Ivanova', 'olga@example.com', '+971 50 000 0105'],
  ]
  const users: User[] = [
    { id: 'owner', role: 'owner', name: `${t.short} manager`, email: o.email, phone: t.phone, pass: await hash(o.email, o.pass), created: now },
    ...(await Promise.all(guests.map(async ([name, email, phone], i) => ({ id: `g${i}`, role: 'guest' as Role, name, email, phone, pass: await hash(email, 'demo1234'), created: now })))),
  ]
  const prices = t.services.map((id) => { const s = SERVICES.find((x) => x.id === id)!; return { id, price: s.price, mins: s.mins, available: true } })
  const d0 = today()
  const m = t.masters.map((x) => x.id)
  // guest, services, master index, day offset, start hour, status
  const plan: [number, string[], number, number, number, Status][] = [
    [0, ['mani-gel'], 0, 0, t.open + 1, 'confirmed'],
    [1, ['mani-pedi'], 1, 0, t.open + 2, 'confirmed'],
    [2, ['lash-volume'], 2 % m.length, 0, t.open + 4, 'confirmed'],
    [3, ['mani-russian'], 0, 0, t.open + 5, 'confirmed'],
    [4, ['ext-gel'], 1, 0, t.open + 6, 'new'],
    [1, ['mani-french', 'pedi-gel'], 0, 1, t.open + 3, 'new'],
    [2, ['brows'], 2 % m.length, 1, t.open + 7, 'confirmed'],
    [0, ['mani-gel', 'remove'], 1, -7, t.open + 2, 'done'],
    [3, ['pedi-classic'], 0, -3, t.open + 5, 'noshow'],
    [4, ['lash-lift'], 2 % m.length, -2, t.open + 1, 'cancelled'],
  ]
  const appts: Appt[] = plan.map(([g, ids, mi, off, h, status], i) => {
    const ss = ids.map((id) => SERVICES.find((s) => s.id === id)!)
    return {
      id: uid(), no: 501 + i, userId: `g${g}`, services: ids, title: ss.map((s) => s.name).join(' + '), masterId: m[mi],
      date: addDays(d0, off), start: h * 60, mins: ss.reduce((a, s) => a + s.mins, 0), price: ss.reduce((a, s) => a + s.price, 0),
      status, created: now,
    }
  })
  return { v: 1, users, appts, prices, seq: 501 + plan.length }
}

function save() {
  db = { ...db! }
  try { localStorage.setItem(key(), JSON.stringify(db)) } catch { /* private mode: keep in memory */ }
  subs.forEach((f) => f())
}

export async function initStore(t: Tenant) {
  slug = t.slug
  try { const raw = localStorage.getItem(key()); if (raw) db = JSON.parse(raw) as Db } catch { db = undefined }
  if (!db || db.v !== 1) { db = await seed(t); save() }
  for (const id of t.services) if (!db.prices.some((p) => p.id === id)) {
    const s = SERVICES.find((x) => x.id === id)!; db.prices.push({ id, price: s.price, mins: s.mins, available: true })
  }
  window.addEventListener('storage', (e) => { if (e.key === key() && e.newValue) { db = JSON.parse(e.newValue); subs.forEach((f) => f()) } })
  subs.forEach((f) => f())
}
export async function resetDemo(t: Tenant) { db = await seed(t); save() }

let snap: { db?: Db } = {}
const getSnap = () => { if (snap.db !== db) snap = { db }; return snap }
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f) } }
export function useDb() { return useSyncExternalStore(subscribe, getSnap).db }
export type DbT = Db

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
export function updateProfile(p: Pick<User, 'name' | 'phone'>) { const u = me(); if (u) { Object.assign(u, p); save() } }

/** Services as shown on the site: template service with the owner's price and duration. */
export function livePrices(t: Tenant, d = db): (Service & { available: boolean })[] {
  return t.services.map((id) => {
    const s = SERVICES.find((x) => x.id === id)!
    const p = d?.prices.find((x) => x.id === id)
    return { ...s, price: p?.price ?? s.price, mins: p?.mins ?? s.mins, available: p?.available ?? true }
  })
}

const busy = (d: Db, date: string, masterId: string, start: number, mins: number, skip?: string) =>
  d.appts.some((a) => a.id !== skip && a.masterId === masterId && a.date === date && a.status !== 'cancelled' && a.status !== 'noshow'
    && start < a.start + a.mins && a.start < start + mins)

/** Start times (minutes from midnight) where the master (or any master) is free for `mins`. */
export function freeSlots(t: Tenant, d: Db, date: string, masterId: string | 'any', mins: number) {
  const masters = masterId === 'any' ? t.masters.map((m) => m.id) : [masterId]
  const nowMin = date === today() ? new Date().getHours() * 60 + new Date().getMinutes() + 30 : -1
  const out: { start: number; master: string }[] = []
  for (let s = t.open * 60; s + mins <= t.close * 60; s += SLOT) {
    if (s < nowMin) continue
    const m = masters.find((id) => !busy(d, date, id, s, mins))
    if (m) out.push({ start: s, master: m })
  }
  return out
}

export function createAppt(a: Omit<Appt, 'id' | 'no' | 'userId' | 'status' | 'created'>) {
  const u = me(); if (!u) throw new AuthError('Sign in first.')
  if (busy(db!, a.date, a.masterId, a.start, a.mins)) throw new AuthError('This time was just taken. Please pick another one.')
  const appt: Appt = { ...a, id: uid(), no: ++db!.seq, userId: u.id, status: 'new', created: new Date().toISOString() }
  db!.appts.unshift(appt); save(); return appt
}
export function setStatus(id: string, status: Status) {
  const a = db!.appts.find((x) => x.id === id); if (!a) return
  const u = me()
  if (u?.role !== 'owner' && !(a.userId === u?.id && (a.status === 'new' || a.status === 'confirmed') && status === 'cancelled')) return
  a.status = status; save()
}
export function setNote(id: string, note: string) { if (me()?.role !== 'owner') return; const a = db!.appts.find((x) => x.id === id); if (a) { a.note = note; save() } }
export function updatePrice(id: string, patch: Partial<Omit<PriceItem, 'id'>>) {
  if (me()?.role !== 'owner') return
  const p = db!.prices.find((x) => x.id === id); if (p) { Object.assign(p, patch); save() }
}
