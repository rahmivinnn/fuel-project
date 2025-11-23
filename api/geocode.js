// Vercel serverless function to handle geocoding requests
import fetch from 'node-fetch';

export default async function handler(request, response) {
  const { q } = request.query;
  
  if (!q) {
    response.status(400).json({ error: 'q required' });
    return;
  }
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'fuelfriendly' } });
    if (!r.ok) {
      response.status(r.status).json({ error: r.statusText });
      return;
    }
    const data = await r.json();
    const item = Array.isArray(data) && data.length ? data[0] : null;
    if (!item) {
      response.status(404).json({ error: 'not_found' });
      return;
    }
    response.status(200).json({ lat: parseFloat(item.lat), lon: parseFloat(item.lon), display_name: item.display_name });
  } catch (e) {
    response.status(500).json({ error: 'failed to geocode' });
  }
}