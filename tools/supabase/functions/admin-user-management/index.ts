import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const jsonResponse = (payload: Record<string, unknown>, status = 200) => new Response(
  JSON.stringify(payload),
  { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
);

const escapeHtml = (value: unknown) => String(value ?? '').replace(
  /[&<>'"]/g,
  character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character] || character),
);

const allowedProfileFields = [
  'full_name',
  'company_name',
  'phone',
  'whatsapp',
  'country',
  'address_line_1',
  'address_line_2',
  'city',
  'state_province',
  'postal_code',
  'preferred_courier',
  'courier_account_no',
] as const;

const normalizeProfile = (profile: Record<string, unknown>) => Object.fromEntries(
  allowedProfileFields.map(field => {
    const value = String(profile?.[field] ?? '').trim();
    return [field, value || null];
  }),
);

async function sendAccountEmail(
  recipients: string[],
  subject: string,
  heading: string,
  message: string,
) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return { sent: false, error: 'RESEND_API_KEY is not configured.' };
  const to = [...new Set(recipients.map(value => value.trim().toLowerCase()).filter(Boolean))];
  if (!to.length) return { sent: false, error: 'Customer email is missing.' };
  const html = `<div style="max-width:640px;margin:auto;font-family:Arial,sans-serif;color:#171717"><div style="border-bottom:3px solid #075f7c;padding:20px 0"><strong style="font-size:24px;color:#075f7c">LZN MEDICAL</strong></div><h1 style="font-size:24px">${escapeHtml(heading)}</h1><p>${message}</p><p><a href="https://lznmed.com/" style="display:inline-block;background:#111;color:#fff;padding:12px 18px;text-decoration:none;border-radius:24px">Open LZN MEDICAL</a></p><p style="margin-top:32px">Best regards,<br><strong>LZN MEDICAL CO., LTD.</strong><br>sales@lznmed.com</p></div>`;
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: Deno.env.get('ACCOUNT_EMAIL_FROM') || 'LZN MEDICAL <noreply@send.lznmed.com>',
      reply_to: 'sales@lznmed.com',
      to,
      subject,
      html,
    }),
  });
  const result = await response.json();
  return response.ok
    ? { sent: true, id: result.id }
    : { sent: false, error: result.message || 'Email delivery failed.' };
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authorization = request.headers.get('Authorization') || '';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const userClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authorization } } },
    );
    const { data: { user: administrator } } = await userClient.auth.getUser();
    if (!administrator) throw new Error('Authentication required.');

    const admin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );
    const { data: adminUser } = await admin
      .from('admin_users')
      .select('user_id')
      .eq('user_id', administrator.id)
      .maybeSingle();
    if (!adminUser) throw new Error('Administrator access required.');

    const body = await request.json();
    const action = String(body.action || '');
    const userId = String(body.user_id || '');
    if (!userId) throw new Error('Member ID is required.');
    if (userId === administrator.id) throw new Error('You cannot modify or delete your own administrator account here.');

    const { data: targetResult, error: targetError } = await admin.auth.admin.getUserById(userId);
    if (targetError || !targetResult.user) throw targetError || new Error('Member account was not found.');
    const targetUser = targetResult.user;

    if (action === 'update_user') {
      const email = String(body.email || '').trim().toLowerCase();
      const profile = normalizeProfile(body.profile || {});
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('A valid customer email is required.');
      if (!profile.company_name || !profile.full_name) throw new Error('Company and Manager / Contact names are required.');

      const previousEmail = targetUser.email || '';
      const previousMetadata = targetUser.user_metadata || {};
      const { error: authError } = await admin.auth.admin.updateUserById(userId, {
        email,
        email_confirm: true,
        user_metadata: {
          ...previousMetadata,
          company_name: profile.company_name,
          full_name: profile.full_name,
          buyer_type: 'company',
        },
      });
      if (authError) throw authError;

      const { data: savedProfile, error: profileError } = await admin
        .from('profiles')
        .upsert({
          id: userId,
          email,
          buyer_type: 'company',
          ...profile,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single();
      if (profileError) {
        await admin.auth.admin.updateUserById(userId, {
          email: previousEmail,
          email_confirm: true,
          user_metadata: previousMetadata,
        });
        throw profileError;
      }

      const emailResult = await sendAccountEmail(
        [previousEmail, email],
        'Your LZN MEDICAL account was updated',
        'Your account information was updated',
        `An LZN MEDICAL administrator updated the account for <strong>${escapeHtml(profile.company_name)}</strong>. The current account email is <strong>${escapeHtml(email)}</strong>. If you did not expect this change, please reply to this email.`,
      );
      return jsonResponse({
        ok: true,
        profile: savedProfile,
        email_sent: emailResult.sent,
        email_error: emailResult.error || null,
      });
    }

    if (action === 'delete_user') {
      const { data: protectedAdmin } = await admin
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      if (protectedAdmin) throw new Error('Administrator accounts cannot be deleted from the member screen.');

      const { error: deleteError } = await admin.auth.admin.deleteUser(userId, false);
      if (deleteError) throw deleteError;
      const emailResult = await sendAccountEmail(
        [targetUser.email || ''],
        'Your LZN MEDICAL account was removed',
        'Your account has been removed',
        'An LZN MEDICAL administrator removed your login account and company profile. Historical order records are retained for business and transaction records. If you believe this was a mistake, please reply to this email.',
      );
      return jsonResponse({
        ok: true,
        email_sent: emailResult.sent,
        email_error: emailResult.error || null,
      });
    }

    throw new Error('Unsupported administrator action.');
  } catch (error) {
    return jsonResponse(
      { error: error instanceof Error ? error.message : String(error) },
      400,
    );
  }
});
