/* =====================================================================
   api.js — API client, safe storage, formatting, icons, toasts.
   Loaded first on every page; everything hangs off window.EL.
   ===================================================================== */
(function () {
  'use strict';

  /* ---------------------------------------------------------- API base */
  // deploy_website rewrites __PORT_5000__ to the proxy path. Locally the
  // placeholder survives, so we fall back to a same-origin relative base.
  var RAW = '__PORT_5000__';
  var API_BASE = RAW.indexOf('__') === 0 ? '' : RAW.replace(/\/$/, '');

  /* --------------------------------------------- storage (opaque-origin
     safe: the preview iframe throws on localStorage access, so every call
     is wrapped and falls back to an in-memory map) ------------------- */
  var memory = {};
  var storageWorks = (function () {
    try {
      var k = '__el_probe__';
      window.localStorage.setItem(k, '1');
      window.localStorage.removeItem(k);
      return true;
    } catch (err) {
      return false;
    }
  })();

  var store = {
    available: storageWorks,
    get: function (key, fallback) {
      try {
        if (storageWorks) {
          var raw = window.localStorage.getItem(key);
          if (raw !== null) return JSON.parse(raw);
        }
      } catch (err) {
        /* ignore — fall through to memory */
      }
      return Object.prototype.hasOwnProperty.call(memory, key) ? memory[key] : fallback;
    },
    set: function (key, value) {
      memory[key] = value;
      try {
        if (storageWorks) window.localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        /* in-memory only — never let this break the cart */
      }
      return value;
    },
    remove: function (key) {
      delete memory[key];
      try {
        if (storageWorks) window.localStorage.removeItem(key);
      } catch (err) {
        /* ignore */
      }
    },
  };

  /* ------------------------------------------------------------- fetch */
  function authHeaders() {
    var token = store.get('elegant_token', '');
    return token ? { Authorization: 'Bearer ' + token } : {};
  }

  async function request(method, path, body, opts) {
    opts = opts || {};
    var init = { method: method, headers: Object.assign({}, authHeaders(), opts.headers || {}) };
    if (body instanceof FormData) {
      init.body = body;
    } else if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    var res;
    try {
      res = await fetch(API_BASE + path, init);
    } catch (err) {
      throw Object.assign(new Error('Network error — is the server running?'), { status: 0 });
    }
    var data = null;
    var text = await res.text();
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = { message: text };
    }
    if (!res.ok) {
      throw Object.assign(new Error((data && data.message) || 'Request failed (' + res.status + ')'), {
        status: res.status,
        errors: (data && data.errors) || null,
        data: data,
      });
    }
    return data;
  }

  var api = {
    base: API_BASE,
    get: function (p) {
      return request('GET', p);
    },
    post: function (p, b) {
      return request('POST', p, b === undefined ? {} : b);
    },
    put: function (p, b) {
      return request('PUT', p, b);
    },
    patch: function (p, b) {
      return request('PATCH', p, b);
    },
    del: function (p) {
      return request('DELETE', p);
    },
  };

  /* -------------------------------------------------------- formatting */
  function money(n) {
    var v = Math.round(Number(n) || 0);
    return '৳' + v.toLocaleString('en-US');
  }
  function titleCase(s) {
    return String(s || '').replace(/\b\w/g, function (c) {
      return c.toUpperCase();
    });
  }
  function stars(rating) {
    var full = Math.round(Number(rating) || 0);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  /** Resolve a stored image path for the current page depth. */
  function img(path) {
    var p = String(path || '');
    if (!p) return (window.ASSET_PREFIX || '') + 'images/hero.png';
    if (/^https?:\/\//.test(p)) return p;
    if (p.indexOf('/uploads') === 0) return API_BASE + p;
    return (window.ASSET_PREFIX || '') + p.replace(/^\.?\//, '');
  }
  function url(page) {
    return (window.ASSET_PREFIX || '') + page;
  }
  function qs(name) {
    return new URLSearchParams(window.location.search).get(name) || '';
  }

  /* ------------------------------------------------------------ toasts */
  function toast(message, type) {
    var host = document.querySelector('.toasts');
    if (!host) {
      host = document.createElement('div');
      host.className = 'toasts';
      document.body.appendChild(host);
    }
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' toast--' + type : '');
    el.setAttribute('role', 'status');
    el.textContent = message;
    host.appendChild(el);
    setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () {
        el.remove();
      }, 320);
    }, 3200);
  }

  /* ------------------------------------------------------------- icons */
  var ICONS = {
    search:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    heart:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20s-7-4.35-7-9.5A4.5 4.5 0 0 1 12 7a4.5 4.5 0 0 1 7 3.5C19 15.65 12 20 12 20z"/></svg>',
    bag:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8h12l1 12H5L6 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    user:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="9" r="3.2"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>',
    menu:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    arrow:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    check:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 13l4 4L19 7"/></svg>',
    gem:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3l6 5-6 13L6 8l6-5z"/><path d="M6 8h12"/></svg>',
    dress:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3l3 3 3-3"/><path d="M9 3l-2 5 3 2-3 11h10l-3-11 3-2-2-5"/></svg>',
    chip:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4"/></svg>',
    scarf:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 5h14v6a7 7 0 0 1-14 0V5z"/><path d="M9 17v3M15 17v3"/></svg>',
    bagIcon:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 9h14l1 11H4L5 9z"/><path d="M9 9V7a3 3 0 0 1 6 0v2"/></svg>',
    coat:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M8 3l4 3 4-3 4 4-2 3v11H6V10L4 7l4-4z"/><path d="M12 6v15"/></svg>',
    knit:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 8h16v9H4z"/><path d="M4 8l4-4h8l4 4M9 12l3 3 3-3"/></svg>',
    audio:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M5 14v-2a7 7 0 0 1 14 0v2"/><rect x="3" y="13" width="4" height="7" rx="2"/><rect x="17" y="13" width="4" height="7" rx="2"/></svg>',
    watch:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="7" y="6" width="10" height="12" rx="3"/><path d="M10 3h4M10 21h4M12 10v3l2 1"/></svg>',
    home:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 11l8-6 8 6v9H4v-9z"/><path d="M10 20v-5h4v5"/></svg>',
    truck:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/></svg>',
    instagram:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4" y="4" width="16" height="16" rx="5"/><circle cx="12" cy="12" r="3.4"/><circle cx="17" cy="7" r="1"/></svg>',
    facebook:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 8h2V5h-2a4 4 0 0 0-4 4v2H8v3h2v6h3v-6h2.5l.5-3H13V9a1 1 0 0 1 1-1z"/></svg>',
    pinterest:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="12" r="8.5"/><path d="M10 20l2-7M12 13c2.5 0 4-1.6 4-3.6S14.4 6 12.4 6 9 7.5 9 9.4"/></svg>',
    tiktok:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M14 4v9.5a3.5 3.5 0 1 1-3.5-3.5"/><path d="M14 4c.6 2.2 2.2 3.6 4.5 3.8"/></svg>',
    trash:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 7h14M9 7V5h6v2M7 7l1 13h8l1-13"/></svg>',
  };

  /* ---------------------------------------------------- image fallback
     Product imagery is generated asynchronously; if a file is missing we
     never want a broken icon or a grey box, so swap in the hero still. */
  document.addEventListener(
    'error',
    function (e) {
      var el = e.target;
      if (!el || el.tagName !== 'IMG' || el.dataset.fallbackApplied) return;
      el.dataset.fallbackApplied = '1';
      el.src = (window.ASSET_PREFIX || '') + 'images/hero.png';
    },
    true
  );

  window.EL = {
    api: api,
    store: store,
    authHeaders: authHeaders,
    money: money,
    stars: stars,
    titleCase: titleCase,
    escapeHtml: escapeHtml,
    img: img,
    url: url,
    qs: qs,
    toast: toast,
    ICONS: ICONS,
  };
})();
