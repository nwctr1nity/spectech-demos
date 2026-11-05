import { useId } from 'react'
import type { Body, Car } from './data'

// Drawn side-view cars (no stock photos available): monochrome studio look, facing left.
const SHAPES: Record<Body, { body: string; glass: string; pillars: number[]; wheels: [number, number]; r: number }> = {
  coupe: {
    body: 'M30,212 C28,196 40,186 62,182 L170,168 C215,160 250,146 290,124 C330,102 372,92 430,90 C500,88 560,98 610,122 C640,136 672,150 712,156 C748,161 768,172 772,194 L774,214 C774,222 768,228 758,228 L668,228 A58,58 0 0 0 552,228 L248,228 A58,58 0 0 0 132,228 L48,228 C38,228 31,222 30,212 Z',
    glass: 'M300,128 C335,108 375,100 428,99 C480,98 528,105 566,124 L582,136 C500,138 400,138 318,140 Z',
    pillars: [462], wheels: [190, 610], r: 46,
  },
  sedan: {
    body: 'M30,214 C28,198 38,188 62,184 L178,170 C210,164 240,150 272,128 C305,106 345,96 410,94 C480,92 530,100 568,124 C590,138 610,150 640,156 L726,166 C752,170 768,180 770,198 L772,214 C772,222 766,228 756,228 L668,228 A58,58 0 0 0 552,228 L248,228 A58,58 0 0 0 132,228 L46,228 C37,228 31,222 30,214 Z',
    glass: 'M286,132 C315,112 352,104 408,103 C466,102 512,108 548,128 L560,140 L300,142 Z',
    pillars: [424], wheels: [190, 610], r: 46,
  },
  suv: {
    body: 'M30,214 L32,138 C34,124 46,118 66,116 L236,108 C258,92 284,74 306,64 C318,58 334,56 354,56 L640,58 C664,58 678,64 690,78 L744,128 C760,134 770,148 770,166 L772,214 C772,222 766,228 756,228 L672,228 A62,62 0 0 0 548,228 L254,228 A62,62 0 0 0 130,228 L44,228 C36,228 30,222 30,214 Z',
    glass: 'M266,110 L312,74 C322,68 334,66 350,66 L628,68 C642,68 652,74 660,84 L700,124 Z',
    pillars: [446, 580], wheels: [192, 610], r: 52,
  },
}

const PAINT: Record<Car['paint'], string[]> = {
  silver: ['#fbfbfb', '#d3d5d8', '#80848a', '#232528'],
  white: ['#ffffff', '#ececee', '#aeb2b7', '#36383c'],
  graphite: ['#a3a8ae', '#5d6269', '#2e3136', '#0f1012'],
  black: ['#74777c', '#2c2e32', '#141517', '#050506'],
}

function Wheel({ cx, cy, r, id }: { cx: number; cy: number; r: number; id: string }) {
  const spokes = Array.from({ length: 10 }, (_, i) => (i * 36 * Math.PI) / 180)
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#0a0a0b" />
      <circle cx={cx} cy={cy} r={r * 0.74} fill={`url(#${id}-rim)`} />
      {spokes.map((a, i) => (
        <line key={i} x1={cx + Math.cos(a) * r * 0.2} y1={cy + Math.sin(a) * r * 0.2} x2={cx + Math.cos(a) * r * 0.7} y2={cy + Math.sin(a) * r * 0.7}
          stroke="#1b1c1e" strokeWidth={i % 2 ? 2 : 5} strokeLinecap="round" />
      ))}
      <circle cx={cx} cy={cy} r={r * 0.74} fill="none" stroke="#000" strokeOpacity=".5" strokeWidth="3" />
      <circle cx={cx} cy={cy} r={r * 0.15} fill="#1e1f21" stroke="#9a9da2" strokeWidth="1.5" />
    </g>
  )
}

export function CarArt({ car, className }: { car: Pick<Car, 'body' | 'paint'>; className?: string }) {
  const id = useId().replace(/:/g, '')
  const s = SHAPES[car.body]
  const p = PAINT[car.paint]
  const [w1, w2] = s.wheels
  return (
    <svg className={className} viewBox="0 0 800 290" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0" stopColor={p[0]} />
          <stop offset=".38" stopColor={p[1]} />
          <stop offset=".7" stopColor={p[2]} />
          <stop offset="1" stopColor={p[3]} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b3e43" />
          <stop offset=".45" stopColor="#0d0e10" />
          <stop offset="1" stopColor="#050506" />
        </linearGradient>
        <radialGradient id={`${id}-rim`} cx=".4" cy=".35" r=".8">
          <stop offset="0" stopColor="#f0f0f1" />
          <stop offset=".5" stopColor="#8c9095" />
          <stop offset="1" stopColor="#2a2b2e" />
        </radialGradient>
        <clipPath id={`${id}-gc`}><path d={s.glass} /></clipPath>
        <filter id={`${id}-blur`} x="-10%" y="-200%" width="120%" height="500%"><feGaussianBlur stdDeviation="8" /></filter>
      </defs>
      <ellipse cx="400" cy="276" rx="360" ry="9" fill="#000" opacity=".85" filter={`url(#${id}-blur)`} />
      <path d={s.body} fill={`url(#${id}-paint)`} />
      <path d={s.glass} fill={`url(#${id}-glass)`} />
      {s.pillars.map((x) => <rect key={x} x={x} y="60" width="9" height="90" fill={p[1]} opacity=".9" clipPath={`url(#${id}-gc)`} />)}
      <path d={s.glass} fill="none" stroke={p[0]} strokeOpacity=".5" strokeWidth="1.5" />
      <path d="M70,190 C260,172 520,166 760,180" fill="none" stroke="#fff" strokeOpacity=".45" strokeWidth="2" />
      <path d="M250,214 L550,214" stroke="#000" strokeOpacity=".35" strokeWidth="6" />
      <path d="M38,198 L96,190 L94,197 L42,205 Z" fill="#fff" opacity=".92" />
      <path d="M752,172 L771,178 L771,188 L755,186 Z" fill="#7d1d1d" opacity=".85" />
      <Wheel cx={w1} cy={228} r={s.r} id={id} />
      <Wheel cx={w2} cy={228} r={s.r} id={id} />
    </svg>
  )
}
