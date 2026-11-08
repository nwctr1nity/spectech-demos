import { useEffect, useState } from 'react'
import { applyConsent, readConsent, saveConsent, type Trackers } from './consent'

export function Cookies({ trackers }: { trackers: Trackers }) {
  const [open, setOpen] = useState(() => !readConsent())
  const [more, setMore] = useState(false)
  const prev = readConsent()
  const [analytics, setAnalytics] = useState(prev?.analytics ?? false)
  const [marketing, setMarketing] = useState(prev?.marketing ?? false)

  useEffect(() => {
    applyConsent(readConsent(), trackers)
    const reopen = () => { setMore(true); setOpen(true) }
    window.addEventListener('cookie-settings', reopen)
    return () => window.removeEventListener('cookie-settings', reopen)
  }, [trackers])

  if (!open) return null
  const done = (a: boolean, m: boolean) => {
    const hadTrackers = prev && (prev.analytics || prev.marketing)
    const c = saveConsent(a, m)
    setOpen(false)
    // Turning trackers off needs a reload to unload scripts that already ran.
    if (hadTrackers && (!a || !m)) location.reload(); else applyConsent(c, trackers)
  }

  return (
    <div className="cookies" role="dialog" aria-modal="false" aria-labelledby="ck-t">
      <div>
        <h2 id="ck-t">Cookies</h2>
        <p>We use necessary cookies to remember your choices. With your permission we also measure visits and show our offers in ads.</p>
      </div>
      {more && (
        <div className="ck-opts">
          <label className="ck-row"><span><b>Necessary</b><small>Your cookie choice and your last selection. Always on.</small></span><input type="checkbox" checked disabled /></label>
          <label className="ck-row"><span><b>Analytics</b><small>Anonymous visit stats to improve the site.</small></span><input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} /></label>
          <label className="ck-row"><span><b>Marketing</b><small>Show you our cars in Instagram and Facebook ads.</small></span><input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} /></label>
        </div>
      )}
      <div className="ck-btns">
        {more
          ? <button type="button" className="btn btn-line" onClick={() => done(analytics, marketing)}>Save choices</button>
          : <button type="button" className="ck-link" onClick={() => setMore(true)}>Settings</button>}
        <button type="button" className="btn btn-line" onClick={() => done(false, false)}>Necessary only</button>
        <button type="button" className="btn btn-light" onClick={() => done(true, true)}>Accept all</button>
      </div>
    </div>
  )
}
