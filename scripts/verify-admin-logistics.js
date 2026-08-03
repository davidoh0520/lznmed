const { chromium } = require('C:/Users/k5305/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const supabaseStub = `
window.__testSession={user:{id:'admin-1',email:'admin@example.com'}};
const resultFor=table=>table==='admin_users'?{user_id:'admin-1'}:[];
const query=table=>{
  const state={table};
  const api={
    select(){return api},order(){return api},eq(){return api},delete(){return api},
    maybeSingle:async()=>({data:resultFor(table),error:null}),
    single:async()=>({data:state.saved||null,error:null}),
    upsert(values){state.saved={...values};return api},
    then(resolve){resolve({data:resultFor(table),error:null})}
  };
  return api;
};
window.supabase={createClient:()=>({
  auth:{getSession:async()=>({data:{session:window.__testSession}}),refreshSession:async()=>({data:{session:window.__testSession}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),signOut:async()=>({})},
  from:query
})};`;

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/cdn.jsdelivr.net/npm/@supabase/supabase-js@2', route => route.fulfill({ contentType: 'text/javascript', body: supabaseStub }));
  await page.route('**/cdn.jsdelivr.net/npm/jspdf**', route => route.fulfill({ contentType: 'text/javascript', body: 'window.jspdf={jsPDF:function(){}};' }));
  await page.goto('http://127.0.0.1:8765/tools/admin.html', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-tab="logistics"]').click();
  await page.locator('#logisticsBody tr').first().waitFor();

  const total = await page.locator('#logisticsBody tr[data-logistics-model]').count();
  if (total !== 383) throw new Error(`Expected 383 catalog rows, found ${total}.`);

  await page.locator('#logisticsSearch').fill('MC-S');
  await page.locator('#logisticsBody tr[data-logistics-model="MC-S"]').click();
  if (await page.locator('[name="package_weight_kg"]').inputValue() !== '') throw new Error('Device MC-S received an estimated weight.');
  const deviceMessage = await page.locator('.detail-head').innerText();
  if (!deviceMessage.includes('no catalog weight')) throw new Error(`Missing device manual-entry warning: ${deviceMessage}`);
  await page.locator('[data-close-drawer]').first().click();

  await page.locator('#logisticsSearch').fill('Frames');
  const estimatedFrame = page.locator('#logisticsBody .state-estimated').first();
  await estimatedFrame.waitFor();
  await estimatedFrame.locator('xpath=ancestor::tr').click();
  if (await page.locator('[name="package_weight_kg"]').inputValue() !== '0.18') throw new Error('Frame estimate was not prefilled.');
  if (!(await page.locator('[name="notes"]').inputValue()).startsWith('[ESTIMATED]')) throw new Error('Frame estimate was not labeled.');
  await page.locator('[data-close-drawer]').first().click();

  await page.locator('#addLogistics').click();
  if (await page.locator('#logisticsStore').inputValue() !== '') throw new Error('New logistics editor should require a product family selection.');
  await page.locator('#logisticsStore').selectOption('Devices');
  if (await page.locator('#logisticsModel option').count() !== 106) throw new Error('Device model selector does not contain all 105 device models.');
  await page.locator('#logisticsModel').selectOption('MC-S');
  if (await page.locator('#logisticsProductName').inputValue() !== 'Motorized Examination Chair') throw new Error('Device product name did not fill automatically.');
  if (await page.locator('[name="package_weight_kg"]').inputValue() !== '') throw new Error('Device without catalog weight was estimated in the add form.');
  await page.locator('#logisticsStore').selectOption('Frames');
  const firstFrame = await page.locator('#logisticsModel option').nth(1).getAttribute('value');
  await page.locator('#logisticsModel').selectOption(firstFrame);
  if (!(await page.locator('#logisticsProductName').inputValue())) throw new Error('Frame product name did not fill automatically.');
  if (await page.locator('[name="package_weight_kg"]').inputValue() !== '0.18') throw new Error('Frame estimate did not follow the selected model.');

  if (errors.length) throw new Error(`Page errors: ${errors.join('; ')}`);
  console.log(`Admin logistics verified: ${total} products; family/model selection fills names; device weights stay manual; frame estimates prefill correctly.`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
