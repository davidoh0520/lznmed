const accountClient = window.supabase.createClient('https://snyvexlqpxpqjswizszz.supabase.co', 'sb_publishable_wEQsmWUREF_lKiYm27jF_g_MlAEiomd');
const accountDialog = document.querySelector('#accountDialog');
const accountBody = document.querySelector('#accountBody');
const accountButton = document.querySelector('#accountButton');
let accountSession = null;
let accountProfile = null;
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));

function updateAccountLabel() {
  accountButton.textContent = accountSession ? (accountSession.user.user_metadata?.full_name || accountSession.user.email.split('@')[0]) : 'Account';
}

function showAccountDialog() {
  if (!accountDialog.open) accountDialog.showModal();
}

async function loadAccountProfile() {
  if (!accountSession) return {};
  const { data } = await accountClient.from('profiles').select('*').eq('id', accountSession.user.id).maybeSingle();
  const metadata = accountSession.user.user_metadata || {};
  accountProfile = {
    ...(data || {}),
    company_name: data?.company_name || metadata.company_name || '',
    full_name: data?.full_name || metadata.full_name || ''
  };
  return accountProfile;
}

function signedInAccountView(profile = accountProfile || {}) {
  const company = profile.company_name || accountSession.user.user_metadata?.company_name || 'Not added';
  const manager = profile.full_name || accountSession.user.user_metadata?.full_name || 'Not added';
  accountBody.innerHTML = `<p class="kicker"><span></span> Member account</p>
    <h2>My Account</h2>
    <p>Signed in as <strong>${escapeHtml(accountSession.user.email)}</strong></p>
    <div class="account-summary">
      <div><span>Company</span><strong>${escapeHtml(company)}</strong></div>
      <div><span>Manager / Contact</span><strong>${escapeHtml(manager)}</strong></div>
    </div>
    <div class="account-actions">
      <a href="/tools/?account=profile" class="button primary">Edit Account & Shipping</a>
      <a href="/tools/?account=orders" class="button account-secondary">My orders</a>
      <button class="button account-signout" id="accountSignOut">Sign out</button>
    </div>`;
  document.querySelector('#accountSignOut').onclick = async () => { await accountClient.auth.signOut(); accountDialog.close(); };
}

async function openAccount() {
  if (accountSession) {
    accountBody.innerHTML = '<p class="kicker"><span></span> Company account</p><h2>My Account</h2><p>Loading your account…</p>';
    showAccountDialog();
    signedInAccountView(await loadAccountProfile());
    return;
  }
  window.LZNUnifiedAccount.mount(accountBody, {
    client: accountClient,
    redirectTo: `${location.origin}/?email-confirmed=1`,
    onSignedIn: () => openAccount()
  });
  showAccountDialog();
}

function editAccountView() {
  const profile = accountProfile || {};
  accountBody.innerHTML = `<p class="kicker"><span></span> Company account</p>
    <h2>Edit account</h2>
    <form id="accountEditForm" class="account-form">
      <label>Email address<input name="email" type="email" required autocomplete="email" value="${escapeHtml(accountSession.user.email)}"><small>Changing this address sends confirmation emails to the current and new addresses.</small></label>
      <label>Company name<input name="company_name" required autocomplete="organization" value="${escapeHtml(profile.company_name)}"></label>
      <label>Manager / contact name<input name="full_name" required autocomplete="name" value="${escapeHtml(profile.full_name)}"></label>
      <div class="account-actions"><button class="button primary">Save changes</button><button class="button account-secondary" id="accountEditCancel" type="button">Cancel</button></div>
      <p id="accountEditStatus" class="account-status" aria-live="polite"></p>
    </form>`;
  document.querySelector('#accountEditForm').onsubmit = saveAccountChanges;
  document.querySelector('#accountEditCancel').onclick = () => signedInAccountView();
}

async function saveAccountChanges(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const email = String(form.get('email') || '').trim().toLowerCase();
  const companyName = String(form.get('company_name') || '').trim();
  const fullName = String(form.get('full_name') || '').trim();
  const emailChanged = email !== String(accountSession.user.email || '').toLowerCase();
  const status = document.querySelector('#accountEditStatus');
  status.textContent = 'Saving changes…';

  const authAttributes = {
    data: {
      ...(accountSession.user.user_metadata || {}),
      company_name: companyName,
      full_name: fullName,
      buyer_type: 'company'
    }
  };
  if (emailChanged) authAttributes.email = email;
  const authResult = await accountClient.auth.updateUser(authAttributes);
  if (authResult.error) {
    status.textContent = authResult.error.message;
    return;
  }

  const profileResult = await accountClient.from('profiles').update({
    email,
    company_name: companyName,
    full_name: fullName,
    buyer_type: 'company'
  }).eq('id', accountSession.user.id);
  if (profileResult.error) {
    status.textContent = profileResult.error.message;
    return;
  }

  accountProfile = { ...(accountProfile || {}), company_name: companyName, full_name: fullName };
  accountSession = { ...accountSession, user: authResult.data.user || accountSession.user };
  updateAccountLabel();
  status.textContent = emailChanged
    ? 'Account saved. Check the current and new email addresses to confirm the change.'
    : 'Account saved.';
  setTimeout(() => signedInAccountView(), 1200);
}

accountButton.addEventListener('click', openAccount);
document.querySelector('.account-close').addEventListener('click', () => accountDialog.close());
accountClient.auth.getSession().then(({data}) => { accountSession = data.session; updateAccountLabel(); });
accountClient.auth.onAuthStateChange((_event, session) => { accountSession = session; accountProfile = null; updateAccountLabel(); });

