/* =====================================================================
   auth.js — JWT session handling for the storefront.
   ===================================================================== */
(function () {
  'use strict';
  var EL = window.EL;
  var store = EL.store;

  var TOKEN_KEY = 'elegant_token';
  var USER_KEY = 'elegant_user';

  function currentUser() {
    return store.get(USER_KEY, null);
  }
  function isLoggedIn() {
    return Boolean(store.get(TOKEN_KEY, ''));
  }
  function setSession(token, user) {
    store.set(TOKEN_KEY, token);
    store.set(USER_KEY, user);
  }
  function logout(redirect) {
    store.remove(TOKEN_KEY);
    store.remove(USER_KEY);
    if (redirect !== false) window.location.href = EL.url('index.html');
  }

  async function login(email, password) {
    var data = await EL.api.post('/api/users/login', { email: email, password: password });
    setSession(data.token, data.user);
    await window.ELCart.syncWishlistAfterLogin();
    return data.user;
  }

  async function signup(name, email, password) {
    var data = await EL.api.post('/api/users/signup', { name: name, email: email, password: password });
    setSession(data.token, data.user);
    await window.ELCart.syncWishlistAfterLogin();
    return data.user;
  }

  /** Refresh the cached profile; silently drops an expired token. */
  async function refresh() {
    if (!isLoggedIn()) return null;
    try {
      var data = await EL.api.get('/api/users/me');
      store.set(USER_KEY, data.user);
      return data.user;
    } catch (err) {
      if (err.status === 401) logout(false);
      return null;
    }
  }

  /** Guard a page that requires a signed-in shopper. */
  function requireAuth() {
    if (isLoggedIn()) return true;
    var back = window.location.pathname.split('/').pop() + window.location.search;
    window.location.href = EL.url('login.html?next=' + encodeURIComponent(back));
    return false;
  }

  window.ELAuth = {
    currentUser: currentUser,
    isLoggedIn: isLoggedIn,
    setSession: setSession,
    login: login,
    signup: signup,
    logout: logout,
    refresh: refresh,
    requireAuth: requireAuth,
  };
})();
