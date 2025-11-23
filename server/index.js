import express from 'express'
import cors from 'cors'
import fetch from 'node-fetch'
import { promises as fs } from 'fs'
import path from 'path'

const app = express()
app.use(cors())
app.use(express.json())

const dataDir = path.join(process.cwd(), 'server', 'data')
const ordersFile = path.join(dataDir, 'orders.json')
const usersFile = path.join(dataDir, 'users.json')
const tokensFile = path.join(dataDir, 'tokens.json')
const fuelPricesFile = path.join(dataDir, 'fuelPrices.json')

async function ensureData() {
  try { await fs.mkdir(dataDir, { recursive: true }) } catch {}
  try { await fs.access(ordersFile) } catch { await fs.writeFile(ordersFile, '[]', 'utf-8') }
  try { await fs.access(usersFile) } catch { await fs.writeFile(usersFile, '[]', 'utf-8') }
  try { await fs.access(tokensFile) } catch { await fs.writeFile(tokensFile, '[]', 'utf-8') }
}

async function readOrders() {
  await ensureData()
  try {
    const raw = await fs.readFile(ordersFile, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading orders:', e)
    return []
  }
}

async function writeOrders(orders) {
  await ensureData()
  await fs.writeFile(ordersFile, JSON.stringify(orders, null, 2), 'utf-8')
}

async function readUsers() {
  await ensureData()
  try {
    const raw = await fs.readFile(usersFile, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading users:', e)
    return []
  }
}

async function writeUsers(users) {
  await ensureData()
  await fs.writeFile(usersFile, JSON.stringify(users, null, 2), 'utf-8')
}

async function readTokens() {
  await ensureData()
  try {
    const raw = await fs.readFile(tokensFile, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading tokens:', e)
    return []
  }
}

async function writeTokens(tokens) {
  await ensureData()
  await fs.writeFile(tokensFile, JSON.stringify(tokens, null, 2), 'utf-8')
}

async function readFuelPrices() {
  await ensureData()
  try {
    const raw = await fs.readFile(fuelPricesFile, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading fuel prices:', e)
    return []
  }
}

async function writeFuelPrices(fuelPrices) {
  await ensureData()
  await fs.writeFile(fuelPricesFile, JSON.stringify(fuelPrices, null, 2), 'utf-8')
}

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok' })
})

// Auth: verify Firebase ID token via Google tokeninfo and persist user profile
app.post('/api/auth/firebase', async (req, res) => {
  try {
    const { idToken } = req.body || {}
    if (!idToken) {
      res.status(400).json({ error: 'idToken required' })
      return
    }
    let info = null
    try {
      const verifyUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
      const r = await fetch(verifyUrl)
      if (r.ok) {
        info = await r.json()
      }
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
    if (!email) {
      res.status(400).json({ error: 'email_missing' })
      return
    }
    const users = await readUsers()
    let user = users.find(u => u.email === email)
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
    console.error('Auth error:', e)
    res.status(500).json({ error: 'auth_failed' })
  }
})

app.get('/api/user/me', async (req, res) => {
  const { email } = req.query
  if (!email) { res.status(400).json({ error: 'email required' }); return }
  try {
    const users = await readUsers()
    const user = users.find(u => u.email === email)
    if (!user) { res.status(404).json({ error: 'not_found' }); return }
    res.json(user)
  } catch (e) {
    console.error('Error fetching user:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.patch('/api/user/me', async (req, res) => {
  const { email } = req.query
  const payload = req.body || {}
  if (!email) { res.status(400).json({ error: 'email required' }); return }
  try {
    const users = await readUsers()
    const idx = users.findIndex(u => u.email === email)
    if (idx === -1) { res.status(404).json({ error: 'not_found' }); return }
    users[idx] = { ...users[idx], ...payload }
    await writeUsers(users)
    res.json(users[idx])
  } catch (e) {
    console.error('Error updating user:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/stations', async (req, res) => {
  const { lat, lon, radius = 10000 } = req.query
  if (!lat || !lon) {
    res.status(400).json({ error: 'lat and lon required' })
    return
  }
  const query = `[out:json];node[amenity=fuel](around:${radius},${lat},${lon});out;`
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  try {
    const r = await fetch(url)
    if (!r.ok) {
      res.status(r.status).json({ error: r.statusText })
      return
    }
    const data = await r.json()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch stations' })
  }
})

app.get('/api/geocode', async (req, res) => {
  const { q } = req.query
  if (!q) {
    res.status(400).json({ error: 'q required' })
    return
  }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'fuelfriendly' } })
    if (!r.ok) {
      res.status(r.status).json({ error: r.statusText })
      return
    }
    const data = await r.json()
    const item = Array.isArray(data) && data.length ? data[0] : null
    if (!item) {
      res.status(404).json({ error: 'not_found' })
      return
    }
    res.json({ lat: parseFloat(item.lat), lon: parseFloat(item.lon), display_name: item.display_name })
  } catch (e) {
    res.status(500).json({ error: 'failed to geocode' })
  }
})

// Get fuel price history
app.get('/api/fuel-prices/history', async (req, res) => {
  try {
    const { stationId, fuelType } = req.query
    const fuelPrices = await readFuelPrices()
    
    // Filter by station and fuel type if provided
    let filteredPrices = fuelPrices
    if (stationId) {
      filteredPrices = filteredPrices.filter(p => p.stationId === stationId)
    }
    if (fuelType) {
      filteredPrices = filteredPrices.filter(p => p.fuelType === fuelType)
    }
    
    // Sort by date
    filteredPrices.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    res.json(filteredPrices)
  } catch (e) {
    console.error('Error fetching fuel price history:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// Add new fuel price record
app.post('/api/fuel-prices', async (req, res) => {
  try {
    const { stationId, fuelType, price } = req.body
    
    if (!stationId || !fuelType || price === undefined) {
      res.status(400).json({ error: 'stationId, fuelType, and price are required' })
      return
    }
    
    const newRecord = {
      id: `fuel-${Date.now()}`,
      stationId,
      fuelType,
      price: parseFloat(price),
      date: new Date().toISOString()
    }
    
    const fuelPrices = await readFuelPrices()
    fuelPrices.push(newRecord)
    await writeFuelPrices(fuelPrices)
    
    res.status(201).json(newRecord)
  } catch (e) {
    console.error('Error adding fuel price:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await readOrders()
    res.json(orders)
  } catch (e) {
    console.error('Error fetching orders:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.post('/api/orders', async (req, res) => {
  try {
    const order = req.body || {}
    const id = `order-${Date.now()}`
    const newOrder = { ...order, id }
    const orders = await readOrders()
    orders.unshift(newOrder)
    await writeOrders(orders)
    // Try to send push notification if tokens exist
    try {
      const tokens = await readTokens()
      await sendPush(tokens.map(t => t.token), {
        title: 'Order Created',
        body: `Tracking ${newOrder.trackingNo}`
      })
    } catch {}
    res.status(201).json(newOrder)
  } catch (e) {
    console.error('Error creating order:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body || {}
    const orders = await readOrders()
    const idx = orders.findIndex(o => o.id === id)
    if (idx === -1) {
      res.status(404).json({ error: 'not_found' })
      return
    }
    orders[idx] = { ...orders[idx], status }
    await writeOrders(orders)
    // Push notification on status update
    try {
      const tokens = await readTokens()
      await sendPush(tokens.map(t => t.token), {
        title: 'Order Updated',
        body: `Order ${id} is now ${status}`
      })
    } catch {}
    res.json(orders[idx])
  } catch (e) {
    console.error('Error updating order status:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

app.get('/api/station/:id', async (req, res) => {
  const { id } = req.params
  const osmId = id.startsWith('osm-') ? id.replace('osm-', '') : id
  const query = `[out:json];node(${osmId});out;`
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  try {
    const r = await fetch(url)
    if (!r.ok) {
      res.status(r.status).json({ error: r.statusText })
      return
    }
    const data = await r.json()
    const el = Array.isArray(data.elements) && data.elements.length ? data.elements[0] : null
    if (!el) {
      res.status(404).json({ error: 'not_found' })
      return
    }
    const name = el.tags?.name || 'Fuel Station'
    const address = [el.tags?.street, el.tags?.city].filter(Boolean).join(', ') || 'Nearby'
    const imageName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    const imageUrl = `https://source.unsplash.com/300x300/?gas-station,${imageName}`
    const station = {
      id: `osm-${el.id}`,
      name,
      address,
      distance: '',
      deliveryTime: '10-15 min',
      rating: 0,
      reviewCount: 0,
      imageUrl,
      bannerUrl: `https://source.unsplash.com/600x300/?gas-station,${imageName}`,
      logoUrl: imageUrl,
      fuelPrices: { regular: NaN, premium: NaN, diesel: NaN },
      lat: el.lat,
      lon: el.lon,
      groceries: [],
      fuelFriends: []
    }
    res.json(station)
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch station' })
  }
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

// --- Push Notification via FCM legacy API ---
async function sendPush(registrationTokens, payload) {
  const serverKey = process.env.FCM_SERVER_KEY
  if (!serverKey || !registrationTokens || registrationTokens.length === 0) return
  const url = 'https://fcm.googleapis.com/fcm/send'
  const body = {
    registration_ids: registrationTokens,
    notification: {
      title: payload.title || 'Notification',
      body: payload.body || '',
    },
    data: payload.data || {}
  }
  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${serverKey}`
    },
    body: JSON.stringify(body)
  })
}

// Register FCM token
app.post('/api/notifications/register', async (req, res) => {
  try {
    const { email, token } = req.body || {}
    if (!token) { res.status(400).json({ error: 'token required' }); return }
    const tokens = await readTokens()
    const existingIdx = tokens.findIndex(t => t.token === token)
    if (existingIdx !== -1) {
      tokens[existingIdx] = { email, token }
    } else {
      tokens.push({ email, token })
    }
    await writeTokens(tokens)
    res.json({ ok: true })
  } catch (e) {
    console.error('Error registering token:', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// Send test push
app.post('/api/notifications/test', async (req, res) => {
  try {
    const { token } = req.body || {}
    await sendPush(token ? [token] : (await readTokens()).map(t => t.token), { title: 'FuelFriendly', body: 'Test notification' })
    res.json({ ok: true })
  } catch (e) {
    console.error('Error sending test push:', e)
    res.status(500).json({ error: 'push_failed' })
  }
})
