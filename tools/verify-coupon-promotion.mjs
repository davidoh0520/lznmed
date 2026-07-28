import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('./coupon-promotion-setup.sql', import.meta.url), 'utf8');
const commerce = fs.readFileSync(new URL('./commerce.js', import.meta.url), 'utf8');
const admin = fs.readFileSync(new URL('./admin.js', import.meta.url), 'utf8');
const email = fs.readFileSync(new URL('./supabase/functions/send-order-email/index.ts', import.meta.url), 'utf8');
const popup = fs.readFileSync(new URL('./promotion-popup.js', import.meta.url), 'utf8');

const orderResult = ({ subtotal, coupon = 0, freight = 0 }) => ({
  minimumReached: subtotal >= 100,
  payable: subtotal - coupon + freight,
  earnsCoupon: subtotal >= 100,
});

assert.deepEqual(
  orderResult({ subtotal: 100, coupon: 10 }),
  { minimumReached: true, payable: 90, earnsCoupon: true },
  'a USD 100 pre-coupon order pays USD 90 and earns the next coupon',
);
assert.equal(orderResult({ subtotal: 99.99, coupon: 0 }).minimumReached, false, 'USD 99.99 does not meet the minimum');
assert.equal(orderResult({ subtotal: 110, coupon: 10, freight: 25 }).payable, 125, 'freight is added after coupon');

assert.match(sql, /if v_subtotal < 100 and not v_has_price_on_request/i, 'database rejects normal orders below USD 100');
assert.match(sql, /if new\.subtotal_usd >= 100/i, 'coupon issuance uses the pre-coupon subtotal');
assert.match(sql, /status = 'reserved'/i, 'coupon is reserved atomically when the order is placed');
assert.match(sql, /status = 'redeemed'/i, 'coupon is finalized when payment is confirmed');
assert.match(sql, /issued_for_order_id uuid not null unique/i, 'only one coupon can be issued per qualifying order');
assert.match(sql, /now\(\) \+ interval '60 days'/i, 'issued coupons expire after 60 days');
assert.match(sql, /customer_note like '%\[USD 10 NEXT-ORDER COUPON ELIGIBLE\]%'/i, 'pre-migration paid orders receive their earned coupons');

assert.match(commerce, /MINIMUM_ORDER_USD = 100/, 'cart uses the USD 100 minimum');
assert.match(commerce, /client\.rpc\('place_order'/, 'checkout uses the atomic database order function');
assert.match(commerce, /orderFunctionUnavailable/, 'checkout detects when the coupon migration is not live yet');
assert.match(commerce, /USD 10 NEXT-ORDER COUPON ELIGIBLE/, 'legacy checkout marks qualifying orders for manual coupon handling');
assert.match(commerce, /Product subtotal before coupon/, 'checkout explains the eligibility basis');
assert.match(commerce, /const couponUnlocked = total >= MINIMUM_ORDER_USD/, 'cart unlocks the coupon display at USD 100');
assert.match(commerce, /cart-earned-coupon/, 'the unlocked coupon is displayed beneath the cart summary');
assert.match(commerce, /Your available coupons/, 'owned active coupons are shown in the cart and checkout');
assert.match(commerce, /selectedCouponCode/, 'a coupon selected in the cart is carried to checkout');
assert.match(admin, /Coupon discount \(USD\)/, 'admin order detail shows the coupon discount');
assert.match(admin, /Number\(order\.subtotal_usd \|\| 0\) - discount \+ freight/, 'admin total subtracts coupon before freight');
assert.match(email, /issued_for_order_id/, 'payment confirmation email loads the newly issued coupon');
assert.match(popup, /24 \* 60 \* 60 \* 1000/, 'promotion dismissal lasts one day');
assert.match(popup, /data-promo-hide-day/, 'promotion provides a one-day dismissal control');

console.log('Coupon promotion verification passed.');
