import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'

export type Option = { value: string; label: string; hint?: string }

// Styled dropdown that replaces the native <select>: glass button + popover listbox.
export function Select({ id, value, options, onChange }: { id: string; value: string; options: Option[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()
  const cur = options.find((o) => o.value === value) ?? options[0]

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  const show = () => { setActive(Math.max(0, options.indexOf(cur))); setOpen(true) }
  const choose = (i: number) => { onChange(options[i].value); setOpen(false) }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') return setOpen(false)
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      if (!open) return show()
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (open) choose(active)
      else show()
    }
  }

  return (
    <div className={open ? 'sel open' : 'sel'} ref={root}>
      <button type="button" id={id} className="field sel-btn" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        onClick={() => (open ? setOpen(false) : show())} onKeyDown={onKey}>
        <span className="sel-cur">{cur.label}{cur.hint ? <small>{cur.hint}</small> : null}</span>
        <svg className="sel-chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      {open ? (
        <ul className="sel-list" role="listbox" id={listId} aria-labelledby={id}>
          {options.map((o, i) => (
            <li key={o.value} role="option" aria-selected={o.value === cur.value} className={i === active ? 'act' : undefined}
              onMouseEnter={() => setActive(i)} onMouseDown={(e) => { e.preventDefault(); choose(i) }}>
              <span>{o.label}{o.hint ? <small>{o.hint}</small> : null}</span>
              {o.value === cur.value ? <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="m3 7.5 2.5 2.5L11 4.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
