import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync(new URL('./cloud-cart.js', import.meta.url), 'utf8');

async function scenario({ owner = null, dirty = false, local = [], remote = [], user = 'user-a' }) {
  const values = new Map([['lzn-cart', JSON.stringify(local)]]);
  if (owner) values.set('lzn-cart-owner', owner);
  if (dirty) values.set('lzn-cart-dirty', '1');
  const rpcCalls = [];
  const cartQuery = {
    select() { return this; }, eq() { return this; },
    maybeSingle: async () => ({ data: { id: 'cart-a' }, error: null }),
  };
  const itemsQuery = {
    select() { return this; }, eq() { return this; },
    order: async () => ({ data: remote, error: null }),
  };
  const client = {
    auth: {
      getSession: async () => ({ data: { session: { user: { id: user } } } }),
      setSession: async token => ({ data: { session: { ...token, user: { id: user } } }, error: null }),
      signOut: async () => ({ error: null }),
    },
    from(table) { return table === 'carts' ? cartQuery : itemsQuery; },
    rpc: async (name, args) => { rpcCalls.push({ name, args }); return { error: null }; },
  };
  const context = {
    console,
    localStorage: {
      getItem: key => values.get(key) ?? null,
      setItem: (key, value) => values.set(key, String(value)),
      removeItem: key => values.delete(key),
    },
    window: {
      LZN_SUPABASE: { url: 'https://example.test', publishableKey: 'test' },
      supabase: { createClient: () => client },
    },
  };
  vm.runInNewContext(source, context);
  const result = await context.window.LZNCloudCart.restore({ user: { id: user } });
  await new Promise(resolve => setTimeout(resolve, 0));
  return { result, rpcCalls, values };
}

const row = quantity => ({ item_key: 'Tools|A|||', source_store: 'Tools', model: 'A', product_name: 'Alpha', unit_price_usd: 10, quantity, image_url: '', item_data: {} });
const item = quantity => ({ sourceStore: 'Tools', model: 'A', nameEn: 'Alpha', priceUsd: 10, quantity });

const guest = await scenario({ local: [item(1)], remote: [row(2)] });
assert.equal(guest.result[0].quantity, 3, 'guest items merge into the account cart once');
assert.equal(guest.rpcCalls.length, 1, 'merged guest cart is persisted');

const sameOwner = await scenario({ owner: 'user-a', local: [item(9)], remote: [row(2)] });
assert.equal(sameOwner.result[0].quantity, 2, 'clean cache restores the server cart');
assert.equal(sameOwner.rpcCalls.length, 0, 'clean restore does not reset inactivity time');

const otherOwner = await scenario({ owner: 'user-b', local: [item(9)], remote: [row(2)] });
assert.equal(otherOwner.result[0].quantity, 2, 'another account cache never merges');
assert.equal(otherOwner.rpcCalls.length, 0, 'switching accounts does not reset inactivity time');

const dirty = await scenario({ owner: 'user-a', dirty: true, local: [item(4)], remote: [row(2)] });
assert.equal(dirty.result[0].quantity, 4, 'unsynced local edits win for the same account');
assert.equal(dirty.rpcCalls.length, 1, 'unsynced edits are retried');

console.log('Cloud cart verification passed.');
