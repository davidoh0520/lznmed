import assert from 'node:assert/strict';
import fs from 'node:fs';

const sql = fs.readFileSync(new URL('./coupon-promotion-setup.sql', import.meta.url), 'utf8');
const commerce = fs.readFileSync(new URL('./commerce.js', import.meta.url), 'utf8');
const admin = fs.readFileSync(new URL('./admin.js', import.meta.url), 'utf8');
const email = fs.readFileSync(new URL('./supabase/functions/send-order-email/index.ts', import.meta.url), 'utf8');
const popup = fs.readFileSync(new URL('./promotion-popup.js', import.meta.url), 'utf8');

const orderResult = ({ subtotal, couponCount = 0, freight = 0 }) => {
  const couponLimit = Math.floor(subtotal / 100);
  return {
    minimumReached: subtotal >= 100,
    payable: subtotal - (couponCount * 10) + freight,
    earnsCoupons: couponLimit,
    couponLimit,
    couponsAllowed: couponCount <= couponLimit,
  };
};

assert.deepEqual(
  orderResult({ subtotal: 100, couponCount: 1 }),
  { minimumReached: true, payable: 90, earnsCoupons: 1, couponLimit: 1, couponsAllowed: true },
  'a USD 100 pre-coupon order pays USD 90, uses one coupon and earns one new coupon',
);
assert.deepEqual(
  orderResult({ subtotal: 670, couponCount: 6 }),
  { minimumReached: true, payable: 610, earnsCoupons: 6, couponLimit: 6, couponsAllowed: true },
  'a USD 670 order may use six coupons and earns six new coupons',
);
assert.equal(orderResult({ subtotal: 670, couponCount: 7 }).couponsAllowed, false, 'USD 670 cannot use seven coupons');
assert.equal(orderResult({ subtotal: 99.99 }).minimumReached, false, 'USD 99.99 does not meet the minimum');
assert.equal(orderResult({ subtotal: 110, couponCount: 1, freight: 25 }).payable, 125, 'freight is added after coupons');

assert.match(sql, /if v_subtotal < 100 and not v_has_price_on_request/i, 'database rejects normal orders below USD 100');
assert.match(sql, /floor\(new\.subtotal_usd \/ 100\)::integer/i, 'coupon issuance uses one coupon per complete USD 100');
assert.match(sql, /status = 'reserved'/i, 'coupon is reserved atomically when the order is placed');
assert.match(sql, /status = 'redeemed'/i, 'coupon is finalized when payment is confirmed');
assert.match(sql, /coupons_issued_order_sequence_uidx/i, 'each qualifying order can issue multiple numbered coupons without duplicates');
assert.match(sql, /p_coupon_codes text\[\]/i, 'checkout accepts multiple coupon codes');
assert.match(sql, /v_coupon_count > v_coupon_limit/i, 'database limits coupon use to one per complete USD 100');
assert.match(sql, /now\(\) \+ interval '60 days'/i, 'issued coupons expire after 60 days');
assert.match(sql, /customer_note like '%\[USD 10 NEXT-ORDER COUPON ELIGIBLE\]%'/i, 'pre-migration paid orders receive their earned coupons');
assert.match(sql, /generate_series\(1, floor\(orders\.subtotal_usd \/ 100\)::integer\)/i, 'previous high-value paid orders are topped up to the tiered coupon count');

assert.match(commerce, /MINIMUM_ORDER_USD = 100/, 'cart uses the USD 100 minimum');
assert.match(commerce, /client\.rpc\('place_order'/, 'checkout uses the atomic database order function');
assert.match(commerce, /orderFunctionUnavailable/, 'checkout detects when the coupon migration is not live yet');
assert.match(commerce, /USD 10 NEXT-ORDER COUPON ELIGIBLE/, 'legacy checkout marks qualifying orders for manual coupon handling');
assert.match(commerce, /Product subtotal before coupon/, 'checkout explains the eligibility basis');
assert.match(commerce, /const couponLimit = Math\.floor\(total \/ MINIMUM_ORDER_USD\)/, 'cart calculates one coupon slot per complete USD 100');
assert.match(commerce, /cart-earned-coupon/, 'the unlocked coupon is displayed beneath the cart summary');
assert.match(commerce, /Your available coupons/, 'owned active coupons are shown in the cart and checkout');
assert.match(commerce, /selectedCouponCodes/, 'multiple coupons selected in the cart are carried to checkout');
assert.match(commerce, /p_coupon_codes: checkout\.coupon_codes/, 'checkout submits all selected coupon codes');
assert.match(admin, /Coupon discount \(USD\)/, 'admin order detail shows the coupon discount');
assert.match(admin, /Issued repeat-order coupons/, 'admin shows every coupon issued for the order');
assert.match(admin, /Number\(order\.subtotal_usd \|\| 0\) - discount \+ freight/, 'admin total subtracts coupon before freight');
assert.match(email, /issued_for_order_id/, 'payment confirmation email loads the newly issued coupons');
assert.match(email, /issuedCoupons\.map/, 'payment confirmation email lists every earned coupon');
assert.match(popup, /24 \* 60 \* 60 \* 1000/, 'promotion dismissal lasts one day');
assert.match(popup, /data-promo-hide-day/, 'promotion provides a one-day dismissal control');

console.log('Coupon promotion verification passed.');
