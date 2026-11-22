export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { items, total, email, name, address } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'No items in order' });
  }

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Name required' });
  }
  if (!address || !address.trim()) {
    return res.status(400).json({ error: 'Delivery address required' });
  }

  const orderId = 'ORD-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();

  console.log('Order received:', { orderId, items, total, email, name, address });

  return res.status(200).json({
    success: true,
    orderId,
    message: 'Pre-order confirmed. Ships February 2027.',
    estimatedShipDate: '2027-02-15'
  });
}