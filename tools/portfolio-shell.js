(()=>{
  // Commerce access is intentionally fail-closed: prices and cart actions stay
  // locked until the shared company profile has been verified.
  const commerceAccess={allowed:false,session:null,profile:null};
  const commerceMessage='Product prices and purchasing are available only to signed-in company members.';
  const commerceClient=window.supabase?.createClient(
    'https://snyvexlqpxpqjswizszz.supabase.co',
    'sb_publishable_wEQsmWUREF_lKiYm27jF_g_MlAEiomd'
  );
  const nativeDispatch=window.dispatchEvent.bind(window);
  window.LZNCommerceAccess={
    isAllowed:()=>commerceAccess.allowed,
    getSession:()=>commerceAccess.session,
    getProfile:()=>commerceAccess.profile
  };
  const openCompanySignIn=()=>{
    const account=document.getElementById('accountButton');
    if(account) account.click();
    else location.href='/#account';
  };
  const ensureCommerceNotice=()=>{
    let notice=document.querySelector('.lzn-company-access-notice');
    if(notice)return notice;
    notice=document.createElement('aside');
    notice.className='lzn-company-access-notice';
    notice.setAttribute('role','status');
    notice.innerHTML='<div><strong>Company member access</strong><span></span></div><button type="button">Sign in / Create company account</button>';
    notice.querySelector('button').addEventListener('click',openCompanySignIn);
    const header=document.querySelector('body > header');
    (header?.parentNode||document.body).insertBefore(notice,header?.nextSibling||document.body.firstChild);
    return notice;
  };
  const renderCommerceAccess=()=>{
    document.body.classList.toggle('lzn-company-member',commerceAccess.allowed);
    document.body.classList.toggle('lzn-commerce-locked',!commerceAccess.allowed);
    const notice=ensureCommerceNotice();
    const signedIn=Boolean(commerceAccess.session);
    notice.hidden=commerceAccess.allowed;
    notice.querySelector('span').textContent=signedIn
      ? 'This account is not registered as a company member. Please complete or update the company profile in your account.'
      : commerceMessage;
    notice.querySelector('button').textContent=signedIn?'Open company account':'Sign in / Create company account';
    document.querySelectorAll('#cartButton,[data-card-add],[data-add-cart],#addOrderLine').forEach(control=>{
      control.setAttribute('aria-disabled',String(!commerceAccess.allowed));
      if(!commerceAccess.allowed)control.setAttribute('tabindex','-1');
      else control.removeAttribute('tabindex');
    });
    nativeDispatch(new CustomEvent('lzn:commerce-access',{detail:{allowed:commerceAccess.allowed,signedIn}}));
  };

  const registrationDefinitions=[
    ['company_name','Company name','text',true,'organization'],
    ['full_name','Manager / Contact name','text',true,'name'],
    ['phone','Phone','tel',true,'tel'],
    ['whatsapp','WhatsApp','tel',true,'tel'],
    ['country','Country','text',true,'country-name'],
    ['postal_code','Postal code','text',true,'postal-code'],
    ['address_line_1','Address line 1','text',true,'address-line1'],
    ['address_line_2','Address line 2','text',true,'address-line2'],
    ['city','City','text',true,'address-level2'],
    ['state_province','State / Province','text',true,'address-level1'],
    ['tax_id','Importer / Customs ID (optional)','text',false,'off'],
    ['preferred_courier','Preferred courier','select',false,'off'],
    ['preferred_courier_other','Other courier name','text',true,'off'],
    ['courier_account_no','Courier collect account (optional)','text',false,'off'],
    ['cart_reminder_opt_in','Email me reminders about items left in my cart. I can turn these reminders off at any time.','checkbox',false,'off']
  ];
  const registrationInputs=registrationDefinitions.map(([name])=>name);
  const registrationField=(form,[name,label,type,required,autocomplete])=>{
    let input=form.elements?.namedItem(name);
    let field=input?.closest('label');
    if(!field){
      field=document.createElement('label');
      if(type==='select'){
        field.append(document.createTextNode(label));
        input=document.createElement('select');
        input.name=name;
        ['', 'DHL','FedEx','UPS','EMS','SF Express','Other'].forEach(value=>{
          const option=document.createElement('option');
          option.value=value;
          option.textContent=value||'No collect account';
          input.appendChild(option);
        });
        field.appendChild(input);
      }else if(type==='checkbox'){
        field.className='reminder-consent';
        input=document.createElement('input');
        input.type='checkbox';
        input.name=name;
        input.value='true';
        const span=document.createElement('span');
        span.textContent=label;
        field.append(input,span);
      }else{
        field.append(document.createTextNode(label));
        input=document.createElement('input');
        input.type=type;
        input.name=name;
        input.autocomplete=autocomplete;
        if(required)input.required=true;
        field.appendChild(input);
        if(name==='tax_id'){
          const help=document.createElement('small');
          help.textContent='Enter the importer or customs identification number requested by your local customs authority or courier (for example, an EORI or Importer Number). This is not a general business registration number. Leave it blank if not required.';
          field.appendChild(help);
        }
      }
    }
    field.dataset.lznRegistrationField='1';
    if(['address_line_1','address_line_2','courier_account_no','cart_reminder_opt_in'].includes(name))field.classList.add('wide');
    return field;
  };
  const updateRegistrationOtherCourier=(form,enabled=form.dataset.lznSignupMode==='1')=>{
    const select=form.elements?.namedItem('preferred_courier');
    const input=form.elements?.namedItem('preferred_courier_other');
    const field=input?.closest('label');
    const show=Boolean(enabled&&select?.value==='Other');
    if(field)field.hidden=!show;
    if(input){input.disabled=!show;input.required=show}
  };
  const setRegistrationMode=(form,enabled)=>{
    form.dataset.lznSignupMode=enabled?'1':'0';
    registrationInputs.forEach(name=>{
      const input=form.elements?.namedItem(name);
      const field=input?.closest('label');
      if(field)field.hidden=!enabled;
      if(input)input.disabled=!enabled;
    });
    updateRegistrationOtherCourier(form,enabled);
    const signIn=form.querySelector('button[name="mode"][value="signin"]');
    const signUp=form.querySelector('button[name="mode"][value="signup"]');
    if(signIn)signIn.textContent=enabled?'Back to sign in':'Sign In';
    if(signUp)signUp.textContent='Create company account';
    const heading=form.closest('article,section,dialog,div')?.querySelector('h2');
    if(heading){
      if(!heading.dataset.lznOriginalText)heading.dataset.lznOriginalText=heading.textContent;
      heading.textContent=enabled?'Create company account':heading.dataset.lznOriginalText;
    }
  };
  const registrationStatus=form=>{
    let status=form.querySelector('#authStatus,#accountStatus,#deviceAuthStatus,.form-status,.account-status');
    if(!status){
      status=document.createElement('p');
      status.className='form-status';
    }
    return status;
  };
  const submitCompanyRegistration=async(event,form,signUp)=>{
    if(event.submitter!==signUp&&event.submitter?.value!=='signup')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(form.dataset.lznSignupMode!=='1'){setRegistrationMode(form,true);return}
    if(!form.reportValidity()||form.dataset.lznSubmitting==='1')return;
    const status=registrationStatus(form);
    form.insertBefore(status,signUp);
    form.dataset.lznSubmitting='1';
    signUp.disabled=true;
    status.textContent='Creating your company account…';
    const values=Object.fromEntries(new FormData(form));
    const profile={
      company_name:String(values.company_name||'').trim(),
      full_name:String(values.full_name||'').trim(),
      phone:String(values.phone||'').trim(),
      whatsapp:String(values.whatsapp||'').trim(),
      country:String(values.country||'').trim(),
      postal_code:String(values.postal_code||'').trim(),
      address_line_1:String(values.address_line_1||'').trim(),
      address_line_2:String(values.address_line_2||'').trim(),
      city:String(values.city||'').trim(),
      state_province:String(values.state_province||'').trim(),
      tax_id:String(values.tax_id||'').trim(),
      preferred_courier:String(values.preferred_courier||'').trim(),
      preferred_courier_other:String(values.preferred_courier_other||'').trim(),
      courier_account_no:String(values.courier_account_no||'').trim(),
      cart_reminder_opt_in:values.cart_reminder_opt_in==='true',
      buyer_type:'company'
    };
    const result=await commerceClient.auth.signUp({
      email:values.email,
      password:values.password,
      options:{
        emailRedirectTo:location.origin+location.pathname+'?email-confirmed=1',
        data:{company_name:profile.company_name,full_name:profile.full_name,buyer_type:'company',cart_reminder_opt_in:profile.cart_reminder_opt_in,preferred_courier_other:profile.preferred_courier_other||null,registration_profile:profile}
      }
    });
    form.dataset.lznSubmitting='0';
    signUp.disabled=false;
    status.textContent=result.error?result.error.message:'Check your email to confirm the account. Your company and shipping profile will be saved automatically after confirmation.';
    if(!result.error){
      localStorage.setItem('lzn-awaiting-email-confirmation','1');
      localStorage.setItem('lznDevicesAwaitingEmailConfirmation','1');
    }
  };
  const setupAuthForm=form=>{
    if(!form||form.dataset.lznAuthEnhanced)return;
    const signIn=form.querySelector('button[name="mode"][value="signin"]');
    const signUp=form.querySelector('button[name="mode"][value="signup"]');
    if(!signIn||!signUp)return;
    form.dataset.lznAuthEnhanced='1';
    const passwordField=form.elements?.namedItem('password')?.closest('label');
    if(passwordField)passwordField.insertAdjacentElement('afterend',signIn);
    registrationDefinitions.forEach(definition=>form.insertBefore(registrationField(form,definition),signUp));
    const status=registrationStatus(form);
    form.insertBefore(status,signUp);
    form.appendChild(signUp);
    setRegistrationMode(form,false);
    form.elements?.namedItem('preferred_courier')?.addEventListener('change',()=>updateRegistrationOtherCourier(form));
    form.addEventListener('submit',event=>submitCompanyRegistration(event,form,signUp),true);
    signUp.addEventListener('click',event=>{
      if(form.dataset.lznSignupMode==='1')return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setRegistrationMode(form,true);
      form.elements.namedItem('company_name')?.focus();
    },true);
    signIn.addEventListener('click',event=>{
      if(form.dataset.lznSignupMode!=='1')return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setRegistrationMode(form,false);
      form.elements.namedItem('email')?.focus();
    },true);
  };
  const enhanceProfileCourierOther=form=>{
    if(!form||form.dataset.lznOtherCourierEnhanced)return;
    const select=form.elements?.namedItem('preferred_courier');
    if(!select)return;
    form.dataset.lznOtherCourierEnhanced='1';
    const field=document.createElement('label');
    field.className='wide';
    field.append(document.createTextNode('Other courier name'));
    const input=document.createElement('input');
    input.type='text';
    input.dataset.lznOtherCourier='1';
    input.autocomplete='organization';
    input.value=String(commerceAccess.session?.user?.user_metadata?.preferred_courier_other||'');
    field.appendChild(input);
    select.closest('label')?.insertAdjacentElement('afterend',field);
    const update=()=>{
      const show=select.value==='Other';
      field.hidden=!show;
      input.disabled=!show;
      input.required=show;
    };
    select.addEventListener('change',update);
    form.addEventListener('submit',()=>{
      const value=select.value==='Other'?input.value.trim():'';
      commerceClient?.auth.updateUser({data:{preferred_courier_other:value||null}});
    },true);
    update();
  };
  const renderCompanyProfile=()=>{
    document.querySelectorAll('#commerceBody,#accountBody').forEach(container=>{
      const existing=container.querySelector(':scope > .lzn-company-profile-summary');
      const shouldShow=commerceAccess.allowed&&commerceAccess.profile&&!container.querySelector('form')&&/Signed in as/i.test(container.textContent);
      if(!shouldShow){existing?.remove();return}
      let summary=existing;
      if(!summary){
        summary=document.createElement('dl');
        summary.className='lzn-company-profile-summary';
        summary.innerHTML='<div><dt>Company</dt><dd></dd></div><div><dt>Manager / Contact</dt><dd></dd></div>';
        const anchor=[...container.querySelectorAll('p')].find(node=>/Signed in as/i.test(node.textContent));
        (anchor||container.firstElementChild)?.insertAdjacentElement('afterend',summary);
      }
      const values=[commerceAccess.profile.company_name||'—',commerceAccess.profile.full_name||'—'];
      summary.querySelectorAll('dd').forEach((node,index)=>{
        if(node.textContent!==values[index])node.textContent=values[index];
      });
    });
  };
  const prefillCourierCollect=form=>{
    if(!form||form.dataset.lznCourierEnhanced)return;
    const freight=form.elements?.namedItem('freight_method');
    const courier=form.elements?.namedItem('courier');
    const account=form.elements?.namedItem('courier_account_no');
    if(!freight||!courier||!account)return;
    form.dataset.lznCourierEnhanced='1';
    const applySavedCourier=()=>{
      if(freight.value!=='collect'||form.dataset.lznCourierPrefilled==='1')return;
      const profile=commerceAccess.profile;
      if(!profile?.preferred_courier&&!profile?.courier_account_no)return;
      if(profile.preferred_courier){
        const exact=[...courier.options].find(option=>option.value===profile.preferred_courier);
        if(exact)courier.value=exact.value;
        else{
          const other=[...courier.options].find(option=>option.value==='Other');
          if(other){
            courier.value='Other';
            const otherInput=form.elements.namedItem('other_courier');
            if(otherInput&&!otherInput.value)otherInput.value=profile.preferred_courier;
          }
        }
      }
      if(profile.courier_account_no&&!account.value)account.value=profile.courier_account_no;
      form.dataset.lznCourierPrefilled='1';
      courier.dispatchEvent(new Event('change',{bubbles:true}));
    };
    form.addEventListener('change',event=>{
      if(event.target?.name==='freight_method')applySavedCourier();
    });
    applySavedCourier();
  };
  const enhanceAuthUi=()=>{
    document.querySelectorAll('#authForm,#hubAuthForm,#deviceAuthForm,form').forEach(form=>setupAuthForm(form));
    enhanceProfileCourierOther(document.querySelector('#profileForm'));
    prefillCourierCollect(document.querySelector('#checkoutForm'));
    renderCompanyProfile();
  };
  const authUiObserver=new MutationObserver(()=>enhanceAuthUi());
  const startAuthUiEnhancement=()=>{
    enhanceAuthUi();
    authUiObserver.observe(document.body,{childList:true,subtree:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startAuthUiEnhancement,{once:true});
  else startAuthUiEnhancement();

  const syncedRegistrations=new Set();
  const syncRegistrationProfile=async session=>{
    const profile=session?.user?.user_metadata?.registration_profile;
    if(!profile||syncedRegistrations.has(session.user.id))return;
    syncedRegistrations.add(session.user.id);
    const allowed=['company_name','full_name','phone','whatsapp','country','postal_code','address_line_1','address_line_2','city','state_province','tax_id','preferred_courier','courier_account_no','cart_reminder_opt_in','buyer_type'];
    const values=Object.fromEntries(allowed.filter(key=>Object.hasOwn(profile,key)).map(key=>[key,profile[key]]));
    values.buyer_type='company';
    const {error}=await commerceClient.from('profiles').update(values).eq('id',session.user.id);
    if(!error)await commerceClient.auth.updateUser({data:{registration_profile:null}});
  };
  const verifyCommerceAccess=async session=>{
    commerceAccess.session=session||null;
    commerceAccess.profile=null;
    commerceAccess.allowed=false;
    if(session?.user&&commerceClient){
      await syncRegistrationProfile(session);
      const {data,error}=await commerceClient.from('profiles').select('buyer_type,company_name,full_name,preferred_courier,courier_account_no').eq('id',session.user.id).maybeSingle();
      if(!error&&data){
        const customCourier=String(session.user.user_metadata?.preferred_courier_other||'').trim();
        if(data.preferred_courier==='Other'&&customCourier)data.preferred_courier=customCourier;
        commerceAccess.profile=data;
        commerceAccess.allowed=data.buyer_type==='company'&&Boolean(String(data.company_name||'').trim());
      }
    }
    renderCommerceAccess();
    enhanceAuthUi();
  };
  window.dispatchEvent=event=>{
    if(event?.type==='lzn:add-cart'&&!commerceAccess.allowed){
      renderCommerceAccess();
      ensureCommerceNotice().scrollIntoView({behavior:'smooth',block:'center'});
      return false;
    }
    return nativeDispatch(event);
  };
  document.addEventListener('click',event=>{
    if(commerceAccess.allowed)return;
    const blocked=event.target.closest('#cartButton,[data-card-add],[data-add-cart],#addOrderLine,.add-cart,.card-add-button,[data-color-index],[data-cart-add]');
    if(!blocked)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    renderCommerceAccess();
    ensureCommerceNotice().scrollIntoView({behavior:'smooth',block:'center'});
  },true);
  if(commerceClient){
    commerceClient.auth.getSession().then(({data})=>verifyCommerceAccess(data.session));
    commerceClient.auth.onAuthStateChange((_event,session)=>{setTimeout(()=>verifyCommerceAccess(session),0)});
  }else{
    document.addEventListener('DOMContentLoaded',renderCommerceAccess,{once:true});
  }

  const host=location.hostname.toLowerCase();
  const section=location.pathname.split('/').filter(Boolean)[0]||'';const kind=section==='devices'?'devices':section==='tools'?'tools':section==='frames'?'frames':section==='lenses'?'lens':'www';
  document.body.classList.add('portfolio-'+kind);
  const sites=[['ALL PRODUCTS','/','www'],['DEVICES','/devices/','devices'],['TOOLS','/tools/','tools'],['LENSES','/lenses/','lens'],['FRAMES','/frames/','frames']];
  const toolSeries=[['Motorized Chairs','#/category/chairs'],['Motorized Tables','#/category/tables'],['PD Measurement','#/category/pd'],['Grooving & Beveling','#/category/grooving'],['Lens Cutting','#/category/pattern'],['Hand Edgers','#/category/edging'],['Drilling','#/category/drilling'],['Frame Heaters','#/category/heaters'],['Lensmeters','#/category/lensmeter'],['Optical Pliers','#/category/pliers']];
  const categoryMenus={
    www:[['Devices','#devices'],['Tools','#tools'],['Frames','#frames'],['Lens','#lens']],
    tools:Array.isArray(window.CATALOG_DATA)?window.CATALOG_DATA.map(category=>[category.en,`#/category/${category.id}`]):toolSeries,
    devices:[['Unit Tables','#products'],['Lens Processing','#lens-processing'],['Vision Test','#vision-test'],['Motorized Tables','#motorized-tables'],['Digital Solutions','#digital-solutions']],
    lens:[['All Lenses','all'],['Single Vision','single'],['Progressive','progressive'],['Semi-Finished','semi']],
    frames:[['Classic Browline','#series-86'],['Modern Browline','#series-87'],['Super Engineered Ultem','#series-ULTEM-TITANIUM'],['Lightweight Ultem','#series-LIGHT-ULTEM'],['Ultem-Ppsu Kids','#series-ULTEM-PPSU'],['Kids Myopia Control','#series-KIDS-CONTROL'],['Teen Ppsu Flex','#series-TEEN-PPSU']]
  };
  if(kind==='devices'){
    document.querySelector('.optical-grid')?.closest('section')?.setAttribute('id','lens-processing');
    document.querySelector('.vision-grid')?.closest('section')?.setAttribute('id','vision-test');
    document.querySelector('.motorized-section')?.setAttribute('id','motorized-tables');
    [...document.querySelectorAll('main > .section')].find(section=>/DIGITAL OPTICAL SOLUTIONS/i.test(section.textContent))?.setAttribute('id','digital-solutions');
  }
  const activateCategory=target=>{
    if(kind==='lens'&&!target.startsWith('#')&&!target.startsWith('.')){document.querySelector(`.filters [data-filter="${target}"]`)?.click();document.querySelector('#catalog')?.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(target.startsWith('#/')){location.hash=target.slice(1);return}
    document.querySelector(target)?.scrollIntoView({behavior:'smooth',block:'start'});
  };
  document.querySelectorAll('a.admin-link,a[href*="/admin"]').forEach(x=>x.remove());
  document.querySelectorAll('header img[alt*="LZN" i], footer img[alt*="LZN" i], .contact img[alt="LZN"]').forEach(img=>{img.src='/tools/lzn-transparent-logo.svg?v=original-ai';img.classList.add('portfolio-logo')});
  const header=document.querySelector('body > header');
  if(header&&!header.querySelector('.portfolio-switcher')){
    const nav=document.createElement('nav');nav.className='portfolio-switcher';nav.setAttribute('aria-label','LZN product departments');nav.innerHTML=sites.map(([n,u,k])=>`<a href="${u}" ${k===kind?'aria-current="page"':''}>${n}</a>`).join('');header.appendChild(nav);
    const names={www:['LZN Medical','All Optical Products'],devices:['LZN Medical','Devices'],tools:['LZN Medical','Tools & Equipment'],lens:['LZN Medical','Optical Lenses'],frames:['LZN Medical','Optical Frames']};
    const brand=header.querySelector(':scope > .brand,:scope > .wordmark');if(brand){brand.href='/';brand.setAttribute('aria-label','LZN Medical all products');let copy=brand.querySelector('span');if(!copy){copy=document.createElement('span');brand.appendChild(copy)}copy.className='portfolio-brand-copy';const [title,sub]=names[kind];copy.innerHTML=`<strong>${title}</strong><small>${sub}</small>`}
    const account=document.getElementById('accountButton');const cart=document.getElementById('cartButton');
    if(account&&!/signed/i.test(account.textContent))account.textContent='Sign in';
    if(cart){const badge=cart.querySelector('#cartCount,.lzn-shared-cart-count');[...cart.childNodes].forEach(node=>{if(node!==badge)node.remove()});cart.insertBefore(document.createTextNode('Cart '),badge||null);cart.className='portfolio-cart-button'}
    header.querySelectorAll(':scope > nav:not(.portfolio-switcher),:scope > .header-tools,:scope > .header-actions').forEach(node=>node.remove());
    const menuItems=categoryMenus[kind]||[];const actions=document.createElement('nav');actions.className='portfolio-actions';actions.setAttribute('aria-label','Categories, contact and account');actions.innerHTML=`<div class="portfolio-category-menu"><button class="portfolio-category-trigger" type="button" aria-expanded="false" aria-haspopup="true">Categories <span aria-hidden="true">⌄</span></button><div class="portfolio-category-dropdown" role="menu">${menuItems.map(([name,target])=>`<a href="${target.startsWith('#')?target:'#'}" data-category-target="${target}" role="menuitem">${name}</a>`).join('')}</div></div><a href="#contact">Contact</a>`;if(account)actions.appendChild(account);if(cart)actions.appendChild(cart);header.appendChild(actions);
    const categoryMenu=actions.querySelector('.portfolio-category-menu');const categoryTrigger=actions.querySelector('.portfolio-category-trigger');const closeCategoryMenu=()=>{categoryMenu.classList.remove('open');categoryTrigger.setAttribute('aria-expanded','false')};categoryTrigger.onclick=event=>{event.stopPropagation();const open=categoryMenu.classList.toggle('open');categoryTrigger.setAttribute('aria-expanded',String(open))};categoryMenu.querySelectorAll('[data-category-target]').forEach(link=>link.onclick=event=>{event.preventDefault();activateCategory(link.dataset.categoryTarget);closeCategoryMenu()});document.addEventListener('click',event=>{if(!categoryMenu.contains(event.target))closeCategoryMenu()});categoryMenu.addEventListener('keydown',event=>{if(event.key==='Escape'){closeCategoryMenu();categoryTrigger.focus()}});
  }
  const config={
    tools:{label:'LZN Tools Catalog',title:'Optical Tools & Equipment',desc:'Choose an equipment series, then explore every product for your optical workshop.',series:toolSeries},
    devices:{label:'LZN Devices Catalog',title:'Ophthalmic Devices',desc:'Select a device series for refraction, diagnostics and optical-room workflow.',series:categoryMenus.devices},
    lens:{label:'LZN Lens Catalog',title:'Optical Lens Collection',desc:'Select a lens series for single vision, progressive and semi-finished supply.',series:categoryMenus.lens.map(([name,target])=>[name.replace(' Lenses',''),target])},
    frames:{label:'LZN Eyewear Catalog',title:'Optical Frame Collection',desc:'Select a frame series organized by construction, generation and wearing style.',series:categoryMenus.frames}
  };
  const cleanText=value=>String(value||'').replace(/\s+/g,' ').trim();
  const genericLabel=value=>/^(?:featured\s+|representative\s+|selected\s+)?(?:lzn\s+)?products?(?:\s+details?)?$/i.test(cleanText(value));
  const filenameModel=src=>{
    const file=decodeURIComponent(String(src||'').split('/').pop()||'').replace(/[?#].*$/,'').replace(/\.[^.]+$/,'').replace(/(?:[-_](?:photo|product|card|thumb|image))$/i,'').replace(/[-_]+/g,' ');
    return cleanText(file)||'Product';
  };
  const makeProduct=(image,card)=>{
    if(!image?.src||/logo|qr|brochure|wechat|whatsapp/i.test(image.src))return null;
    if(card.matches('.category-card')&&kind==='tools'&&Array.isArray(window.CATALOG_DATA)){
      const categoryName=cleanText(card.querySelector('.category-copy h3')?.textContent||image.alt);
      const category=window.CATALOG_DATA.find(item=>cleanText(item.en)===categoryName);
      const product=category?.items?.[0];
      if(product){const model=cleanText(product.model)||filenameModel(image.src);return{src:image.src,alt:model,label:categoryName?`${categoryName} · ${model}`:model}}
    }
    let model=cleanText(card.dataset.model||card.querySelector('h3,h4')?.textContent||card.dataset.title||image.alt);
    if(!model||genericLabel(model))model=filenameModel(image.src);
    let category=cleanText(card.querySelector('.card-kicker,.type,.meta .pill,.pill,p')?.textContent);
    if(genericLabel(category)||category.toLowerCase()===model.toLowerCase())category='';
    return{src:image.src,alt:model,label:category?`${category} · ${model}`:model};
  };
  const productImages=()=>[...document.querySelectorAll('main img')].map(image=>{
    const card=image.closest('.product-card,.equipment-card,.card,.portfolio-card,.category-card');
    return card?makeProduct(image,card):null;
  }).filter(Boolean);
  const framePortraits=()=>[...document.querySelectorAll('img.hero-model-photo,.card-img.model-wear img')].filter(image=>image.src).map(image=>{
    const alt=cleanText(image.alt);const altModel=alt.match(/\bModel\s+([A-Z0-9-]+)/i)?.[1];
    let card=image.closest('.card');
    if(!card&&altModel)card=[...document.querySelectorAll('.card[data-model]')].find(item=>item.dataset.model===altModel);
    const model=cleanText(card?.dataset.model||card?.querySelector('h3')?.textContent||altModel)||filenameModel(image.src);
    const category=cleanText(card?.querySelector('.card-kicker')?.textContent);
    return{src:image.src,alt:model,label:category?`${category} · ${model}`:model};
  });
  const shuffle=a=>a.map(v=>[Math.random(),v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]);
  function pickImages(){const portraits=kind==='frames'?framePortraits():[];const a=portraits.length?portraits:productImages();return shuffle(a).slice(0,6)}
  if(kind==='www'){
    const products=[...document.querySelectorAll('.portfolio-card')].map(card=>{const image=card.querySelector('img');return{image:image?.src,category:cleanText(card.querySelector('small')?.textContent),model:cleanText(card.querySelector('strong')?.textContent)||filenameModel(image?.src),description:cleanText(card.querySelector('span')?.textContent)||'Professional optical product',url:card.href}}).filter(p=>p.image);
    if(products.length){let pool=shuffle(products);let cursor=0;const showcase=document.createElement('section');showcase.className='home-product-showcase';showcase.innerHTML=`<div class="home-product-visual"><img alt="LZN representative product"></div><div class="home-product-copy"><small>REPRESENTATIVE PRODUCT</small><p class="home-product-category"></p><h1 class="home-product-model"></h1><p class="home-product-description"></p><div class="home-product-filters">${['All','Devices','Tools','Lens','Frames'].map((name,i)=>`<button type="button" class="${i?'':'active'}" data-category="${name}">${name}</button>`).join('')}</div><a class="home-product-link" href="#">View collection →</a></div>`;document.querySelector('main')?.insertBefore(showcase,document.querySelector('main')?.firstChild||null);const image=showcase.querySelector('.home-product-visual img');const category=showcase.querySelector('.home-product-category');const model=showcase.querySelector('.home-product-model');const description=showcase.querySelector('.home-product-description');const link=showcase.querySelector('.home-product-link');let selected='All';const show=()=>{const choices=selected==='All'?products:products.filter(p=>p.category.toLowerCase()===selected.toLowerCase());if(!choices.length)return;const p=selected==='All'?pool[cursor++%pool.length]:choices[Math.floor(Math.random()*choices.length)];image.style.opacity='.1';setTimeout(()=>{image.src=p.image;image.alt=p.category?`${p.category} ${p.model}`:p.model;image.classList.toggle('portrait',p.category==='Frames');category.textContent=p.category;model.textContent=p.model;description.textContent=p.description;link.href=p.url;link.textContent=p.category?`View ${p.category} collection →`:'View product →';image.style.opacity='1'},180)};showcase.querySelectorAll('.home-product-filters button').forEach(button=>button.onclick=()=>{selected=button.dataset.category;showcase.querySelectorAll('.home-product-filters button').forEach(b=>b.classList.toggle('active',b===button));show()});show();setInterval(show,4500)}
  }
  if(kind!=='www'&&config[kind]){
    const oldHero=document.querySelector('main > .hero');if(oldHero)oldHero.style.display='none';
    const deck=document.createElement('section');deck.className='series-deck';const c=config[kind];
    deck.innerHTML=`<div class="series-deck-inner"><div class="series-copy"><small>${c.label}</small><h1>${c.title}</h1><p>${c.desc}</p><div class="series-pills">${c.series.map((s,i)=>`<button type="button" data-target="${s[1]}" class="${i?'':'active'}">${s[0]}</button>`).join('')}</div></div><div class="series-visual"><img alt="Featured LZN product"><span hidden></span></div></div>`;
    const main=document.querySelector('main');main.insertBefore(deck,main.firstChild);const heroImg=deck.querySelector('.series-visual img');
    const modelLabel=deck.querySelector('.series-visual span');const rotate=()=>{const p=pickImages()[0];if(p){heroImg.style.opacity='.15';setTimeout(()=>{heroImg.src=p.src;heroImg.alt=p.alt;modelLabel.textContent=p.label||p.alt;modelLabel.hidden=false;heroImg.style.opacity='1'},180)}};rotate();setInterval(rotate,4500);
    deck.querySelectorAll('.series-pills button').forEach(b=>b.onclick=()=>{deck.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');activateCategory(b.dataset.target)});
  }
  const footerNames={www:'Connected Optical Solutions',devices:'Professional Ophthalmic Device Collection',tools:'Professional Optical Tools & Equipment',lens:'Professional Optical Lens Collection',frames:'Professional Optical Frame Collection'};
  document.querySelector('main #contact')?.remove();
  document.querySelector('body > footer')?.remove();
  const unifiedFooter=document.createElement('section');unifiedFooter.id='contact';unifiedFooter.className='portfolio-contact-footer';unifiedFooter.innerHTML=`<div class="footer-brand"><img src="/tools/lzn-transparent-logo.svg?v=original-ai" alt="LZN"><p>${footerNames[kind]}</p></div><div class="contact-info"><a href="tel:+8613062619570"><span>TEL</span><strong>+86 130 6261 9570</strong></a><a href="mailto:sales@lznmed.com"><span>EMAIL</span><strong>sales@lznmed.com</strong></a></div><div class="qr-row"><div class="qr-card"><img src="/devices/assets/whatsapp.webp" alt="WhatsApp QR"><strong>WhatsApp</strong></div><div class="qr-card"><img src="/devices/assets/wechat.webp" alt="WeChat QR"><strong>WeChat</strong></div></div><nav class="portfolio-policy-links" aria-label="Store policies"><a href="/policies/#terms">Terms &amp; Conditions</a><a href="/policies/#privacy">Privacy</a><a href="/policies/#shipping">Shipping</a><a href="/policies/#returns">Returns &amp; Refunds</a><a href="/policies/#warranty">Warranty</a><a href="/policies/#cookies">Cookies</a></nav><p class="copyright">© 2026 LZN MEDICAL CO., LTD. All Rights Reserved.</p>`;document.querySelector('main')?.appendChild(unifiedFooter);
})();
