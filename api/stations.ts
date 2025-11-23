export default async function handler(req: any, res: any) {
  const { lat, lon, radius = 10000 } = req.query
  if (!lat || !lon) { res.status(400).json({ error: 'lat and lon required' }); return }
  const query = `[out:json];node[amenity=fuel](around:${radius},${lat},${lon});out;`
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  try {
    const r = await fetch(url)
    if (!r.ok) { res.status(r.status).json({ error: r.statusText }); return }
    const data = await r.json()
    res.json(data)
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch stations' })
  }
}