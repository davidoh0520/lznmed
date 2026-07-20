# Customer order email setup

The storefront and admin portal call the Supabase Edge Function `send-order-email`.

## One-time setup

1. Create a Resend account at https://resend.com.
2. Add and verify the sending subdomain `send.lznmed.com` in Resend by adding the DNS records shown there.
3. Create a **Sending access** API key.
4. In Supabase, open **Edge Functions → Secrets** and add:
   - `RESEND_API_KEY` = the Resend API key
   - `ORDER_EMAIL_FROM` = `LZN MEDICAL <orders@send.lznmed.com>`
5. Deploy the function in `supabase/functions/send-order-email` to the Supabase project.

Once deployed, these admin actions automatically email the customer:

- Email customer → Proforma Invoice ready
- Confirm payment → Payment confirmed
- Awaiting shipment → Order preparing for shipment
- Mark as shipped → Shipment and tracking information

Do not place the Resend API key in browser JavaScript or commit it to GitHub.
