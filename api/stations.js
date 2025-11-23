// Vercel serverless function to handle API requests
import fetch from 'node-fetch';

export default async function handler(request, response) {
  const { lat, lon, radius = 10000 } = request.query;
  
  if (!lat || !lon) {
    response.status(400).json({ error: 'lat and lon required' });
    return;
  }
  
  const query = `[out:json];node[amenity=fuel](around:${radius},${lat},${lon});out;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
  
  try {
    const r = await fetch(url);
    if (!r.ok) {
      response.status(r.status).json({ error: r.statusText });
      return;
    }
    const data = await r.json();
    response.status(200).json(data);
  } catch (e) {
    response.status(500).json({ error: 'failed to fetch stations' });
  }
}