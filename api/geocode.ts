export default async function handler(req: any, res: any) {
  const { q } = req.query
  if (!q) { res.status(400).json({ error: 'q required' }); return }
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(String(q))}`
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'fuelfriendly' } as any })
    if (!r.ok) { res.status(r.status).json({ error: r.statusText }); return }
    const data = await r.json()
    const item = Array.isArray(data) && data.length ? data[0] : null
    if (!item) { res.status(404).json({ error: 'not_found' }); return }
    res.json({ lat: parseFloat(item.lat), lon: parseFloat(item.lon), display_name: item.display_name })
  } catch (e) {
    res.status(500).json({ error: 'failed to geocode' })
  }
}