import { readOrders, writeOrders, readTokens } from '../../_utils/storage'
import { sendPush } from '../../_utils/push'

export default async function handler(req: any, res: any) {
  if (req.method !== 'PATCH') { res.status(405).end(); return }
  const { id } = req.query
  const { status } = req.body || {}
  const orders = await readOrders()
  const idx = orders.findIndex((o: any) => o.id === String(id))
  if (idx === -1) { res.status(404).json({ error: 'not_found' }); return }
  orders[idx] = { ...orders[idx], status }
  await writeOrders(orders)
  try {
    const tokens = await readTokens()
    await sendPush(tokens.map((t: any) => t.token), { title: 'Order Updated', body: `Order ${String(id)} is now ${status}` })
  } catch {}
  res.json(orders[idx])
}