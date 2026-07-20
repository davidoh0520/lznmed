# Saved cart and reminder automation

The storefront keeps guest carts in the browser and synchronizes signed-in carts to Supabase. Cart content changes reset the inactivity timer. Reminder emails are sent only to customers who explicitly enabled them.

## One-time deployment

1. Run `cart-persistence-setup.sql` in the Supabase SQL editor.
2. Deploy `supabase/functions/cart-reminders` with JWT verification disabled.
3. Add `CART_REMINDER_CRON_SECRET` to the Edge Function secrets. Use a long random value.
4. Store the same value and the project URL in Supabase Vault:

```sql
select vault.create_secret('https://snyvexlqpxpqjswizszz.supabase.co', 'project_url');
select vault.create_secret('PASTE_THE_SAME_LONG_RANDOM_VALUE', 'cart_reminder_cron_secret');
```

5. Enable Supabase Cron and `pg_net`, then schedule one daily invocation:

```sql
select cron.unschedule(jobid)
from cron.job
where jobname = 'lzn-saved-cart-reminders';

select cron.schedule(
  'lzn-saved-cart-reminders',
  '15 1 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url') || '/functions/v1/cart-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'cart_reminder_cron_secret')
    ),
    body := jsonb_build_object('run_at', now())
  );
  $$
);
```

The job runs daily at 01:15 UTC. It sends at most one due reminder per cart on days 3, 7, 14, 21 and 29. At 30 days it deletes the saved cart items. Each email includes a one-click reminder opt-out link.
