import { useMemo, useState } from 'react'
import { ZONES, fmt, fmtN, quote, waLink, type Tenant } from './data'

export function Calculator({ t, machineId, onMachine }: { t: Tenant; machineId: string; onMachine: (id: string) => void }) {
  const m = t.machines.find((x) => x.id === machineId) ?? t.machines[0]
  const [hours, setHours] = useState(4)
  const [unit, setUnit] = useState<'h' | 'shift'>('h')
  const [zoneId, setZoneId] = useState(ZONES[0].id)
  const z = ZONES.find((x) => x.id === zoneId)!
  const h = Math.max(0, hours || 0) * (unit === 'shift' ? 8 : 1)
  const q = useMemo(() => quote(m, h, z), [m, h, z])

  const order = waLink(
    t.whatsapp,
    `Здравствуйте! Хочу заказать: ${m.name}, ${fmtN(q.paid)} ч.\nАдрес: ${z.name}.\nРасчёт на сайте: ${fmt(q.total)}.`,
  )

  return (
    <div className="calc" id="calc">
      <div className="calc-head">
        <b>Калькулятор аренды</b>
        <span className="mono mut">с оператором</span>
      </div>
      <div>
        <label htmlFor="c-mach">Техника</label>
        <select className="field" id="c-mach" value={m.id} onChange={(e) => onMachine(e.target.value)}>
          {t.machines.map((x) => (
            <option key={x.id} value={x.id}>{x.name}, {x.spec}</option>
          ))}
        </select>
      </div>
      <div className="row2">
        <div>
          <label htmlFor="c-h">Время работы</label>
          <input className="field" id="c-h" type="number" min={1} inputMode="numeric" value={hours}
            onChange={(e) => setHours(Number(e.target.value))} />
        </div>
        <div>
          <span className="label" aria-hidden="true">&nbsp;</span>
          <div className="seg" role="group" aria-label="Единицы">
            <button type="button" aria-pressed={unit === 'h'} onClick={() => setUnit('h')}>ч</button>
            <button type="button" aria-pressed={unit === 'shift'} onClick={() => setUnit('shift')}>смен</button>
          </div>
        </div>
      </div>
      <div>
        <label htmlFor="c-zone">Куда подать</label>
        <select className="field" id="c-zone" value={zoneId} onChange={(e) => setZoneId(e.target.value)}>
          {ZONES.map((x) => (
            <option key={x.id} value={x.id}>{x.name}</option>
          ))}
        </select>
      </div>
      <div className="calc-sum">
        <div>
          <span className="mut">Работа, {fmtN(q.paid)} ч × {fmtN(m.rate)} ₸{q.paid > h ? ` (минимум ${m.minHours} ч)` : ''}</span>
          <span>{fmt(q.work)}</span>
        </div>
        <div><span className="mut">Подача</span><span>{q.delivery ? fmt(q.delivery) : 'включена'}</span></div>
      </div>
      <div className="calc-total" aria-live="polite">
        <span>Итого</span>
        <b>{fmt(q.total)}</b>
      </div>
      <a className="btn btn-acc" href={order} target="_blank" rel="noopener">Заказать в WhatsApp</a>
    </div>
  )
}
