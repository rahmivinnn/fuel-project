export default async function handler(req: any, res: any) {
  const { id } = req.query
  const osmId = String(id).startsWith('osm-') ? String(id).replace('osm-', '') : String(id)
  const query = `[out:json];node(${osmId});out;`
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
  try {
    const r = await fetch(url)
    if (!r.ok) { res.status(r.status).json({ error: r.statusText }); return }
    const data = await r.json()
    const el = Array.isArray(data.elements) && data.elements.length ? data.elements[0] : null
    if (!el) { res.status(404).json({ error: 'not_found' }); return }
    const name = el.tags?.name || 'Fuel Station'
    const address = [el.tags?.street, el.tags?.city].filter(Boolean).join(', ') || 'Nearby'
    const imageName = name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
    const imageUrl = `https://source.unsplash.com/300x300/?gas-station,${imageName}`
    
    // Generate realistic grocery items based on location/city
    const city = el.tags?.city || 'Jakarta'
    const groceries = generateGroceriesForLocation(city)
    const fuelFriends = generateFuelFriends()
    
    const station = {
      id: `osm-${el.id}`,
      name,
      address,
      distance: '',
      deliveryTime: '10-15 min',
      rating: Math.floor(Math.random() * 2) + 3, // 3-5 stars
      reviewCount: Math.floor(Math.random() * 100) + 10, // 10-110 reviews
      imageUrl,
      bannerUrl: `https://source.unsplash.com/600x300/?gas-station,${imageName}`,
      logoUrl: imageUrl,
      fuelPrices: { 
        regular: parseFloat((Math.random() * 10000 + 10000).toFixed(2)), 
        premium: parseFloat((Math.random() * 15000 + 12000).toFixed(2)), 
        diesel: parseFloat((Math.random() * 8000 + 8000).toFixed(2)) 
      },
      lat: el.lat,
      lon: el.lon,
      groceries,
      fuelFriends
    }
    res.json(station)
  } catch (e) {
    res.status(500).json({ error: 'failed to fetch station' })
  }
}

// Generate realistic grocery items based on location
function generateGroceriesForLocation(city: string) {
  // Different items based on location
  const locationItems: Record<string, string[]> = {
    'Jakarta': ['Indomie Goreng', 'ABC Sambal', 'Teh Botol Sosro', 'Beng Beng', 'Kopi Kapal Api'],
    'Bandung': ['Batagor', 'Surabi', 'Kue Cubit', 'Es Cendol', 'Brownies Amanda'],
    'Surabaya': ['Rujak Cingur', 'Lontong Balap', 'Sate Klopo', 'Es Doger', 'Rempeyek Kacang'],
    'Medan': ['Bika Ambon', 'Martabe', 'Sambal Tuktuk', 'Ikan Asam Pedas', 'Nasi Gurih'],
    'Makassar': ['Coto Makassar', 'Pisang Epe', 'Kapurung', 'Es Pisang Ijo', 'Barongkong'],
    'default': ['Chips', 'Soda', 'Sandwich', 'Cookies', 'Energy Drink', 'Water', 'Coffee', 'Tea']
  }
  
  const items = locationItems[city] || locationItems['default']
  
  return items.map((itemName, index) => ({
    id: `grocery-${Date.now()}-${index}`,
    name: itemName,
    price: parseFloat((Math.random() * 25000 + 5000).toFixed(2)), // 5,000 - 30,000 IDR
    imageUrl: `https://source.unsplash.com/100x100/?${encodeURIComponent(itemName)}`
  }))
}

// Generate fuel friends
function generateFuelFriends() {
  const names = ['Budi', 'Siti', 'Ahmad', 'Rina', 'Joko', 'Dewi', 'Agus', 'Maya']
  const vehicles = ['Toyota Avanza', 'Honda Mobilio', 'Daihatsu Xenia', 'Mitsubishi Xpander', 'Suzuki Ertiga']
  
  return Array.from({ length: 4 }, (_, index) => {
    const name = names[Math.floor(Math.random() * names.length)]
    const vehicle = vehicles[Math.floor(Math.random() * vehicles.length)]
    
    return {
      id: `friend-${Date.now()}-${index}`,
      name: `${name} (${vehicle})`,
      rate: parseFloat((Math.random() * 50000 + 20000).toFixed(2)), // 20,000 - 70,000 IDR
      rating: Math.floor(Math.random() * 2) + 3, // 3-5 stars
      reviewCount: Math.floor(Math.random() * 50) + 5, // 5-55 reviews
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
    }
  })
}