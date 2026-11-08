import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Writes a static index.html for every tenant so each demo works on any host without rewrites:
// Astana equipment rental at dist/s/<slug>/, Dubai car rental at dist/rent/<slug>/.
function tenantPages(): Plugin {
  const sets = [
    { data: 'src/data.ts', html: 'dist/index.html', out: 'dist/s', title: (n: string) => `${n}: аренда спецтехники в Астане` },
    { data: 'src/rent/data.ts', html: 'dist/rent/index.html', out: 'dist/rent', title: (n: string) => `${n}: car rental in Dubai` },
    { data: 'src/nails/data.ts', html: 'dist/nails/index.html', out: 'dist/nails', title: (n: string) => `${n}: nails and beauty in Dubai` },
  ]
  return {
    name: 'tenant-pages',
    apply: 'build',
    closeBundle() {
      for (const s of sets) {
        const src = readFileSync(s.data, 'utf8')
        const html = readFileSync(s.html, 'utf8')
        // slug followed by its name ('...' or "..." when the name has an apostrophe)
        const re = /slug: '([^']+)',[\s\S]*?name: (?:'([^']+)'|"([^"]+)")/g
        for (const m of src.matchAll(re)) {
          const slug = m[1], name = (m[2] ?? m[3]).replace(/&/g, '&amp;').replace(/</g, '&lt;')
          mkdirSync(`${s.out}/${slug}`, { recursive: true })
          writeFileSync(`${s.out}/${slug}/index.html`, html.replace(/<title>[^<]*<\/title>/, `<title>${s.title(name)}</title>`))
        }
      }
    },
  }
}

export default defineConfig({
  base: '/',
  plugins: [react(), tenantPages()],
  build: { rollupOptions: { input: { main: 'index.html', rent: 'rent/index.html', nails: 'nails/index.html' } } },
})
