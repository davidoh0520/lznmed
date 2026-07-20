const products = [
  {cat:'single', name:'CR39 LENS', file:'cr39-lens.png', index:'1.49 / CR39', coating:'NC / SHMC', material:'CR-39', features:'Clear vision, UV protection, hard coating option', variants:[{name:'NC',tiers:[{price:.70,sphMin:-6,sphMax:6,cylMin:-2}]},{name:'SHMC',tiers:[{price:1.30,sphMin:-6,sphMax:6,cylMin:-2}]}]},
  {cat:'single', name:'1.56 ASP BLUE RAY', file:'blueray-156.png', index:'1.56', coating:'SHMC', material:'Resin', features:'Blue ray protection, UV protection, comfortable viewing', tiers:[{price:2.80,sphMin:-6,sphMax:6,cylMin:-2}]},
  {cat:'single', name:'1.56 UV450 PHOTO BLUE RAY', file:'uv450-photo-156.png', index:'1.56', coating:'SHMC', material:'Resin', features:'UV450 protection, photochromic, blue ray protection', tiers:[{price:5.00,sphMin:-6,sphMax:6,cylMin:-2}]},
  {cat:'single', name:'1.60 ASP BLUE RAY', file:'mr160-blueray.png', index:'1.60', coating:'SHMC', material:'MR-8', features:'Aspheric, blue ray protection, thin profile', tiers:[{price:2.80,sphMin:-10,sphMax:6,cylMin:-2},{price:3.30,sphMin:-8,sphMax:6,cylMin:-4},{price:3.90,sphMin:-6,sphMax:6,cylMin:-6}]},
  {cat:'single', name:'1.60 ASP PHOTO BLUE RAY', file:'mr160-photo.png', index:'1.60', coating:'SHMC', material:'MR-8', features:'Photochromic, blue ray protection, aspheric', tiers:[{price:5.50,sphMin:-10,sphMax:6,cylMin:-2},{price:6.10,sphMin:-10,sphMax:6,cylMin:-4}]},
  {cat:'single', name:'1.67 ASP BLUE RAY', file:'mr167-blueray.png', index:'1.67', coating:'SHMC', material:'MR-7 / high index', features:'High index, blue ray protection, thinner lens', tiers:[{price:4.40,sphMin:-12,sphMax:6,cylMin:-2},{price:5.00,sphMin:-8,sphMax:6,cylMin:-4}]},
  {cat:'single', name:'1.67 ASP PHOTO BLUE RAY', file:'mr167-photo.png', index:'1.67', coating:'SHMC', material:'MR-7 / high index', features:'Photochromic, blue ray protection, high index', tiers:[{price:7.20,sphMin:-12,sphMax:6,cylMin:-2},{price:7.70,sphMin:-8,sphMax:6,cylMin:-4}]},
  {cat:'single', name:'1.70 ASP BLUE RAY', file:'mr170-blueray.png', index:'1.70', coating:'SHMC', material:'High index', features:'Ultra-thin design, blue ray protection', tiers:[{price:11.00,sphMin:-12,sphMax:6,cylMin:-2}]},
  {cat:'single', name:'1.70 ASP PHOTO BLUE RAY', file:'mr170-photo.png', index:'1.70', coating:'SHMC', material:'High index', features:'Photochromic, blue ray protection, ultra-thin', tiers:[{price:16.50,sphMin:-12,sphMax:6,cylMin:-2}]},
  {cat:'single', name:'1.74 ASP BLUE RAY', file:'mr174-blueray.png', index:'1.74', coating:'SHMC', material:'Ultra high index', features:'Ultra high index, blue ray protection', tiers:[{price:19.80,sphMin:-15,sphMax:6,cylMin:-4}]},
  {cat:'single', name:'1.74 ASP PHOTO BLUE RAY', file:'mr174-photo.png', index:'1.74', coating:'SHMC', material:'Ultra high index', features:'Photochromic, blue ray protection, ultra high index', tiers:[{price:27.50,sphMin:-18,sphMax:6,cylMin:-4}]},
  {cat:'progressive', name:'1.56 PROGRESSIVE BLUE RAY', file:'progressive-blueray-156.png', index:'1.56', coating:'SHMC', material:'Resin', features:'Progressive design, blue ray protection', price:2.20, sphMin:-3, sphMax:3, cylMin:-2, addMin:1, addMax:3},
  {cat:'progressive', name:'1.56 PROGRESSIVE BLUE RAY PHOTO', file:'progressive-blueray-photo-156.png', index:'1.56', coating:'SHMC', material:'Resin', features:'Progressive, photochromic, blue ray protection', price:3.90, sphMin:-3, sphMax:3, cylMin:-2, addMin:1, addMax:3},
  {cat:'progressive', name:'1.59 POLY PROGRESSIVE BLUE RAY', file:'poly-progressive.png', index:'1.59', coating:'SHMC', material:'Polycarbonate', features:'Impact resistant polycarbonate, progressive, blue ray protection', price:3.40, sphMin:-2, sphMax:3, cylMin:-2, addMin:1, addMax:3},
  {cat:'progressive', name:'1.59 POLY PROGRESSIVE BLUE RAY PHOTO', file:'poly-progressive-photo.png', index:'1.59', coating:'SHMC', material:'Polycarbonate', features:'Polycarbonate, progressive, photochromic, blue ray protection', price:6.10, sphMin:-2, sphMax:3, cylMin:-2, addMin:1, addMax:3},
  {cat:'semi', name:'1.60 ASP BLUE RAY SEMI', file:'semi-mr160.png', index:'1.60', coating:'NC', material:'MR-8', features:'Semi-finished blank, built-in blue ray material', price:4.40},
  {cat:'semi', name:'1.60 ASP PHOTO BLUE RAY SEMI', file:'semi-mr160-photo.png', index:'1.60', coating:'SHMC', material:'MR-8', features:'Semi-finished, photochromic, blue ray, SHMC coating', price:8.30},
  {cat:'semi', name:'1.67 ASP BLUE RAY SEMI', file:'semi-mr167.png', index:'1.67', coating:'NC', material:'High index', features:'Semi-finished blank, built-in blue ray material', price:6.60},
  {cat:'semi', name:'1.67 ASP PHOTO BLUE RAY SEMI', file:'semi-mr167-photo.png', index:'1.67', coating:'SHMC', material:'High index', features:'Semi-finished, photochromic, blue ray, SHMC coating', price:10.50}
];

const grid = document.getElementById('productGrid');
const modal = document.getElementById('productModal');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalSpecs = document.getElementById('modalSpecs');
const orderFields = document.getElementById('orderFields');
const orderPrice = document.getElementById('orderPrice');
const addOrderLine = document.getElementById('addOrderLine');
const modelCartSummary = document.getElementById('modelCartSummary');
const cartDialog = document.getElementById('cartDialog');
const commerceBody = document.getElementById('commerceBody');
const cartCount = document.getElementById('cartCount');
const accountButton = document.getElementById('accountButton');
const supabaseConfig = window.LZN_SUPABASE || {};
const supabaseClient = window.supabase?.createClient(supabaseConfig.url, supabaseConfig.publishableKey);
const labels = {single:'Single Vision', progressive:'Progressive', semi:'Semi-Finished'};
let activeProduct = null;
let cart = JSON.parse(localStorage.getItem('lznLensCart') || '[]');
let session = null;
const e = value => String(value || '').replace(/[&<>\"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[char]));

function toast(message){
  let box=document.querySelector('#siteToast');
  if(!box){
    box=document.createElement('div');
    box.id='siteToast';
    box.className='site-toast';
  }
  const host=modal.open?modal:document.body;
  if(box.parentElement!==host)host.appendChild(box);
  box.innerHTML=`${e(message)} <button type="button" id="toastCart">View cart</button>`;
  box.classList.add('active');
  box.querySelector('#toastCart').onclick=()=>{box.classList.remove('active');cartView();};
  clearTimeout(box._hideTimer);
  box._hideTimer=setTimeout(()=>box.classList.remove('active'),3200);
}

function animateProductToCart(){
  if(!modalImage?.src)return;
  const cartButton=document.querySelector('#cartButton');
  const cartRect=cartButton?.getBoundingClientRect();
  const targetSize=72;
  const targetLeft=Math.max(10,Math.min(innerWidth-targetSize-10,cartRect?cartRect.left+cartRect.width/2-targetSize/2:innerWidth-targetSize-18));
  const targetTop=Math.max(10,Math.min(innerHeight-targetSize-10,cartRect?cartRect.top+cartRect.height/2-targetSize/2:18));
  let target=document.querySelector('.cart-flight-target');
  if(!target){
    target=document.createElement('div');
    target.className='cart-flight-target';
    target.setAttribute('aria-hidden','true');
    target.innerHTML=`<svg viewBox="0 0 24 24"><path d="M3 4h2l1.5 8.2a2 2 0 0 0 2 1.8h7.7a2 2 0 0 0 1.9-1.4L20 7H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/></svg><b>Cart</b>`;
    modal.appendChild(target);
  }
  clearTimeout(target._hideTimer);
  target.style.left=`${targetLeft}px`;
  target.style.top=`${targetTop}px`;
  target.querySelector('b').textContent='Cart';
  target.classList.remove('arrived');
  target.classList.add('active');
  const finish=()=>{
    target.classList.add('arrived');
    target.querySelector('b').textContent='Added';
    target._hideTimer=setTimeout(()=>target.classList.remove('active','arrived'),900);
  };
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){finish();return;}
  const sourceRect=modalImage.getBoundingClientRect();
  const flyerWidth=Math.max(72,Math.min(130,sourceRect.width));
  const flyerHeight=Math.max(54,Math.min(100,sourceRect.height));
  const startLeft=sourceRect.left+(sourceRect.width-flyerWidth)/2;
  const startTop=sourceRect.top+(sourceRect.height-flyerHeight)/2;
  const flyer=document.createElement('div');
  flyer.className='cart-flyer';
  flyer.setAttribute('aria-hidden','true');
  flyer.style.cssText=`left:${startLeft}px;top:${startTop}px;width:${flyerWidth}px;height:${flyerHeight}px`;
  const image=document.createElement('img');
  image.src=modalImage.currentSrc||modalImage.src;
  image.alt='';
  flyer.appendChild(image);
  modal.appendChild(flyer);
  const deltaX=targetLeft+targetSize/2-(startLeft+flyerWidth/2);
  const deltaY=targetTop+targetSize/2-(startTop+flyerHeight/2);
  const complete=()=>{flyer.remove();finish();};
  if(!flyer.animate){complete();return;}
  const animation=flyer.animate([
    {transform:'translate(0,0) scale(1)',opacity:1},
    {transform:`translate(${deltaX*.45}px,${deltaY*.38-70}px) scale(.78) rotate(-4deg)`,opacity:1,offset:.55},
    {transform:`translate(${deltaX}px,${deltaY}px) scale(.18) rotate(8deg)`,opacity:.08}
  ],{duration:800,easing:'cubic-bezier(.2,.8,.25,1)',fill:'forwards'});
  animation.onfinish=complete;
  animation.oncancel=complete;
}

function power(v){ return `${v >= 0 ? '+' : ''}${Number(v).toFixed(2)}`; }
function cylPower(v){ return Number(v) === 0 ? '0.00' : Number(v).toFixed(2); }
function values(min,max){ const a=[]; for(let v=min;v<=max+.001;v+=.25) a.push(Number(v.toFixed(2))); return a; }
function options(items, formatter=power){ return items.map(v=>`<option value="${v}">${formatter(v)}</option>`).join(''); }
function tiers(p){ return p.variants ? p.variants[0].tiers : p.tiers; }
function productRange(p){
  if(p.cat==='semi') return 'Base: 50B, 200B, 400B, 600B';
  if(p.cat==='progressive') return `SPH ${power(p.sphMin)} to ${power(p.sphMax)} / CYL ${cylPower(p.cylMin)} to ${cylPower(0)} / ADD ${power(p.addMin)} to ${power(p.addMax)}`;
  const t=tiers(p); return `SPH ${power(Math.min(...t.map(x=>x.sphMin)))} to ${power(Math.max(...t.map(x=>x.sphMax)))} / CYL to ${power(Math.min(...t.map(x=>x.cylMin)))}`;
}
function fromPrice(p){
  const prices=p.variants ? p.variants.flatMap(v=>v.tiers.map(t=>t.price)) : p.tiers ? p.tiers.map(t=>t.price) : [p.price];
  return Math.min(...prices);
}

function render(filter='all'){
  grid.innerHTML='';
  products.filter(p=>filter==='all'||p.cat===filter).forEach(p=>{
    const card=document.createElement('article'); card.className='card';
    const priceMarkup=p.cat==='semi'
      ? '<div class="card-price inquiry-price"><strong>Bulk Inquiry</strong><small>Contact for pricing</small></div>'
      : `<div class="card-price">From <strong>${fromPrice(p).toFixed(2)}</strong> <small>/ lens</small></div>`;
    card.innerHTML=`<div class="card-img"><img src="assets/thumbs/${p.file.replace(/\.png$/i,'.webp')}" alt="${p.name}" decoding="async"></div><div class="card-body"><h3>${p.name}</h3>${priceMarkup}<div class="meta"><span class="pill">${labels[p.cat]}</span><span class="pill">${p.coating}</span></div></div>`;
    card.addEventListener('click',()=>openProduct(p)); grid.appendChild(card);
  });
}

function field(label,id,content){ return `<label><span>${label}</span><select id="${id}">${content}</select></label>`; }
function quantityField(){ return '<label><span>Quantity (lenses)</span><input id="orderQty" type="number" min="1" step="1" value="1" inputmode="numeric"></label>'; }
function allPowersButton(description){ return `<button class="all-powers-button" id="allPowersButton" type="button" aria-pressed="false"><strong>ALL</strong><small>${description}</small></button>`; }
function isAllPowersSelected(){ return document.getElementById('allPowersButton')?.getAttribute('aria-pressed')==='true'; }

function renderOrderFields(p){
  const builderTitle=document.getElementById('orderBuilderTitle');
  const builderNote=document.getElementById('orderBuilderNote');
  orderPrice.hidden=false;
  addOrderLine.hidden=false;
  builderTitle.textContent='Add a power to your cart';
  builderNote.textContent='Prices are per individual lens. Choose a power and quantity.';
  if(p.cat==='semi'){
    builderTitle.textContent='Bulk order inquiry';
    builderNote.textContent='Semi-finished lenses are supplied in bulk. Contact us for pricing, packing and minimum order details.';
    const subject=encodeURIComponent(`Bulk inquiry: ${p.name}`);
    orderFields.innerHTML=`<div class="bulk-inquiry"><strong>Wholesale supply only</strong><p>Available bases: 50B, 200B, 400B and 600B.</p><a class="btn" href="mailto:sales@lznmed.com?subject=${subject}">Request Bulk Quote</a></div>`;
    orderPrice.hidden=true;
    addOrderLine.hidden=true;
    return;
  } else if(p.cat==='progressive'){
    orderFields.innerHTML=allPowersButton('All SPH, CYL & ADD combinations')+field('SPH','orderSph',options(values(p.sphMin,p.sphMax)))+field('CYL','orderCyl',options(values(p.cylMin,0).reverse(),cylPower))+field('ADD','orderAdd',options(values(p.addMin,p.addMax)))+quantityField();
    document.getElementById('orderSph').value='0';
    document.getElementById('orderCyl').value='0';
    document.getElementById('orderAdd').value=String(p.addMin);
  } else {
    const ts=tiers(p), min=Math.min(...ts.map(t=>t.sphMin)), max=Math.max(...ts.map(t=>t.sphMax));
    orderFields.innerHTML=allPowersButton('All SPH & CYL combinations')+(p.variants ? field('Coating','orderVariant',p.variants.map((v,i)=>`<option value="${i}">${v.name}</option>`).join('')) : '')+field('SPH','orderSph',options(values(min,max)))+field('CYL','orderCyl','')+quantityField();
    document.getElementById('orderSph').value='0';
    updateCylinderOptions();
    document.getElementById('orderCyl').value='0';
    document.getElementById('orderVariant')?.addEventListener('change',()=>{updateCylinderOptions();updateOrderPrice();});
    document.getElementById('orderSph').addEventListener('change',()=>{updateCylinderOptions();updateOrderPrice();});
    document.getElementById('orderCyl').addEventListener('change',updateOrderPrice);
  }
  document.getElementById('allPowersButton')?.addEventListener('click',toggleAllPowers);
  orderFields.querySelectorAll('select,input').forEach(el=>el.addEventListener('change',updateOrderPrice));
  updateOrderPrice();
}
function toggleAllPowers(){
  const button=document.getElementById('allPowersButton');
  const enabled=!isAllPowersSelected();
  button.setAttribute('aria-pressed',String(enabled));
  button.classList.toggle('active',enabled);
  const sph=document.getElementById('orderSph'),cyl=document.getElementById('orderCyl'),add=document.getElementById('orderAdd'),qty=document.getElementById('orderQty');
  sph.disabled=enabled;
  if(cyl)cyl.disabled=enabled;
  if(add)add.disabled=enabled;
  qty.readOnly=enabled;
  if(!enabled){
    sph.value='0';
    if(cyl){if(activeProduct.cat==='single')updateCylinderOptions();cyl.value='0';}
    if(add)add.value=String(activeProduct.addMin);
    qty.value='1';
  }
  updateOrderPrice();
}
function currentTiers(){
  if(!activeProduct.variants) return activeProduct.tiers;
  return activeProduct.variants[Number(document.getElementById('orderVariant').value)].tiers;
}
function matchingTier(sph,cyl){ return currentTiers().find(t=>sph>=t.sphMin&&sph<=t.sphMax&&cyl>=t.cylMin); }
function updateCylinderOptions(){
  const sphValue=Number(document.getElementById('orderSph').value),select=document.getElementById('orderCyl');
  const valid=currentTiers().filter(t=>sphValue>=t.sphMin&&sphValue<=t.sphMax);
  const min=Math.min(...valid.map(t=>t.cylMin));
  const previous=select.value;
  select.innerHTML=options(values(min,0).reverse(),cylPower);
  select.value=[...select.options].some(o=>o.value===previous)?previous:'0';
}
function selectedCombinations(){
  const all=isAllPowersSelected();
  const ts=currentTiers(),sphMin=Math.min(...ts.map(t=>t.sphMin)),sphMax=Math.max(...ts.map(t=>t.sphMax)),cylMin=Math.min(...ts.map(t=>t.cylMin));
  const sphs=all?values(sphMin,sphMax):[Number(document.getElementById('orderSph').value)];
  const cyls=all?values(cylMin,0):[Number(document.getElementById('orderCyl').value)];
  return sphs.flatMap(sph=>cyls.map(cyl=>({sph,cyl,tier:matchingTier(sph,cyl)}))).filter(x=>x.tier);
}
function selectedPrice(){
  if(activeProduct.cat!=='single') return activeProduct.price;
  const combinations=selectedCombinations();
  return combinations.length ? combinations.reduce((sum,x)=>sum+x.tier.price,0)/combinations.length : undefined;
}
function updateOrderPrice(){
  const qtyInput=document.getElementById('orderQty'),all=isAllPowersSelected();
  if(activeProduct.cat==='single'){
    qtyInput.readOnly=all;
    if(all)qtyInput.value=selectedCombinations().length;
  } else if(activeProduct.cat==='progressive'){
    qtyInput.readOnly=all;
    if(all)qtyInput.value=values(activeProduct.sphMin,activeProduct.sphMax).length*values(activeProduct.cylMin,0).length*values(activeProduct.addMin,activeProduct.addMax).length;
  }
  const price=selectedPrice(),qty=Math.max(1,Number(qtyInput?.value)||1);
  orderPrice.innerHTML=price===undefined?'Combination unavailable':`$${price.toFixed(2)} × ${qty} lens${qty===1?'':'es'} = <strong>$${(price*qty).toFixed(2)}</strong>`;
  addOrderLine.disabled=price===undefined;
}
function openProduct(p){
  activeProduct=p; modalImage.src=`assets/products/${p.file}`; modalImage.alt=p.name; modalTitle.textContent=p.name; modalCategory.textContent=labels[p.cat];
  modalSpecs.innerHTML=`<dt>Index</dt><dd>${p.index}</dd><dt>Coating</dt><dd>${p.coating}</dd><dt>Material</dt><dd>${p.material}</dd><dt>Range</dt><dd>${productRange(p)}</dd><dt>Features</dt><dd>${p.features}</dd>`;
  window.clearTimeout(addOrderLine._feedbackTimer);
  addOrderLine.textContent='Add to Cart';
  renderOrderFields(p); renderModelCartSummary(); modal.showModal();
}
function addToCart(){
  const qty=Math.max(1,Math.floor(Number(document.getElementById('orderQty').value)||1)), price=selectedPrice(); if(price===undefined)return;
  const line={name:activeProduct.name,coating:activeProduct.coating,qty,price,image:`assets/thumbs/${activeProduct.file.replace(/\.png$/i,'.webp')}`};
  if(activeProduct.cat==='single'){ const all=isAllPowersSelected(),sph=document.getElementById('orderSph').value,cyl=document.getElementById('orderCyl').value; line.sph=all?'ALL':power(sph); line.cyl=all?'ALL':cylPower(cyl); if(activeProduct.variants) line.coating=activeProduct.variants[Number(document.getElementById('orderVariant').value)].name; }
  if(activeProduct.cat==='progressive'){ const all=isAllPowersSelected(),sph=document.getElementById('orderSph').value,cyl=document.getElementById('orderCyl').value,add=document.getElementById('orderAdd').value; line.sph=all?'ALL':power(sph); line.cyl=all?'ALL':cylPower(cyl); line.add=all?'ALL':power(add); }
  if(activeProduct.cat==='semi') line.base=document.getElementById('orderBase').value;
  cart.push(line); saveCart();
  animateProductToCart();
  toast(`${activeProduct.name} added to cart.`);
  window.clearTimeout(addOrderLine._feedbackTimer);
  addOrderLine.textContent='Added to Cart ✓';
  addOrderLine._feedbackTimer=window.setTimeout(()=>{addOrderLine.textContent='Add to Cart';},1000);
}
function linePower(x){ return [x.coating,x.sph&&`SPH ${x.sph}`,x.cyl&&`CYL ${x.cyl}`,x.add&&`ADD ${x.add}`,x.base&&`Base ${x.base}`].filter(Boolean).join(' / '); }
function renderModelCartSummary(){
  if(!modelCartSummary||!activeProduct||activeProduct.cat==='semi'){
    if(modelCartSummary){modelCartSummary.hidden=true;modelCartSummary.innerHTML='';}
    return;
  }
  const lines=cart.filter(item=>item.name===activeProduct.name);
  if(!lines.length){
    modelCartSummary.hidden=true;
    modelCartSummary.innerHTML='';
    return;
  }
  const totalQty=lines.reduce((sum,item)=>sum+item.qty,0);
  const total=lines.reduce((sum,item)=>sum+item.price*item.qty,0);
  modelCartSummary.innerHTML=`<div class="model-cart-head"><strong>Selected powers</strong><span>${totalQty} lens${totalQty===1?'':'es'}</span></div><div class="model-cart-lines">${lines.map(item=>`<div class="model-cart-line"><span>${e(linePower(item))}</span><b>Qty ${item.qty}</b><strong>USD ${money(item.price*item.qty)}</strong></div>`).join('')}</div><div class="model-cart-total"><span>Model total</span><strong>USD ${money(total)}</strong></div>`;
  modelCartSummary.hidden=false;
}
function money(value){ return Number(value||0).toFixed(2); }
function paymentCode(value){const normalized=String(value||'').toLowerCase();if(normalized.includes('paypal'))return'payoneer_paypal';if(normalized.includes('card'))return'payoneer_card';return'company_bank_transfer';}
function paymentLabel(value){return({company_bank_transfer:'Company bank transfer',payoneer_card:'Credit / debit card — processed by Payoneer',payoneer_paypal:'PayPal — processed by Payoneer where supported'})[paymentCode(value)];}
function paymentFee(value,subtotal){const method=paymentCode(value);if(method==='payoneer_card')return Number(subtotal||0)*.03;if(method==='payoneer_paypal')return Number(subtotal||0)*.0399+.49;return 0;}
function sameCartLine(a,b){
  return a.name===b.name&&a.coating===b.coating&&(a.sph||'')===(b.sph||'')&&(a.cyl||'')===(b.cyl||'')&&(a.add||'')===(b.add||'')&&(a.base||'')===(b.base||'')&&Number(a.price)===Number(b.price);
}
function saveCart(){
  const merged=[];
  cart.forEach(line=>{
    const existing=merged.find(item=>sameCartLine(item,line));
    if(existing)existing.qty+=Math.max(1,Number(line.qty)||1);
    else merged.push({...line,qty:Math.max(1,Number(line.qty)||1)});
  });
  cart=merged;
  localStorage.setItem('lznLensCart',JSON.stringify(cart));
  cartCount.textContent=cart.reduce((s,x)=>s+x.qty,0);
  if(modal.open)renderModelCartSummary();
}
function showCommerce(html){ commerceBody.innerHTML=html; if(!cartDialog.open)cartDialog.showModal(); }
function accountLabel(){
  if(!session){accountButton.textContent='SIGN IN';accountButton.title='Sign in or create an account';return;}
  const name=session.user.user_metadata?.full_name||session.user.email?.split('@')[0]||'ACCOUNT'; accountButton.textContent=name.toUpperCase().slice(0,14); accountButton.title=`Signed in as ${session.user.email}`;
}
function cartView(){
  const totalQty=cart.reduce((s,x)=>s+x.qty,0),total=cart.reduce((s,x)=>s+x.price*x.qty,0);
  showCommerce(`<p class="eyebrow">BULK LENS ORDER</p><h2>${cart.length?'Your Cart':'Your cart is empty'}</h2><p class="order-note">Unit prices are per lens. Availability, packing and shipping are confirmed before invoicing.</p><div class="cart-list">${cart.length?cart.map((x,i)=>`<div class="cart-line"><div><strong>${e(x.name)}</strong><span>${e(linePower(x))}</span><small>$${money(x.price)} each</small></div><label class="cart-qty">Qty<input data-qty="${i}" type="number" min="1" step="1" value="${x.qty}"></label><div><b>$${money(x.price*x.qty)}</b><button data-remove="${i}" aria-label="Remove">&times;</button></div></div>`).join(''):'<p class="empty-cart">Choose a product and add a lens power.</p>'}</div>${cart.length?`<div class="cart-summary"><span>${totalQty} lenses</span><strong>USD $${money(total)}</strong></div><div class="commerce-actions"><button class="btn secondary" id="continueShopping">Continue Shopping</button><button class="btn" id="checkoutButton">Proceed to Checkout</button></div>`:'<button class="btn" id="continueShopping">Continue Shopping</button>'}`);
  commerceBody.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{cart.splice(Number(b.dataset.remove),1);saveCart();cartView();});
  commerceBody.querySelectorAll('[data-qty]').forEach(input=>input.onchange=()=>{cart[Number(input.dataset.qty)].qty=Math.max(1,Math.floor(Number(input.value)||1));saveCart();cartView();});
  document.getElementById('continueShopping').onclick=()=>cartDialog.close();
  document.getElementById('checkoutButton')?.addEventListener('click',()=>session?checkoutView():authView(true));
}
function authView(returnToCart=false){
  if(session){showCommerce(`<p class="eyebrow">CUSTOMER ACCOUNT</p><h2>My Account</h2><p>Signed in as <strong>${e(session.user.email)}</strong></p><div class="commerce-actions stack"><button class="btn" id="ordersOpen">My Orders</button><button class="btn secondary" id="profileOpen">Profile & Shipping</button><button class="text-button" id="signOut">Sign Out</button></div>`);document.getElementById('ordersOpen').onclick=ordersView;document.getElementById('profileOpen').onclick=profileView;document.getElementById('signOut').onclick=async()=>{await supabaseClient.auth.signOut();cartDialog.close();};return;}
  showCommerce(`<p class="eyebrow">CUSTOMER ACCOUNT</p><h2>Sign in or register</h2><form class="commerce-form" id="authForm"><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Password<input name="password" type="password" minlength="8" required autocomplete="current-password"></label><label>Company name (required for registration)<input name="company_name" autocomplete="organization"></label><label>Manager / Contact name (required for registration)<input name="full_name" autocomplete="name"></label><label class="reminder-consent"><input name="cart_reminder_opt_in" type="checkbox" value="true"><span>Email me reminders about items left in my cart. Reminders may be sent after 3, 7, 14, 21 and 29 days; the saved cart is deleted after 30 days.</span></label><div class="commerce-actions"><button class="btn" name="mode" value="signin">Sign In</button><button class="btn secondary" name="mode" value="signup">Create Company Account</button></div><p class="form-status" id="authStatus"></p></form>`);
  document.getElementById('authForm').onsubmit=async event=>{event.preventDefault();const mode=event.submitter.value,form=new FormData(event.currentTarget),status=document.getElementById('authStatus');if(mode==='signup'&&(!String(form.get('company_name')||'').trim()||!String(form.get('full_name')||'').trim())){status.textContent='Company name and Manager / Contact name are required.';return;}status.textContent='Please wait...';localStorage.setItem('lznLensReturnToCart','0');const result=mode==='signup'?await supabaseClient.auth.signUp({email:form.get('email'),password:form.get('password'),options:{emailRedirectTo:`${location.origin}${location.pathname}?email-confirmed=1#cart`,data:{company_name:String(form.get('company_name')).trim(),full_name:String(form.get('full_name')).trim(),buyer_type:'company',cart_reminder_opt_in:form.get('cart_reminder_opt_in')==='true'}}}):await supabaseClient.auth.signInWithPassword({email:form.get('email'),password:form.get('password')});status.textContent=result.error?result.error.message:(mode==='signup'?'Check your email to confirm the account.':'Signed in.');if(!result.error&&mode==='signup')localStorage.setItem('lznLensAwaitingEmailConfirmation','1');if(!result.error&&mode==='signin')setTimeout(authView,300);};
}
async function profileView(){
  const {data}=await supabaseClient.from('profiles').select('*').eq('id',session.user.id).maybeSingle();const p=data||{};
  showCommerce(`<p class="eyebrow">SHIPPING PROFILE</p><h2>Company Information</h2><form class="commerce-form two-col" id="profileForm"><input type="hidden" name="buyer_type" value="company"><label>Manager / Contact name<input name="full_name" required value="${e(p.full_name)}"></label><label>Company name<input name="company_name" required value="${e(p.company_name)}"></label><label>Phone<input name="phone" required value="${e(p.phone)}"></label><label>WhatsApp<input name="whatsapp" value="${e(p.whatsapp)}"></label><label>Country<input name="country" required value="${e(p.country)}"></label><label>Postal code<input name="postal_code" required value="${e(p.postal_code)}"></label><label class="wide">Address line 1<input name="address_line_1" required value="${e(p.address_line_1)}"></label><label class="wide">Address line 2<input name="address_line_2" value="${e(p.address_line_2)}"></label><label>City<input name="city" required value="${e(p.city)}"></label><label>State / Province<input name="state_province" value="${e(p.state_province)}"></label><label class="wide reminder-consent"><input name="cart_reminder_opt_in" type="checkbox" value="true" ${p.cart_reminder_opt_in?'checked':''}><span>Email me reminders about items left in my cart. I can turn these reminders off at any time.</span></label><button class="btn wide">Save Profile</button><p class="form-status wide" id="profileStatus"></p></form>`);
  document.getElementById('profileForm').onsubmit=async event=>{event.preventDefault();const values=Object.fromEntries(new FormData(event.currentTarget));values.buyer_type='company';values.cart_reminder_opt_in=event.currentTarget.elements.cart_reminder_opt_in.checked;const {error}=await supabaseClient.from('profiles').update(values).eq('id',session.user.id);document.getElementById('profileStatus').textContent=error?error.message:'Profile saved.';};
}
function checkoutView(){
  const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0);
  showCommerce(`<p class="eyebrow">CHECKOUT</p><h2>Payment & Freight</h2><div class="checkout-total"><span>FOB China product subtotal</span><strong>USD $${money(subtotal)}</strong></div><form class="commerce-form" id="checkoutForm"><fieldset><legend>Payment</legend><label class="choice payment-choice"><input type="radio" name="payment_method" value="company_bank_transfer" checked><span><strong>Company bank transfer <em>Recommended over USD 1,000</em></strong><small>No processing fee charged by LZN MEDICAL. Sending and intermediary bank charges are borne by the buyer.</small></span></label><label class="choice payment-choice"><input type="radio" name="payment_method" value="payoneer_card"><span><strong>Credit / debit card <em>Processed securely by Payoneer</em></strong><small>A 3% processing fee applies. A payment link will be emailed after freight and the final invoice are confirmed.</small><span class="payment-brands"><b>Visa</b><b>Mastercard</b><b>American Express</b></span></span></label><label class="choice payment-choice"><input type="radio" name="payment_method" value="payoneer_paypal"><span><strong>PayPal <em>Where supported</em></strong><small>Processed by Payoneer. A 3.99% processing fee plus USD 0.49 applies. A payment link will be emailed after freight and the final invoice are confirmed.</small><span class="payment-brands"><b>PayPal</b></span></span></label><div class="payment-fee-estimate" id="paymentFeeEstimate" aria-live="polite"></div></fieldset><fieldset><legend>Freight arrangement</legend><label class="choice"><input type="radio" name="freight_method" value="quote" checked><span><strong>Request freight quotation — SF International</strong><small>Quoted-freight orders are shipped by SF International. By selecting this option, you accept SF International as the carrier and the quoted SF International freight charge. We do not automatically substitute the cheapest courier service.</small></span></label><label class="choice"><input type="radio" name="freight_method" value="collect"><span><strong>Courier collect</strong><small>Use your courier account.</small></span></label><div id="collectFields" hidden><label>Courier<select name="courier"><option>DHL</option><option>FedEx</option><option>UPS</option><option>EMS</option><option>SF Express</option><option>Other</option></select></label><label>Courier account number<input name="courier_account_no"></label></div></fieldset><div class="commerce-actions"><button type="button" class="btn secondary" id="backCart">Back</button><button class="btn" id="placeOrder">Request Proforma Invoice</button></div><p class="form-status" id="checkoutStatus"></p></form>`);
  const form=document.getElementById('checkoutForm'),collect=document.getElementById('collectFields'),estimate=document.getElementById('paymentFeeEstimate');
  const updatePayment=()=>{const method=paymentCode(form.elements.payment_method.value),fee=paymentFee(method,subtotal);form.querySelectorAll('.payment-choice').forEach(label=>label.classList.toggle('selected',label.querySelector('input').checked));estimate.innerHTML=method==='company_bank_transfer'?`<strong>${subtotal>=1000?'Recommended — Company bank transfer':'Company bank transfer'}</strong><span>No processing fee is charged by LZN MEDICAL.</span>`:`<strong>Estimated processing fee: USD ${fee.toFixed(2)}</strong><span>Not added here. The final amount is confirmed on Payoneer and the fee is applied once only.</span>`;};
  form.querySelectorAll('[name="freight_method"]').forEach(x=>x.onchange=()=>collect.hidden=form.elements.freight_method.value!=='collect');form.querySelectorAll('[name="payment_method"]').forEach(x=>x.onchange=updatePayment);document.getElementById('backCart').onclick=cartView;form.onsubmit=submitOrder;updatePayment();
}
async function submitOrder(event){
  event.preventDefault();const form=event.currentTarget,values=Object.fromEntries(new FormData(form)),status=document.getElementById('checkoutStatus'),button=document.getElementById('placeOrder');if(values.freight_method==='collect'&&!String(values.courier_account_no||'').trim()){status.textContent='Enter your courier account number.';return;}button.disabled=true;status.textContent='Creating order...';
  const {data:p,error:profileError}=await supabaseClient.from('profiles').select('*').eq('id',session.user.id).maybeSingle();if(profileError){status.textContent=profileError.message;button.disabled=false;return;}if(!p?.company_name||!p?.full_name||!p?.country||!p?.address_line_1||!p?.postal_code){status.textContent='Complete your company and shipping profile first.';button.disabled=false;setTimeout(profileView,700);return;}
  const subtotal=cart.reduce((s,x)=>s+x.price*x.qty,0),shipping=[p.address_line_1,p.address_line_2,p.city,p.state_province,p.country].filter(Boolean).join(', '),courier=values.freight_method==='quote'?'SF International freight quotation requested':`Courier collect: ${values.courier}`;
  const {data:order,error}=await supabaseClient.from('orders').insert({user_id:session.user.id,status:'quote_requested',subtotal_usd:subtotal,payment_method:paymentCode(values.payment_method),destination_country:p.country,buyer_type:'company',company_name:p.company_name,contact_name:p.full_name,contact_email:session.user.email,contact_phone:p.phone,shipping_address:shipping,postal_code:p.postal_code,courier,courier_account_no:values.freight_method==='collect'?values.courier_account_no:null,customer_note:'[LENS STORE] Order submitted from lens.lznmed.com'}).select('id').single();if(error){status.textContent=error.message;button.disabled=false;return;}
  const items=cart.map(x=>({order_id:order.id,model:x.name,product_name:linePower(x),unit_price_usd:x.price,quantity:x.qty}));const {error:itemError}=await supabaseClient.from('order_items').insert(items);if(itemError){status.textContent=itemError.message;button.disabled=false;return;}const method=paymentCode(values.payment_method),paymentMessage=method==='company_bank_transfer'?'Company bank details will be included on the PI.':`A secure ${method==='payoneer_paypal'?'PayPal':'card'} payment request will be emailed through Payoneer after freight and the final invoice are confirmed.`,freightMessage=values.freight_method==='quote'?'The freight quotation and shipment will use SF International.':'Freight will be charged to your selected courier collect account.';cart=[];saveCart();showCommerce(`<p class="eyebrow">ORDER RECEIVED</p><h2>Proforma Invoice Requested</h2><p>Your request number:</p><p class="request-id">${e(order.id)}</p><p><strong>Payment method:</strong> ${e(paymentLabel(method))}</p><p>We will confirm lens availability, packing and freight before issuing the PI. ${freightMessage} ${paymentMessage}</p><div class="commerce-actions"><button class="btn secondary" id="finishShopping">Continue Shopping</button><button class="btn" id="viewOrders">My Orders</button></div>`);document.getElementById('finishShopping').onclick=()=>cartDialog.close();document.getElementById('viewOrders').onclick=ordersView;
}
const statusLabels={quote_requested:'Order received',quoted:'Quotation ready',payment_pending:'Awaiting payment',payment_submitted:'Payment verification',paid:'Paid',processing:'Processing',shipped:'Shipped',cancelled:'Cancelled'};
async function ordersView(){
  showCommerce('<p class="eyebrow">CUSTOMER ACCOUNT</p><h2>My Orders</h2><p>Loading...</p>');const {data,error}=await supabaseClient.from('orders').select('*, order_items(*)').eq('user_id',session.user.id).order('created_at',{ascending:false});if(error){commerceBody.innerHTML=`<p>${e(error.message)}</p>`;return;}const orders=data||[];showCommerce(`<p class="eyebrow">CUSTOMER ACCOUNT</p><h2>My Orders</h2><div class="lens-orders">${orders.length?orders.map(o=>`<article><div><strong>${e(o.invoice_no||`Order ${o.id.slice(0,8)}`)}</strong><span>${new Date(o.created_at).toLocaleDateString()}</span></div><div><b>${e(statusLabels[o.status]||o.status)}</b><strong>USD $${money(o.total_usd??o.subtotal_usd)}</strong></div><details><summary>View items</summary>${(o.order_items||[]).map(i=>`<p><strong>${e(i.model)}</strong><br><small>${e(i.product_name)} / Qty ${i.quantity}</small></p>`).join('')}</details></article>`).join(''):'<p class="empty-cart">No orders yet.</p>'}</div><button class="btn secondary" id="backAccount">Back to Account</button>`);document.getElementById('backAccount').onclick=()=>authView();
}

document.querySelectorAll('.filters button').forEach(btn=>btn.addEventListener('click',()=>{document.querySelectorAll('.filters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');render(btn.dataset.filter);}));
document.querySelector('#productModal .close').addEventListener('click',()=>modal.close());document.querySelector('#cartDialog .close').addEventListener('click',()=>cartDialog.close());document.getElementById('cartButton').addEventListener('click',cartView);accountButton.addEventListener('click',()=>authView());addOrderLine.addEventListener('click',addToCart);modal.addEventListener('click',x=>{if(x.target===modal)modal.close();});cartDialog.addEventListener('click',x=>{if(x.target===cartDialog)cartDialog.close();});
saveCart();render();
const emailConfirmationReturn=new URLSearchParams(location.search).get('email-confirmed')==='1'||location.hash.includes('type=signup')||(location.hash.includes('access_token=')&&localStorage.getItem('lznLensAwaitingEmailConfirmation')==='1');
function emailConfirmedView(){localStorage.removeItem('lznLensAwaitingEmailConfirmation');history.replaceState({},'',`${location.pathname}#cart`);showCommerce(`<p class="eyebrow">EMAIL CONFIRMED</p><h2>Your company account is ready</h2><p>Your email address has been confirmed successfully. You are signed in as <strong>${e(session?.user?.email)}</strong>.</p><div class="commerce-actions"><button class="btn secondary" id="confirmedProfile">Complete Company Profile</button><button class="btn" id="confirmedCart">Continue to Cart</button></div>`);document.getElementById('confirmedProfile').onclick=profileView;document.getElementById('confirmedCart').onclick=cartView;}
if(supabaseClient){supabaseClient.auth.getSession().then(({data})=>{session=data.session;accountLabel();if(session&&emailConfirmationReturn){localStorage.removeItem('lznLensReturnToCart');setTimeout(emailConfirmedView,250);}});supabaseClient.auth.onAuthStateChange((event,newSession)=>{session=newSession;accountLabel();});}


const heroLensName = document.getElementById('heroLensName');
const heroPanel = document.getElementById('heroPanel');

function startRandomLensHero() {
  if (!heroLensName || !heroPanel) return;
  const slides = products.map(product => ({
    product,
    name: product.name,
    src: `assets/thumbs/${product.file.replace(/\.png$/i, '.webp')}`,
    meta: `${labels[product.cat]} · Index ${product.index}`
  }));
  const shuffle = list => {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };
  let order = shuffle(slides);
  let position = 0;
  let activeSlide = order[0];

  heroPanel.innerHTML = '<img alt=""><div class="hero-lens-label"><b></b><span></span></div>';
  const image = heroPanel.querySelector('img');
  const label = heroPanel.querySelector('.hero-lens-label');

  const show = (slide, immediate = false) => {
    const update = () => {
      activeSlide = slide;
      image.src = slide.src;
      image.alt = `${slide.name} lens package`;
      heroLensName.textContent = slide.name;
      label.querySelector('b').textContent = slide.name;
      label.querySelector('span').textContent = slide.meta;
      heroPanel.setAttribute('aria-label', `View ${slide.name}`);
      heroPanel.classList.remove('switching');
      heroLensName.classList.remove('is-changing');
    };
    if (immediate) update();
    else {
      heroPanel.classList.add('switching');
      heroLensName.classList.add('is-changing');
      window.setTimeout(update, 320);
    }
  };

  const preloadNext = () => {
    const next = order[(position + 1) % order.length];
    if (next) {
      const preloaded = new Image();
      preloaded.src = next.src;
    }
  };
  const openFeaturedLens = () => activeSlide && openProduct(activeSlide.product);
  heroPanel.addEventListener('click', openFeaturedLens);
  heroPanel.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openFeaturedLens();
    }
  });

  show(activeSlide, true);
  preloadNext();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.setInterval(() => {
    const previous = order[position];
    position += 1;
    if (position >= order.length) {
      order = shuffle(slides);
      if (order.length > 1 && order[0].name === previous.name) {
        [order[0], order[1]] = [order[1], order[0]];
      }
      position = 0;
    }
    show(order[position]);
    preloadNext();
  }, 5000);
}

startRandomLensHero();

