const accountClient = window.supabase.createClient('https://snyvexlqpxpqjswizszz.supabase.co', 'sb_publishable_wEQsmWUREF_lKiYm27jF_g_MlAEiomd');
const accountDialog = document.querySelector('#accountDialog');
const accountBody = document.querySelector('#accountBody');
const accountButton = document.querySelector('#accountButton');
let accountSession = null;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

function updateAccountLabel() {
  accountButton.textContent = accountSession ? (accountSession.user.user_metadata?.full_name || accountSession.user.email.split('@')[0]) : 'Account';
}

function openAccount() {
  if (accountSession) {
    accountBody.innerHTML = `<p class="kicker"><span></span> Company account</p><h2>My Account</h2><p>Signed in as <strong>${escapeHtml(accountSession.user.email)}</strong></p><div class="account-actions"><a href="https://tools.lznmed.com/" class="button primary">Open account & orders</a><button class="button account-signout" id="accountSignOut">Sign out</button></div>`;
    document.querySelector('#accountSignOut').onclick = async () => { await accountClient.auth.signOut(); accountDialog.close(); };
  } else {
    accountBody.innerHTML = `<p class="kicker"><span></span> One LZN account</p><h2>Sign in or register</h2><p>Use the same company account across Devices, Tools, Frames and Lens.</p><form id="hubAuthForm" class="account-form"><label>Email<input name="email" type="email" required autocomplete="email"></label><label>Password<input name="password" type="password" minlength="8" required autocomplete="current-password"></label><label>Company name <input name="company_name" autocomplete="organization"></label><label>Manager / contact name <input name="full_name" autocomplete="name"></label><div class="account-actions"><button class="button primary" name="mode" value="signin">Sign in</button><button class="button account-secondary" name="mode" value="signup">Create account</button></div><p id="accountStatus" class="account-status"></p></form>`;
    document.querySelector('#hubAuthForm').onsubmit = handleAccount;
  }
  accountDialog.showModal();
}

async function handleAccount(event) {
  event.preventDefault();
  const mode = event.submitter.value;
  const form = new FormData(event.currentTarget);
  const status = document.querySelector('#accountStatus');
  if (mode === 'signup' && (!String(form.get('company_name')).trim() || !String(form.get('full_name')).trim())) { status.textContent = 'Company and contact names are required.'; return; }
  status.textContent = 'Please wait…';
  const result = mode === 'signup'
    ? await accountClient.auth.signUp({email:form.get('email'),password:form.get('password'),options:{emailRedirectTo:location.origin + '/?email-confirmed=1',data:{company_name:String(form.get('company_name')).trim(),full_name:String(form.get('full_name')).trim(),buyer_type:'company'}}})
    : await accountClient.auth.signInWithPassword({email:form.get('email'),password:form.get('password')});
  status.textContent = result.error ? result.error.message : (mode === 'signup' ? 'Check your email to confirm your account.' : 'Signed in.');
  if (!result.error && mode === 'signin') setTimeout(openAccount, 250);
}

accountButton.addEventListener('click', openAccount);
document.querySelector('.account-close').addEventListener('click', () => accountDialog.close());
accountClient.auth.getSession().then(({data}) => { accountSession = data.session; updateAccountLabel(); });
accountClient.auth.onAuthStateChange((_event, session) => { accountSession = session; updateAccountLabel(); });

