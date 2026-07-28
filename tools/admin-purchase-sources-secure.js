document.addEventListener("DOMContentLoaded", function () {
  if (typeof client === "undefined" || !client) return;

  async function loadSecurePurchaseSources() {
    var result = await client
      .from("admin_purchase_sources")
      .select("public_model,source_data")
      .order("public_model");

    if (result.error) {
      console.warn("Secure purchase sources are unavailable:", result.error.message);
      return;
    }

    (result.data || []).forEach(function (row) {
      purchaseSourceData[row.public_model] = row.source_data;
    });

    if (typeof renderPurchases === "function") renderPurchases();
  }

  client.auth.getSession().then(function (result) {
    if (result.data && result.data.session) loadSecurePurchaseSources();
  });

  client.auth.onAuthStateChange(function (_event, session) {
    if (session) window.setTimeout(loadSecurePurchaseSources, 0);
  });
});
