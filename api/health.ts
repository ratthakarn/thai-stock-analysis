import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { default: app } = await import('../server/app')
    res.json({ ok: true, hasApp: typeof app === 'function', env: !!process.env.ANTHROPIC_API_KEY })
  } catch (e: unknown) {
    const err = e as Error
    res.status(500).json({ error: err.message, stack: err.stack?.slice(0, 500) })
  }
}
