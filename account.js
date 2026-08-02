const accountClient = window.supabase.createClient('https://snyvexlqpxpqjswizszz.supabase.co', 'sb_publishable_wEQsmWUREF_lKiYm27jF_g_MlAEiomd');
const accountButton = document.querySelector('#accountButton');
let accountSession = null;

function updateAccountLabel() {
  accountButton.textContent = accountSession
    ? (accountSession.user.user_metadata?.full_name || accountSession.user.email.split('@')[0])
    : 'Account';
}

function openAccount() {
  window.LZNUnifiedAccount.open({
    client: accountClient,
    session: accountSession,
    redirectTo: `${location.origin}/?email-confirmed=1`,
    onSignedIn: signedInSession => {
      accountSession = signedInSession || accountSession;
      updateAccountLabel();
    },
    onSignedOut: () => {
      accountSession = null;
      updateAccountLabel();
    }
  });
}

accountButton.addEventListener('click', openAccount);
accountClient.auth.getSession().then(({ data }) => {
  accountSession = data.session;
  updateAccountLabel();
});
accountClient.auth.onAuthStateChange((_event, session) => {
  accountSession = session;
  updateAccountLabel();
});
