import { readOrders, writeOrders, readTokens } from './_utils/storage'
import { sendPush } from './_utils/push'

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    const orders = await readOrders()
    res.json(orders)
    return
  }
  if (req.method === 'POST') {
    const order = req.body || {}
    const id = `order-${Date.now()}`
    const newOrder = { ...order, id }
    const orders = await readOrders()
    orders.unshift(newOrder)
    await writeOrders(orders)
    try {
      const tokens = await readTokens()
      await sendPush(tokens.map((t: any) => t.token), { title: 'Order Created', body: `Tracking ${newOrder.trackingNo}` })
    } catch {}
    res.status(201).json(newOrder)
    return
  }
  res.status(405).end()
}