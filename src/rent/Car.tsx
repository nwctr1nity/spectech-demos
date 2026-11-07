import type { Car } from './data'

// AI-generated studio photos in public/cars/<id>{,-sm}.webp: side profile, facing left, black studio.
export function CarArt({ car, className, hero = false }: { car: Pick<Car, 'id' | 'name'>; className?: string; hero?: boolean }) {
  const wide = hero && car.id === 'p911'
  const base = `/cars/${wide ? 'hero-911' : car.id}`
  const [sm, lg] = wide ? [900, 1600] : [640, 1200]
  return (
    <img className={[className, hero && !wide && 'narrow'].filter(Boolean).join(' ') || undefined} src={`${base}.webp`} srcSet={`${base}-sm.webp ${sm}w, ${base}.webp ${lg}w`}
      sizes={hero ? '(max-width: 1100px) 100vw, 1100px' : '(max-width: 600px) 100vw, 420px'}
      width={wide ? 1600 : 1200} height={wide ? 661 : 800} alt={car.name}
      loading={hero ? 'eager' : 'lazy'} decoding="async" />
  )
}
