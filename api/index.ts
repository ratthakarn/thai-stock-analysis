import { createRequire } from 'module'
const _require = createRequire(import.meta.url)
const bundle = _require('./server-bundle.cjs') as { default?: unknown }
export default bundle.default ?? bundle
