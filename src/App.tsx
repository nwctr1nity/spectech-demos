import { useEffect, useState, type FormEvent } from 'react'
import { Calculator } from './Calculator'
import { TENANTS, fmtN, tenantFromPath, waLink, type Tenant } from './data'

const P = import.meta.env.BASE_URL
const img = (name: string, sm = false) => `${P}photos/${name}${sm ? '-sm' : ''}.webp`

function Logo({ t }: { t: Tenant }) {
  return (
    <span className="logo" aria-label={t.name}>
      <b>{t.logo[0]}</b>
      <i>{t.logo[1]}</i>
    </span>
  )
}

function Phones({ t, big = false }: { t: Tenant; big?: boolean }) {
  return (
    <div className={big ? 'phones big' : 'phones'}>
      {t.phones.map((p) => (
        <a key={p.tel} href={`tel:${p.tel}`}>{p.display}</a>
      ))}
    </div>
  )
}

function ContactForm({ t }: { t: Tenant }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = `Здравствуйте! Меня зовут ${name || '—'}, телефон ${phone || '—'}. Перезвоните, пожалуйста, нужна техника.`
    window.open(waLink(t.whatsapp, text), '_blank', 'noopener')
  }
  return (
    <form className="form" onSubmit={submit}>
      <input className="field" placeholder="Имя" autoComplete="name" aria-label="Имя" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="field" placeholder="Телефон" type="tel" autoComplete="tel" aria-label="Телефон" required value={phone} onChange={(e) => setPhone(e.target.value)} />
      <button className="btn btn-acc" type="submit">Перезвоните мне</button>
      <p className="note">Заявка откроется в WhatsApp. Нажимая кнопку, вы соглашаетесь на обработку персональных данных.</p>
    </form>
  )
}

function Index() {
  return (
    <div className="page">
      <div className="empty">
        <h1>Демо-сайты</h1>
        {TENANTS.map((t) => (
          <a key={t.slug} href={`${P}s/${t.slug}/`}>{t.name}</a>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const t = tenantFromPath(location.pathname)
  const [machineId, setMachineId] = useState(t?.machines[0].id ?? '')

  useEffect(() => {
    if (t) document.title = `${t.name}: аренда спецтехники в Астане`
  }, [t])

  if (!t) return <Index />

  const [P1] = t.phones
  const pick = (id: string) => {
    setMachineId(id)
    document.getElementById('calc')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }
  const second = t.machines.find((m) => m.photo !== t.hero) ?? t.machines[1] ?? t.machines[0]
  const minRate = Math.min(...t.machines.map((m) => m.rate))

  return (
    <div className="page">
      <div className="demo-bar">Демо-версия сайта для {t.name}. Цены примерные, их легко поменять.</div>
      <div className="grid-bg" aria-hidden="true" />
      <div className="wrap">
        <header className="nav">
          <a href="#top" aria-label="На главную"><Logo t={t} /></a>
          <nav className="links" aria-label="Разделы">
            <a href="#fleet">Техника</a>
            <a href="#how">Как заказать</a>
            <a href="#contacts">Контакты</a>
          </nav>
          <div className="right">
            <a className="hide-s" href={`tel:${P1.tel}`}>{P1.display}</a>
            <a className="btn btn-small btn-acc" href={waLink(t.whatsapp, 'Здравствуйте! Нужна техника.')} target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </header>

        <main id="top">
          <section className="bento" aria-label="Главное">
            <div className="glass tile s2x2 t-hero">
              <img className="hero-img" src={img(t.hero)} alt="" fetchPriority="high" />
              <div className="hero-shade" />
              <span className="eyebrow">{t.eyebrow}</span>
              <h1>{t.h1}</h1>
              <p>{t.lead}</p>
              <div className="acts">
                <a className="btn btn-acc" href="#fleet">Техника</a>
                <a className="btn btn-ghost" href={`tel:${P1.tel}`}>Позвонить</a>
              </div>
            </div>
            <div className="glass tile s2x2">
              <Calculator t={t} machineId={machineId} onMachine={setMachineId} />
            </div>
            {t.rating ? (
              <div className="glass tile t-num"><b>{t.rating.value} ★</b><span>рейтинг в 2ГИС, {t.rating.count} отзывов</span></div>
            ) : null}
            <div className="glass tile t-num"><b>{t.hours === 'круглосуточно' ? '24/7' : t.hours.replace(/^\S+ /, '')}</b><span>{t.hours === 'круглосуточно' ? 'принимаем заказы круглосуточно' : t.hours}</span></div>
            <div className="glass tile t-photo">
              <img className="media" src={img(second.photo, true)} alt={second.name} loading="lazy" />
              <span className="lbl">{second.name}</span>
            </div>
            <div className="glass tile t-num"><b>от {fmtN(minRate)} ₸</b><span>за час работы с оператором</span></div>
          </section>

          <section className="sec" id="fleet">
            <div className="head">
              <h2>Техника</h2>
              <span className="mono mut">цена за час, с оператором</span>
            </div>
            <div className="strip">
              {t.machines.map((m) => (
                <button type="button" className="glass card" key={m.id} onClick={() => pick(m.id)} aria-label={`${m.name}: рассчитать стоимость`}>
                  <div className="tx"><img className="media" src={img(m.photo, true)} alt="" loading="lazy" /></div>
                  <div className="bd">
                    <span className="mono acc">{m.cat} · мин. {m.minHours} ч</span>
                    <h3>{m.name}</h3>
                    <span className="mut small">{m.spec}. {m.use}.</span>
                    <span className="pr">от {fmtN(m.rate)} ₸<small>/ч</small></span>
                    <span className="more">Рассчитать →</span>
                  </div>
                </button>
              ))}
            </div>
            {t.extra ? <p className="glass extra">{t.extra}</p> : null}
          </section>

          <section className="sec" id="how">
            <div className="head"><h2>Как заказать технику</h2></div>
            <ol className="steps">
              <li className="glass"><h3>Заявка</h3><p>Звонок, WhatsApp или форма на сайте. Расскажите, что нужно сделать и где.</p></li>
              <li className="glass"><h3>Подбор</h3><p>Подберём технику под задачу и назовём точную цену и время подачи.</p></li>
              <li className="glass"><h3>Подача</h3><p>Техника с оператором приезжает на объект к согласованному времени.</p></li>
              <li className="glass"><h3>Оплата</h3><p>По факту отработанных часов: {t.payments}.</p></li>
            </ol>
          </section>

          <section className="sec" id="contacts">
            <div className="contact">
              <div className="glass tile t-call">
                <img className="media" src={img(t.machines[t.machines.length - 1].photo, true)} alt="" loading="lazy" />
                <div className="call-shade" />
                <span className="eyebrow">Диспетчер · {t.hours}</span>
                <Phones t={t} big />
                <p className="mut">Астана, {t.address}</p>
                {t.instagram ? <a className="mut" href={t.instagram} target="_blank" rel="noopener">Instagram →</a> : null}
              </div>
              <div className="glass tile">
                <h2 className="form-h">Перезвоним и подберём технику</h2>
                <ContactForm t={t} />
              </div>
            </div>
          </section>
        </main>

        <footer className="foot">
          <Logo t={t} />
          <span className="mut">© {new Date().getFullYear()} {t.name}. Аренда спецтехники в Астане.</span>
          <Phones t={t} />
        </footer>
      </div>
    </div>
  )
}
