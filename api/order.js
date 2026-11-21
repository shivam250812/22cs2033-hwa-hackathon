const orders = [];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body || {};
    const order = {
      id: 'SN' + Date.now(),
      createdAt: new Date().toISOString(),
      ...body
    };
    orders.push(order);
    res.status(200).json({ ok: true, orderId: order.id });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
};
