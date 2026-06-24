// Pre-bundled server (see esbuild.server.mjs) — avoids Vercel TypeScript bundling issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const app = require('./server-bundle.cjs')
export default app.default ?? app
