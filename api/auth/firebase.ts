import { readUsers, writeUsers } from '../_utils/storage'

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') { res.status(405).end(); return }
  try {
    const { idToken } = req.body || {}
    if (!idToken) { res.status(400).json({ error: 'idToken required' }); return }
    let info: any = null
    try {
      const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      const r = await fetch(verifyUrl)
      if (r.ok) info = await r.json()
    } catch {}
    if (!info) {
      try {
        const parts = String(idToken).split('.')
        if (parts.length === 3) {
          const payload = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
          info = JSON.parse(payload)
        }
      } catch {}
    }
    const email = info && (info.email || info.user_id || info.sub ? (info.email || '') : '')
    const displayName = info && (info.name || info.displayName)
    const picture = info && (info.picture || '')
    const name = displayName || (email ? email.split('@')[0] : 'User')
    if (!email) { res.status(400).json({ error: 'email_missing' }); return }
    const users = await readUsers()
    let user = users.find((u: any) => u.email === email)
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        fullName: name,
        email,
        phone: '',
        city: '',
        avatarUrl: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
        vehicles: []
      }
      users.push(user)
      await writeUsers(users)
    }
    res.json(user)
  } catch (e) {
    res.status(500).json({ error: 'auth_failed' })
  }
}