import { readTokens, writeTokens } from '../_utils/storage'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).end(); return }
  const { email, token } = req.body || {}
  if (!token) { res.status(400).json({ error: 'token required' }); return }
  const tokens = await readTokens()
  const existingIdx = tokens.findIndex((t: any) => t.token === token)
  if (existingIdx !== -1) {
    tokens[existingIdx] = { email, token }
  } else {
    tokens.push({ email, token })
  }
  await writeTokens(tokens)
  res.json({ ok: true })
}