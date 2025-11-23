import { readUsers, writeUsers } from '../_utils/storage'

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const { email } = req.query
    if (!email) { res.status(400).json({ error: 'email required' }); return }
    const users = await readUsers()
    const user = users.find((u: any) => u.email === email)
    if (!user) { res.status(404).json({ error: 'not_found' }); return }
    res.json(user)
    return
  }
  if (req.method === 'PATCH') {
    const { email } = req.query
    const payload = req.body || {}
    if (!email) { res.status(400).json({ error: 'email required' }); return }
    const users = await readUsers()
    const idx = users.findIndex((u: any) => u.email === email)
    if (idx === -1) { res.status(404).json({ error: 'not_found' }); return }
    users[idx] = { ...users[idx], ...payload }
    await writeUsers(users)
    res.json(users[idx])
    return
  }
  res.status(405).end()
}