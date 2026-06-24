import { build } from 'esbuild'

await build({
  entryPoints: ['server/app.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  outfile: 'api/server-bundle.cjs',
  // Only externalize truly native modules that can't be bundled
  external: ['playwright', 'playwright-core', 'fsevents'],
  // Suppress "Could not resolve" for optional/conditional peer deps
  logLevel: 'warning',
})

console.log('Server bundle complete: api/server-bundle.cjs')
