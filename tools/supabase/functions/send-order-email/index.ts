import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const labels: Record<string, { subject: string; heading: string; message: string }> = {
  pi_ready: {
    subject: 'Proforma Invoice and payment instructions',
    heading: 'Your Proforma Invoice is attached',
    message: 'Please review the attached Proforma Invoice and arrange payment by company bank transfer. Use the invoice number as your payment reference. The beneficiary, USD account and SWIFT details are shown in the attached PDF. Bank charges should be paid by the remitter (OUR). After making the transfer, open My Orders and select “I have completed bank transfer” so that we can verify receipt.',
  },
  payment_confirmed: { subject: 'Payment confirmed', heading: 'We have confirmed your payment', message: 'Thank you. Your order will now be prepared for shipment.' },
  processing: { subject: 'Order awaiting shipment', heading: 'Your order is being prepared', message: 'Your order is now awaiting shipment. We will send another email as soon as it has been dispatched.' },
  commercial_invoice: {
    subject: 'Commercial Invoice attached',
    heading: 'Your Commercial Invoice is attached',
    message: 'Please find your Commercial Invoice attached as a PDF. Your order will be dispatched after production is completed, and we will email the tracking information after shipment.',
  },
  shipped: { subject: 'Order shipped', heading: 'Your order has been shipped', message: 'Your shipment has left our facility. Use the tracking information below to follow delivery progress.' },
  delivered: { subject: 'Delivery completed', heading: 'Your order has been delivered', message: 'Delivery of your order has been confirmed. We hope everything arrived safely and in good condition. If you have any questions or require assistance, please reply to this email.' },
};

const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
const money = (value: unknown) => `USD ${Number(value || 0).toFixed(2)}`;

const paymentCode = (value: unknown) => {
  const normalized = String(value || '').toLowerCase();
  if (normalized.includes('paypal') || normalized.includes('card') || normalized.includes('payoneer')) return 'payoneer_card_paypal';
  return 'company_bank_transfer';
};

const proformaPaymentMessage = (order: any) => {
  const method = paymentCode(order.payment_method);
  if (method === 'payoneer_card_paypal') return 'Please review the attached Proforma Invoice. Your secure Card / PayPal payment request will be emailed through Payoneer after freight and the final invoice are confirmed. Available payment methods and processing fees may vary by country, customer and payment request. The final fee and total are shown on Payoneer before payment. Any payer fee is charged on Payoneer and is not included in the PI total.';
  return labels.pi_ready.message;
};

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authorization = request.headers.get('Authorization') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authorization } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) throw new Error('Authentication required.');

    const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: adminUser } = await admin.from('admin_users').select('user_id').eq('user_id', user.id).maybeSingle();
    if (!adminUser) throw new Error('Administrator access required.');

    const { order_id, event_type, pdf_base64, pdf_filename } = await request.json();
    const template = labels[event_type];
    if (!order_id || !template) throw new Error('Invalid email request.');
    if (['pi_ready', 'commercial_invoice'].includes(event_type) && !pdf_base64) throw new Error('Invoice PDF is missing.');

    const { data: order, error } = await admin.from('orders').select('*, order_items(*)').eq('id', order_id).single();
    if (error) throw error;
    if (!order.contact_email) throw new Error('Customer email is missing.');

    const now = new Date().toISOString();
    let storedPath: string | null = null;
    let storedFilename: string | null = null;
    if (pdf_base64) {
      const kind = event_type === 'pi_ready' ? 'PI' : 'CI';
      storedFilename = pdf_filename || `${kind}-${order.invoice_no || order.id.slice(0, 8)}.pdf`;
      storedPath = `${order.id}/${kind}-${Date.now()}.pdf`;
      const bytes = Uint8Array.from(atob(pdf_base64), char => char.charCodeAt(0));
      const { error: uploadError } = await admin.storage.from('invoices').upload(storedPath, bytes, { contentType: 'application/pdf', upsert: false });
      if (uploadError) throw uploadError;
      const prefix = event_type === 'pi_ready' ? 'pi' : 'ci';
      const { error: updateError } = await admin.from('orders').update({ [`${prefix}_file_path`]: storedPath, [`${prefix}_filename`]: storedFilename, [`${prefix}_created_at`]: now }).eq('id', order.id);
      if (updateError) throw updateError;
    }

    const rows = (order.order_items || []).map((item: any) => `<tr><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(item.model)}</td><td style="padding:8px;border-bottom:1px solid #ddd">${escapeHtml(item.product_name)}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">${escapeHtml(item.quantity)}</td><td style="padding:8px;border-bottom:1px solid #ddd;text-align:right">${money(item.line_total_usd)}</td></tr>`).join('');
    const tracking = event_type === 'shipped' && order.tracking_no ? `<p><strong>Tracking number:</strong> ${escapeHtml(order.tracking_no)}<br><a href="https://www.17track.net/en/track#nums=${encodeURIComponent(order.tracking_no)}">Track shipment</a></p>` : '';
    const accountUrl = String(order.admin_note || '').includes('[FRAMES STORE]') ? 'https://frames.lznmed.com/#account' : 'https://tools.lznmed.com/#account';
    const message = event_type === 'pi_ready' ? proformaPaymentMessage(order) : template.message;
    const html = `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#171717"><div style="border-bottom:3px solid #075f7c;padding:20px 0"><strong style="font-size:24px;color:#075f7c">LZN MEDICAL</strong></div><h1 style="font-size:24px">${template.heading}</h1><p>Dear ${escapeHtml(order.contact_name || 'Customer')},</p><p>${message}</p><p><strong>PI / Order:</strong> ${escapeHtml(order.invoice_no || order.id.slice(0, 8))}<br><strong>Status:</strong> ${escapeHtml(order.status)}</p>${tracking}<table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:8px;text-align:left;background:#f3f3f3">Model</th><th style="padding:8px;text-align:left;background:#f3f3f3">Product</th><th style="padding:8px;text-align:right;background:#f3f3f3">Qty</th><th style="padding:8px;text-align:right;background:#f3f3f3">Amount</th></tr></thead><tbody>${rows}</tbody></table><p style="text-align:right"><strong>Total: ${money(order.total_usd || order.subtotal_usd)}</strong></p><p><a href="${accountUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;text-decoration:none;border-radius:24px">View my orders</a></p><p style="margin-top:32px">Best regards,<br><strong>LZN MEDICAL CO., LTD.</strong><br>sales@lznmed.com</p></div>`;
    const attachments = pdf_base64 ? [{ filename: pdf_filename || `Invoice-${order.invoice_no || order.id.slice(0, 8)}.pdf`, content: pdf_base64 }] : undefined;

    const resend = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json', 'Idempotency-Key': `${order.id}-${event_type}-${order.updated_at || ''}`.slice(0, 256) },
      body: JSON.stringify({ from: Deno.env.get('ORDER_EMAIL_FROM') || 'LZN MEDICAL <orders@send.lznmed.com>', reply_to: 'sales@lznmed.com', to: [order.contact_email], subject: `${template.subject} - ${order.invoice_no || 'LZN order'}`, html, attachments }),
    });
    const result = await resend.json();
    if (!resend.ok) throw new Error(result.message || 'Email delivery failed.');
    const timestampField = ({ pi_ready: 'pi_emailed_at', commercial_invoice: 'ci_emailed_at', shipped: 'shipped_emailed_at', delivered: 'delivered_emailed_at' } as Record<string, string>)[event_type];
    if (timestampField) await admin.from('orders').update({ [timestampField]: new Date().toISOString() }).eq('id', order.id);
    return new Response(JSON.stringify({ ok: true, id: result.id, path: storedPath, filename: storedFilename }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
