(function () {
  const storageKey = 'lzn-cart';
  const ownerKey = 'lzn-cart-owner';
  const dirtyKey = 'lzn-cart-dirty';
  const cfg = window.LZN_SUPABASE || {};
  const client = window.supabase?.createClient(cfg.url, cfg.publishableKey);
  let activeSession = null;
  let saveQueue = Promise.resolve();
  let restorePromise = null;

  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const currentDevicePrices = Object.freeze({
    'ANY-I-YEARLY': 150,
    'LZN-5': 1600,
    'TOOLTIP': 13000,
    'IIOMA': 0,
    'INT-200-IIOMA': 3000,
    'HV-600': 700,
    'AXL-800': 3000,
    'RMK-800': 2500,
    'CP-6': 500,
    'CP-8': 2000,
    'K215': 500,
    'CV-700-CP-500': 3300,
    'CV-700-K215': 3300,
    'OT-1': 600,
    'OT-3': 600,
    'OT-5': 650,
    'ET-1100': 1500,
    'ET-660E': 800,
    'ET-480A': 900,
    'CYCLOPS-LITE': 1300,
    'BLUESPEC-HEV': 250,
    'CYCLOPS-BLUESPEC-SET': 1400,
  });
  const applyCurrentPrices = items => (items || []).reduce((changed, item) => {
    if (item.sourceStore !== 'Devices' || !Object.prototype.hasOwnProperty.call(currentDevicePrices, item.model)) return changed;
    const currentPrice = currentDevicePrices[item.model];
    if (number(item.priceUsd, -1) === currentPrice) return changed;
    item.priceUsd = currentPrice;
    return true;
  }, false);
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (!Array.isArray(value)) return [];
      if (applyCurrentPrices(value)) localStorage.setItem(storageKey, JSON.stringify(value));
      return value;
    } catch (_) {
      return [];
    }
  };
  const write = items => {
    const value = items || [];
    applyCurrentPrices(value);
    localStorage.setItem(storageKey, JSON.stringify(value));
  };
  const identity = item => [
    item.sourceStore || 'Tools',
    item.model || item.name || '',
    item.optionLabel || '',
    item.pdLabel || '',
    item.pd || '',
  ].join('|');

  function merge(remoteItems, localItems) {
    const merged = remoteItems.map(item => ({ ...item }));
    for (const incoming of localItems) {
      const foundIndex = merged.findIndex(item => identity(item) === identity(incoming));
      if (foundIndex >= 0) {
        const found = merged[foundIndex];
        merged[foundIndex] = {
          ...found,
          ...incoming,
          quantity: Math.max(number(found.quantity, 1), number(incoming.quantity, 1)),
        };
      }
      else merged.push({ ...incoming, quantity: number(incoming.quantity, 1) });
    }
    return merged;
  }
  const signature = items => (items || [])
    .map(item => `${identity(item)}:${Math.max(1, Math.floor(number(item.quantity, 1)))}`)
    .sort()
    .join('\n');

  const fromRow = row => ({
    ...(row.item_data || {}),
    model: row.model,
    nameEn: row.product_name,
    image: row.image_url || row.item_data?.image || '',
    priceUsd: number(row.unit_price_usd),
    quantity: number(row.quantity, 1),
    sourceStore: row.source_store || row.item_data?.sourceStore || 'Tools',
  });

  const toPayload = item => ({
    itemKey: identity(item),
    sourceStore: item.sourceStore || 'Tools',
    model: item.model || item.name || 'Product',
    productName: item.nameEn || item.name || item.model || 'Product',
    unitPriceUsd: Math.max(0, number(item.priceUsd ?? item.price)),
    quantity: Math.max(1, Math.floor(number(item.quantity ?? item.qty, 1))),
    imageUrl: item.image || '',
    itemData: item,
  });

  async function currentSession() {
    if (activeSession) return activeSession;
    if (!client) return null;
    const { data } = await client.auth.getSession();
    activeSession = data.session;
    return activeSession;
  }

  async function performRestore(session) {
    session = session === undefined ? await currentSession() : session;
    activeSession = session || null;
    const localItems = read();
    if (!client || !session?.user) return localItems;

    let { data: cartRow, error: cartError } = await client.from('carts').select('id').eq('user_id', session.user.id).maybeSingle();
    if (cartError) throw cartError;
    if (!cartRow) {
      const created = await client.from('carts').insert({ user_id: session.user.id }).select('id').single();
      if (created.error) {
        const retry = await client.from('carts').select('id').eq('user_id', session.user.id).single();
        if (retry.error) throw created.error;
        cartRow = retry.data;
      } else cartRow = created.data;
    }

    const { data: rows, error } = await client.from('cart_items').select('item_key,source_store,model,product_name,unit_price_usd,quantity,image_url,item_data').eq('cart_id', cartRow.id).order('created_at');
    if (error) throw error;
    const remoteItems = (rows || []).map(fromRow);
    const owner = localStorage.getItem(ownerKey);
    const dirty = localStorage.getItem(dirtyKey) === '1';
    let restored;
    let shouldReplace = false;

    if (!owner) {
      restored = merge(remoteItems, localItems);
      shouldReplace = signature(restored) !== signature(remoteItems);
    }
    else if (owner !== session.user.id) restored = remoteItems;
    else if (dirty) {
      restored = localItems;
      shouldReplace = true;
    }
    else {
      // A repeated SIGNED_IN/token-refresh event can race an earlier cloud save.
      // Reconcile instead of letting an empty or stale cloud response erase the
      // current browser cart. Quantities use the larger value, never a sum.
      restored = merge(remoteItems, localItems);
      shouldReplace = signature(restored) !== signature(remoteItems);
    }

    write(restored);
    localStorage.setItem(ownerKey, session.user.id);
    localStorage.setItem(dirtyKey, '0');
    if (shouldReplace) await replace(restored, session);
    return restored;
  }

  function restore(session) {
    if (restorePromise) return restorePromise;
    const pending = performRestore(session);
    restorePromise = pending;
    const clearPending = () => { if (restorePromise === pending) restorePromise = null; };
    pending.then(clearPending, clearPending);
    return pending;
  }

  function replace(items, session) {
    write(items);
    localStorage.setItem(dirtyKey, '1');
    saveQueue = saveQueue.then(async () => {
      session = session || activeSession || await currentSession();
      if (!client || !session?.user) return;
      const { error } = await client.rpc('replace_my_cart', { p_items: (items || []).map(toPayload) });
      if (error) throw error;
      localStorage.setItem(ownerKey, session.user.id);
      localStorage.setItem(dirtyKey, '0');
    }).catch(error => {
      console.warn('Cloud cart sync failed:', error.message || error);
    });
    return saveQueue;
  }

  function clearLocal() {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(ownerKey);
    localStorage.removeItem(dirtyKey);
  }

  async function setSession(session) {
    if (!client || !session?.access_token || !session?.refresh_token) return read();
    const { data, error } = await client.auth.setSession(session);
    if (error) throw error;
    activeSession = data.session;
    return restore(activeSession);
  }

  async function signOut() {
    activeSession = null;
    if (client) await client.auth.signOut({ scope: 'local' });
    clearLocal();
    return [];
  }

  window.LZNCloudCart = { identity, read, write, restore, replace, clearLocal, setSession, signOut };
})();
