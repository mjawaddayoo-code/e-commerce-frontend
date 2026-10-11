// Prints an 80mm thermal-style bill (also fine on A4). Uses a hidden iframe so no popup is blocked.
const esc = (s = '') => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rs = (n) => `Rs. ${Number(n || 0).toLocaleString('en-PK')}`;

export function printBill(order, settings = {}) {
  const items = order.items.map((i) => {
    const opt = [...(i.variants || []).map((v) => v.label), ...(i.extras || []).map((e) => e.name)].join(', ');
    return `<tr><td class="q">${i.quantity}x</td><td>${esc(i.name)}${opt ? `<div class="o">${esc(opt)}</div>` : ''}</td><td class="r">${rs(i.lineTotal)}</td></tr>`;
  }).join('');
  const row = (k, v, cls = '') => `<tr class="${cls}"><td colspan="2">${k}</td><td class="r">${v}</td></tr>`;
  const a = order.shippingAddress || {};

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Bill ${esc(order.orderNumber)}</title><style>
    @page { size: 80mm auto; margin: 3mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 12px; width: 74mm; margin: 0 auto; color: #000; }
    h1 { font-size: 16px; text-align: center; margin: 0 0 2px; }
    .c { text-align: center; } .r { text-align: right; white-space: nowrap; } .q { width: 28px; }
    .o { font-size: 10px; color: #333; }
    hr { border: 0; border-top: 1px dashed #000; margin: 6px 0; }
    table { width: 100%; border-collapse: collapse; } td { padding: 2px 0; vertical-align: top; }
    .t td { font-size: 14px; font-weight: bold; padding-top: 4px; }
    .cod { border: 1px solid #000; padding: 4px; margin-top: 6px; text-align: center; font-weight: bold; }
  </style></head><body>
    <h1>${esc(settings.businessName || 'Order Bill')}</h1>
    <div class="c">${esc(settings.address || '')}${settings.phone ? `<br>Tel: ${esc(settings.phone)}` : ''}</div><hr>
    <div><b>Order:</b> ${esc(order.orderNumber)}<br>
    <b>Date:</b> ${new Date(order.createdAt).toLocaleString()}<br>
    <b>Customer:</b> ${esc(order.customer?.name)} (${esc(order.customer?.phone)})<br>
    <b>Address:</b> ${esc([a.street, a.area, a.city].filter(Boolean).join(', '))}${a.landmark ? ` (near ${esc(a.landmark)})` : ''}
    ${a.instructions ? `<br><b>Note:</b> ${esc(a.instructions)}` : ''}</div><hr>
    <table>${items}</table><hr>
    <table>
      ${row('Subtotal', rs(order.subtotal))}
      ${row('Delivery', order.deliveryFee ? rs(order.deliveryFee) : 'Free')}
      ${order.discount > 0 ? row('Discount', `- ${rs(order.discount)}`) : ''}
      ${order.tax > 0 ? row('Tax', rs(order.tax)) : ''}
      ${row('TOTAL', rs(order.total), 't')}
    </table>
    <div class="cod">${order.paymentStatus === 'paid' ? 'PAID' : `Cash on Delivery: collect ${rs(order.total)}`}</div>
    <p class="c">Thank you for your order!</p>
  </body></html>`;

  const frame = document.createElement('iframe');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0';
  document.body.appendChild(frame);
  const doc = frame.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  setTimeout(() => {
    frame.contentWindow.focus();
    frame.contentWindow.print();
    setTimeout(() => frame.remove(), 1500);
  }, 250);
}
