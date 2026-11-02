import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// Writes dist/s/<slug>/index.html for every tenant, so each demo is a real static page
// and works on any host without rewrite rules.
function tenantPages(): Plugin {
  return {
    name: 'tenant-pages',
    apply: 'build',
    closeBundle() {
      const src = readFileSync('src/data.ts', 'utf8')
      const html = readFileSync('dist/index.html', 'utf8')
      const re = /slug: '([^']+)',[\s\S]*?name: '([^']+)'/g
      for (const [, slug, name] of src.matchAll(re)) {
        mkdirSync(`dist/s/${slug}`, { recursive: true })
        const page = html.replace(/<title>[^<]*<\/title>/, `<title>${name}: аренда спецтехники в Астане</title>`)
        writeFileSync(`dist/s/${slug}/index.html`, page)
      }
    },
  }
}

export default defineConfig({ base: '/', plugins: [react(), tenantPages()] })
