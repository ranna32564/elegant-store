/* =====================================================================
   cart.js — cart + wishlist state.
   Cart always lives client-side (storage-safe); the wishlist is mirrored
   server-side for signed-in shoppers and kept locally for guests.
   ===================================================================== */
(function () {
  'use strict';
  var EL = window.EL;
  var store = EL.store;
  var CART_KEY = 'elegant_cart';
  var WISH_KEY = 'elegant_wishlist';

  /* ------------------------------------------------------------- cart */
  function getCart() {
    var cart = store.get(CART_KEY, []);
    return Array.isArray(cart) ? cart : [];
  }
  function saveCart(cart) {
    store.set(CART_KEY, cart);
    renderFab();
    document.dispatchEvent(new CustomEvent('cart:change', { detail: cart }));
    return cart;
  }
  function count() {
    return getCart().reduce(function (s, l) {
      return s + l.qty;
    }, 0);
  }
  function subtotal() {
    return getCart().reduce(function (s, l) {
      return s + l.price * l.qty;
    }, 0);
  }
  function add(product, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cart = getCart();
    var line = cart.filter(function (l) {
      return l.productId === product.id;
    })[0];
    if (line) line.qty = Math.min(99, line.qty + qty);
    else
      cart.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: qty,
      });
    saveCart(cart);
    EL.toast(product.name + ' added to your bag', 'ok');
  }
  function setQty(productId, qty) {
    var cart = getCart();
    cart.forEach(function (l) {
      if (l.productId === productId) l.qty = Math.max(1, Math.min(99, qty));
    });
    saveCart(cart);
  }
  function remove(productId) {
    saveCart(
      getCart().filter(function (l) {
        return l.productId !== productId;
      })
    );
  }
  function clear() {
    saveCart([]);
  }

  /* --------------------------------------------------------- wishlist */
  function localWish() {
    var w = store.get(WISH_KEY, []);
    return Array.isArray(w) ? w : [];
  }
  function wishIds() {
    var user = window.ELAuth && window.ELAuth.currentUser();
    if (user && Array.isArray(user.wishlist)) return user.wishlist;
    return localWish();
  }
  function inWishlist(id) {
    return wishIds().indexOf(id) !== -1;
  }
  async function toggleWish(productId) {
    var auth = window.ELAuth;
    if (auth && auth.isLoggedIn()) {
      try {
        var data = await EL.api.post('/api/wishlist/' + productId);
        var user = auth.currentUser() || {};
        user.wishlist = data.ids;
        store.set('elegant_user', user);
        EL.toast(data.added ? 'Saved to your wishlist' : 'Removed from your wishlist', 'ok');
        document.dispatchEvent(new CustomEvent('wishlist:change'));
        return data.added;
      } catch (err) {
        EL.toast(err.message, 'err');
        return inWishlist(productId);
      }
    }
    var ids = localWish();
    var i = ids.indexOf(productId);
    var added = i === -1;
    if (added) ids.push(productId);
    else ids.splice(i, 1);
    store.set(WISH_KEY, ids);
    EL.toast(added ? 'Saved to your wishlist' : 'Removed from your wishlist', 'ok');
    document.dispatchEvent(new CustomEvent('wishlist:change'));
    return added;
  }
  /** Merge a guest wishlist into the account right after login/signup. */
  async function syncWishlistAfterLogin() {
    var ids = localWish();
    try {
      var data = await EL.api.post('/api/wishlist/sync', { ids: ids });
      var user = window.ELAuth.currentUser() || {};
      user.wishlist = data.ids;
      store.set('elegant_user', user);
      store.set(WISH_KEY, []);
    } catch (err) {
      /* non-fatal */
    }
  }

  /* ------------------------------------------- floating cart widget */
  function renderFab() {
    var fab = document.querySelector('.cart-fab');
    if (!fab) return;
    var n = count();
    // The floating bag only exists when there is something in it.
    fab.classList.toggle('is-hidden', n === 0);
    fab.setAttribute('aria-hidden', n === 0 ? 'true' : 'false');
    fab.tabIndex = n === 0 ? -1 : 0;
    fab.querySelector('.cart-fab__count').textContent = n + (n === 1 ? ' ITEM' : ' ITEMS');
    fab.querySelector('.cart-fab__total').textContent = EL.money(subtotal());
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.style.display = n ? '' : 'none';
    });
  }

  window.ELCart = {
    getCart: getCart,
    count: count,
    subtotal: subtotal,
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    renderFab: renderFab,
    wishIds: wishIds,
    inWishlist: inWishlist,
    toggleWish: toggleWish,
    syncWishlistAfterLogin: syncWishlistAfterLogin,
  };
})();
