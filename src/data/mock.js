export const dashboardStats = [
  {
    id: 'active-trades',
    title: 'Active Trades',
    value: '24',
    change: '+12% this week',
  },
  {
    id: 'escrow-volume',
    title: 'Escrow Volume',
    value: '$183,420',
    change: '+8.4% this month',
  },
  {
    id: 'success-rate',
    title: 'Success Rate',
    value: '98.7%',
    change: '+0.9% vs last period',
  },
  {
    id: 'pending-actions',
    title: 'Pending Actions',
    value: '7',
    change: '2 require shipment proof',
  },
]

export const tradeActivity = [
  {
    id: 'evt-1',
    title: 'Shipment proof uploaded',
    detail: 'MacBook Pro 16 trade room',
    timestamp: '3 min ago',
  },
  {
    id: 'evt-2',
    title: 'Buyer joined room',
    detail: 'Gaming GPU transaction',
    timestamp: '12 min ago',
  },
  {
    id: 'evt-3',
    title: 'Escrow release approved',
    detail: 'Camera bundle transaction',
    timestamp: '36 min ago',
  },
  {
    id: 'evt-4',
    title: 'New trade request received',
    detail: 'Ergonomic chair sale',
    timestamp: '58 min ago',
  },
]

export const trades = [
  {
    id: 'TRD-4821',
    product: 'MacBook Pro 16 M3',
    partner: 'u_ryan009',
    amount: 2580,
    shipping: 'Express insured',
    status: 'HOLD',
    updatedAt: '2026-03-30 10:12',
  },
  {
    id: 'TRD-4822',
    product: 'Sony FX30 Kit',
    partner: 'u_camvera',
    amount: 1740,
    shipping: '2-day courier',
    status: 'SHIPPED',
    updatedAt: '2026-03-30 09:44',
  },
  {
    id: 'TRD-4809',
    product: 'RTX 5090 Founders Edition',
    partner: 'u_framecraft',
    amount: 2310,
    shipping: 'Tracked priority',
    status: 'DELIVERED',
    updatedAt: '2026-03-29 22:08',
  },
  {
    id: 'TRD-4798',
    product: 'Mechanical Keyboard Bundle',
    partner: 'u_keysmith',
    amount: 420,
    shipping: 'Standard',
    status: 'CANCELLED',
    updatedAt: '2026-03-29 17:31',
  },
  {
    id: 'TRD-4781',
    product: 'Mirrorless Camera Body',
    partner: 'u_shutter_x',
    amount: 980,
    shipping: 'Insured overnight',
    status: 'SHIPPED',
    updatedAt: '2026-03-29 14:16',
  },
]

export const tradeRoomMessages = [
  {
    id: 'msg-1',
    sender: 'Buyer',
    body: 'Payment is deposited. Please confirm packaging photos.',
    time: '09:22',
  },
  {
    id: 'msg-2',
    sender: 'Seller',
    body: 'Uploading tracking label now and dispatching in 30 minutes.',
    time: '09:26',
  },
  {
    id: 'msg-3',
    sender: 'System',
    body: 'Escrow hold is active until buyer confirms delivery.',
    time: '09:27',
  },
]
