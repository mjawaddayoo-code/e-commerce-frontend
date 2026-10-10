export const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
export const label = (s) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
export const TIMELINE = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];
export const TIMELINE_LABELS = { pending: 'Order Placed', confirmed: 'Confirmed', preparing: 'Preparing', ready: 'Ready', out_for_delivery: 'Out for Delivery', delivered: 'Delivered' };
export const statusColor = (s) => ({ pending: 'bg-amber-100 text-amber-700', delivered: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700', paid: 'bg-green-100 text-green-700', failed: 'bg-red-100 text-red-700', refunded: 'bg-purple-100 text-purple-700' }[s] || 'bg-blue-100 text-blue-700');
