import { readTokens } from '../_utils/storage'
import { sendPush } from '../_utils/push'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).end(); return }
  const { token } = req.body || {}
  try {
    const list = token ? [token] : (await readTokens()).map((t: any) => t.token)
    await sendPush(list, { title: 'FuelFriendly', body: 'Test notification' })
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ error: 'push_failed' })
  }
}