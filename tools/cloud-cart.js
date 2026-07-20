(function () {
  const storageKey = 'lzn-cart';
  const ownerKey = 'lzn-cart-owner';
  const dirtyKey = 'lzn-cart-dirty';
  const cfg = window.LZN_SUPABASE || {};
  const client = window.supabase?.createClient(cfg.url, cfg.publishableKey);
  let activeSession = null;
  let saveQueue = Promise.resolve();

  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const read = () => {
    try {
      const value = JSON.parse(localStorage.getItem(storageKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch (_) {
      return [];
    }
  };
  const write = items => localStorage.setItem(storageKey, JSON.stringify(items || []));
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
      const found = merged.find(item => identity(item) === identity(incoming));
      if (found) found.quantity = number(found.quantity, 1) + number(incoming.quantity, 1);
      else merged.push({ ...incoming, quantity: number(incoming.quantity, 1) });
    }
    return merged;
  }

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

  async function restore(session) {
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

    if (!owner) restored = merge(remoteItems, localItems);
    else if (owner !== session.user.id) restored = remoteItems;
    else if (dirty) restored = localItems;
    else restored = remoteItems;

    write(restored);
    localStorage.setItem(ownerKey, session.user.id);
    localStorage.setItem(dirtyKey, '0');
    if (!owner || dirty) await replace(restored, session);
    return restored;
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
