import { createClient } from 'npm:@supabase/supabase-js@2';

const reminderDays = [3, 7, 14, 21, 29];
const dayMs = 24 * 60 * 60 * 1000;
const escapeHtml = (value: unknown) => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char] || char));
const money = (value: unknown) => `USD ${Number(value || 0).toFixed(2)}`;

function page(title: string, message: string, status = 200) {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title></head><body style="margin:0;background:#f4f3ed;font-family:Arial,sans-serif;color:#151515"><main style="max-width:620px;margin:10vh auto;padding:42px;background:#fff;border-radius:24px;box-shadow:0 20px 60px rgba(0,0,0,.08)"><strong style="font-size:25px">LZN MEDICAL</strong><h1>${escapeHtml(title)}</h1><p style="font-size:17px;line-height:1.6">${escapeHtml(message)}</p><a href="https://www.lznmed.com/" style="display:inline-block;margin-top:18px;padding:12px 18px;border-radius:999px;background:#111;color:#fff;text-decoration:none;font-weight:700">Return to LZN Medical</a></main></body></html>`, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

Deno.serve(async request => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  if (request.method === 'GET') {
    const token = new URL(request.url).searchParams.get('unsubscribe');
    if (!token) return page('Invalid link', 'This cart reminder link is invalid.', 400);
    const { data, error } = await admin.from('profiles').update({ cart_reminder_opt_in: false }).eq('cart_reminder_unsubscribe_token', token).select('id').maybeSingle();
    if (error || !data) return page('Link expired', 'This reminder preference link is no longer valid.', 404);
    return page('Cart reminders turned off', 'You will no longer receive saved-cart reminder emails. Your account and current cart remain available.');
  }

  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const cronSecret = Deno.env.get('CART_REMINDER_CRON_SECRET') || '';
  if (!cronSecret || request.headers.get('x-cron-secret') !== cronSecret) return new Response('Unauthorized', { status: 401 });

  try {
    const now = new Date();
    const cutoff = new Date(now.getTime() - (3 * dayMs)).toISOString();
    const { data: carts, error: cartsError } = await admin
      .from('carts')
      .select('id,user_id,updated_at,reminder_days_sent,reminder_deleted_at,cart_items(id,model,product_name,unit_price_usd,quantity,item_data)')
      .lte('updated_at', cutoff)
      .is('reminder_deleted_at', null)
      .limit(500);
    if (cartsError) throw cartsError;

    const userIds = [...new Set((carts || []).map((cart: any) => cart.user_id))];
    const { data: profiles, error: profilesError } = userIds.length
      ? await admin.from('profiles').select('id,email,full_name,company_name,cart_reminder_opt_in,cart_reminder_unsubscribe_token').in('id', userIds)
      : { data: [], error: null };
    if (profilesError) throw profilesError;
    const profileById = new Map((profiles || []).map((profile: any) => [profile.id, profile]));

    const result = { checked: (carts || []).length, sent: 0, deleted: 0, skipped: 0, errors: [] as string[] };
    for (const cart of carts || []) {
      const items = (cart as any).cart_items || [];
      if (!items.length) { result.skipped += 1; continue; }
      const age = Math.floor((now.getTime() - new Date((cart as any).updated_at).getTime()) / dayMs);

      if (age >= 30) {
        const { data, error } = await admin.rpc('expire_abandoned_cart', { p_cart_id: (cart as any).id, p_expected_updated_at: (cart as any).updated_at });
        if (error) result.errors.push(`delete:${(cart as any).id}:${error.message}`);
        else if (data) result.deleted += 1;
        continue;
      }

      const profile: any = profileById.get((cart as any).user_id);
      if (!profile?.cart_reminder_opt_in || !profile.email) { result.skipped += 1; continue; }
      const sentDays = Array.isArray((cart as any).reminder_days_sent) ? (cart as any).reminder_days_sent.map(Number) : [];
      const dueDay = [...reminderDays].reverse().find(day => age >= day && !sentDays.includes(day));
      if (!dueDay) { result.skipped += 1; continue; }

      const rows = items.map((item: any) => `<tr><td style="padding:9px;border-bottom:1px solid #e5e5e5"><strong>${escapeHtml(item.model)}</strong><br><small>${escapeHtml(item.product_name)}</small></td><td style="padding:9px;border-bottom:1px solid #e5e5e5;text-align:center">${escapeHtml(item.quantity)}</td><td style="padding:9px;border-bottom:1px solid #e5e5e5;text-align:right">${money(Number(item.unit_price_usd || 0) * Number(item.quantity || 1))}</td></tr>`).join('');
      const total = items.reduce((sum: number, item: any) => sum + Number(item.unit_price_usd || 0) * Number(item.quantity || 1), 0);
      const unsubscribe = `${supabaseUrl}/functions/v1/cart-reminders?unsubscribe=${encodeURIComponent(profile.cart_reminder_unsubscribe_token)}`;
      const html = `<div style="max-width:680px;margin:auto;font-family:Arial,sans-serif;color:#171717"><div style="border-bottom:3px solid #075f7c;padding:20px 0"><strong style="font-size:24px;color:#075f7c">LZN MEDICAL</strong></div><h1 style="font-size:24px">Your saved cart is waiting</h1><p>Dear ${escapeHtml(profile.full_name || profile.company_name || 'Customer')},</p><p>You saved these products ${dueDay} days ago. Sign in on any computer to continue with the same cart. Saved carts are automatically deleted after 30 days of inactivity.</p><table style="width:100%;border-collapse:collapse"><thead><tr><th style="padding:9px;text-align:left;background:#f3f3f3">Product</th><th style="padding:9px;text-align:center;background:#f3f3f3">Qty</th><th style="padding:9px;text-align:right;background:#f3f3f3">Amount</th></tr></thead><tbody>${rows}</tbody></table><p style="text-align:right;font-size:18px"><strong>${money(total)}</strong></p><p><a href="https://tools.lznmed.com/?open-cart=1#cart" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;text-decoration:none;border-radius:24px;font-weight:700">Open my saved cart</a></p><p style="margin-top:32px">Best regards,<br><strong>LZN MEDICAL CO., LTD.</strong><br>sales@lznmed.com</p><p style="margin-top:30px;font-size:11px;color:#777">You requested saved-cart reminders when creating or updating your account. <a href="${unsubscribe}" style="color:#555">Turn off cart reminders</a>.</p></div>`;

      const email = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `cart-${(cart as any).id}-day-${dueDay}`,
        },
        body: JSON.stringify({
          from: Deno.env.get('ORDER_EMAIL_FROM') || 'LZN MEDICAL <orders@send.lznmed.com>',
          reply_to: 'sales@lznmed.com',
          to: [profile.email],
          subject: `Your LZN saved cart - day ${dueDay}`,
          html,
        }),
      });
      const emailResult = await email.json();
      if (!email.ok) { result.errors.push(`email:${(cart as any).id}:${emailResult.message || 'failed'}`); continue; }

      const nextDays = [...new Set([...sentDays, dueDay])].sort((a, b) => a - b);
      const { error: updateError } = await admin.from('carts').update({ reminder_days_sent: nextDays }).eq('id', (cart as any).id).eq('updated_at', (cart as any).updated_at);
      if (updateError) result.errors.push(`mark:${(cart as any).id}:${updateError.message}`);
      else result.sent += 1;
    }

    return Response.json(result);
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
});
