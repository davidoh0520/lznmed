(() => {
  const awaitingKeys = [
    'lzn-awaiting-email-confirmation',
    'lznDevicesAwaitingEmailConfirmation',
    'lznLensAwaitingEmailConfirmation'
  ];

  const registrationFields = `
    <label data-lzn-unified-registration hidden>Company name<input name="company_name" required disabled autocomplete="organization"></label>
    <label data-lzn-unified-registration hidden>Manager / Contact name<input name="full_name" required disabled autocomplete="name"></label>
    <label data-lzn-unified-registration hidden>Phone<input name="phone" type="tel" required disabled autocomplete="tel"><small>The selected country's calling code is added automatically.</small></label>
    <label data-lzn-unified-registration hidden>WhatsApp (optional)<input name="whatsapp" type="tel" disabled autocomplete="tel"></label>
    <label data-lzn-unified-registration hidden>Country<input name="country" list="profileCountryOptions" required disabled autocomplete="country-name"><datalist id="profileCountryOptions"></datalist><small data-country-status>Choose a country to load its calling code and regions.</small></label>
    <label data-lzn-unified-registration hidden>State / Province<input name="state_province" list="profileStateOptions" required disabled autocomplete="address-level1"><datalist id="profileStateOptions"></datalist></label>
    <label data-lzn-unified-registration hidden>City<input name="city" list="profileCityOptions" required disabled autocomplete="address-level2"><datalist id="profileCityOptions"></datalist></label>
    <label class="wide" data-lzn-unified-registration hidden>Detailed street address<input name="address_line_1" required disabled autocomplete="address-line1" placeholder="Building number and street name"></label>
    <label class="wide" data-lzn-unified-registration hidden>Address line 2 (optional)<input name="address_line_2" disabled autocomplete="address-line2" placeholder="Suite, unit, floor, etc."></label>
    <label data-lzn-unified-registration hidden>Postal code<input name="postal_code" required disabled autocomplete="postal-code"><small data-postal-status>Required for delivery.</small></label>
    <label data-lzn-unified-registration hidden>Importer / Customs ID (optional)<input name="tax_id" disabled autocomplete="off"><small>Enter the importer or customs identification number requested by your local customs authority or courier. Leave it blank if not required.</small></label>
    <label data-lzn-unified-registration hidden>Preferred courier (optional)<select name="preferred_courier" disabled><option value="">No collect account</option><option>DHL</option><option>FedEx</option><option>UPS</option><option>EMS</option><option>SF Express</option><option>Other</option></select></label>
    <label data-lzn-unified-registration data-lzn-other-courier hidden>Other courier name<input name="preferred_courier_other" disabled autocomplete="organization"></label>
    <label class="wide" data-lzn-unified-registration hidden>Courier collect account (optional)<input name="courier_account_no" disabled autocomplete="off"></label>
    <label class="wide reminder-consent" data-lzn-unified-registration hidden><input name="cart_reminder_opt_in" type="checkbox" value="true" disabled><span>Email me reminders about items left in my cart. I can turn these reminders off at any time.</span></label>`;

  function render() {
    return `<section class="lzn-unified-auth">
      <p class="lzn-unified-auth-eyebrow">ONE LZN ACCOUNT</p>
      <h2>Sign in</h2>
      <p class="lzn-unified-auth-intro">Use one account across LZN Medical, Devices, Tools, Frames, and Lenses.</p>
      <form id="lznUnifiedAuthForm" class="lzn-unified-auth-form" data-lzn-auth-enhanced="1">
        <label class="wide">Email<input name="email" type="email" required autocomplete="email"></label>
        <label class="wide">Password<input name="password" type="password" minlength="8" required autocomplete="current-password"></label>
        ${registrationFields}
        <p id="lznUnifiedAuthStatus" class="lzn-unified-auth-status wide" aria-live="polite"></p>
        <div class="lzn-unified-auth-actions wide">
          <button class="lzn-unified-auth-primary" name="mode" value="signin">Sign in</button>
          <button class="lzn-unified-auth-secondary" name="mode" value="signup">Create account</button>
        </div>
        <button class="lzn-unified-auth-resend wide" id="lznUnifiedAuthResend" type="button" hidden>Resend confirmation email</button>
      </form>
    </section>`;
  }

  function setMode(form, signupMode) {
    form.dataset.lznSignupMode = signupMode ? '1' : '0';
    form.querySelectorAll('[data-lzn-unified-registration]').forEach(field => {
      const otherCourier = field.hasAttribute('data-lzn-other-courier');
      const show = signupMode && (!otherCourier || form.elements.preferred_courier?.value === 'Other');
      field.hidden = !show;
      field.querySelectorAll('input,select').forEach(input => { input.disabled = !show; });
    });
    const password = form.elements.password;
    if (password) password.autocomplete = signupMode ? 'new-password' : 'current-password';
    const heading = form.closest('.lzn-unified-auth')?.querySelector('h2');
    if (heading) heading.textContent = signupMode ? 'Create account' : 'Sign in';
    form.querySelector('[value="signin"]').textContent = signupMode ? 'Back to sign in' : 'Sign in';
  }

  function profileFrom(form) {
    const values = Object.fromEntries(new FormData(form));
    return {
      company_name: String(values.company_name || '').trim(),
      full_name: String(values.full_name || '').trim(),
      phone: String(values.phone || '').trim(),
      whatsapp: String(values.whatsapp || '').trim(),
      country: String(values.country || '').trim(),
      state_province: String(values.state_province || '').trim(),
      city: String(values.city || '').trim(),
      address_line_1: String(values.address_line_1 || '').trim(),
      address_line_2: String(values.address_line_2 || '').trim(),
      postal_code: String(values.postal_code || '').trim(),
      tax_id: String(values.tax_id || '').trim(),
      preferred_courier: String(values.preferred_courier || '').trim(),
      preferred_courier_other: String(values.preferred_courier_other || '').trim(),
      courier_account_no: String(values.courier_account_no || '').trim(),
      cart_reminder_opt_in: values.cart_reminder_opt_in === 'true',
      buyer_type: 'company'
    };
  }

  function bind({ form, client, redirectTo, onSignedIn }) {
    if (!form || !client || form.dataset.lznUnifiedBound === '1') return form;
    form.dataset.lznUnifiedBound = '1';
    const signIn = form.querySelector('[value="signin"]');
    const signUp = form.querySelector('[value="signup"]');
    const resend = form.querySelector('#lznUnifiedAuthResend');
    const status = form.querySelector('#lznUnifiedAuthStatus');
    const setBusy = busy => form.querySelectorAll('button').forEach(button => { button.disabled = busy; });

    form.elements.preferred_courier?.addEventListener('change', () => setMode(form, true));
    signUp.addEventListener('click', event => {
      if (form.dataset.lznSignupMode === '1') return;
      event.preventDefault();
      setMode(form, true);
      form.elements.company_name?.focus();
    });
    signIn.addEventListener('click', event => {
      if (form.dataset.lznSignupMode !== '1') return;
      event.preventDefault();
      setMode(form, false);
      form.elements.email?.focus();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const mode = event.submitter?.value || 'signin';
      if (mode === 'signup' && form.dataset.lznSignupMode !== '1') {
        setMode(form, true);
        return;
      }
      if (!form.reportValidity()) return;
      const email = String(form.elements.email.value || '').trim().toLowerCase();
      const password = form.elements.password.value;
      setBusy(true);
      status.textContent = mode === 'signup' ? 'Creating your account…' : 'Signing in…';
      let result;
      if (mode === 'signup') {
        const profile = profileFrom(form);
        result = await client.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectTo,
            data: {
              company_name: profile.company_name,
              full_name: profile.full_name,
              buyer_type: 'company',
              cart_reminder_opt_in: profile.cart_reminder_opt_in,
              preferred_courier_other: profile.preferred_courier_other || null,
              registration_profile: profile
            }
          }
        });
      } else {
        result = await client.auth.signInWithPassword({ email, password });
      }
      setBusy(false);
      if (result.error) {
        status.textContent = result.error.message;
        return;
      }
      if (mode === 'signup') {
        awaitingKeys.forEach(key => localStorage.setItem(key, '1'));
        resend.hidden = false;
        resend.dataset.email = email;
        status.textContent = 'Check your email to confirm the account. Your account and shipping information will be saved automatically after confirmation.';
      } else {
        status.textContent = 'Signed in.';
        if (typeof onSignedIn === 'function') window.setTimeout(() => onSignedIn(result.data.session), 250);
      }
    });
    resend.addEventListener('click', async () => {
      const email = resend.dataset.email;
      if (!email) return;
      resend.disabled = true;
      status.textContent = 'Requesting another confirmation email…';
      const { error } = await client.auth.resend({ type: 'signup', email, options: { emailRedirectTo: redirectTo } });
      status.textContent = error ? error.message : 'Confirmation email requested. Please check spam or junk folders too.';
      window.setTimeout(() => { resend.disabled = false; }, 180000);
    });
    setMode(form, false);
    window.LZNAddressProfile?.enhance(form);
    return form;
  }

  function mount(container, options) {
    container.innerHTML = render();
    return bind({ ...options, form: container.querySelector('#lznUnifiedAuthForm') });
  }

  window.LZNUnifiedAccount = Object.freeze({ render, bind, mount, setMode });
})();
