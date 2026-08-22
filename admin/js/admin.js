/* =====================================================================
   admin.js — ELEGANT admin panel: auth guard, navigation rail, dashboard,
   product CRUD, image uploads and order management.
   Depends on ../js/api.js (window.EL) for fetch/format/toast helpers.
   Uses its own token key so an admin session never collides with a
   storefront customer session in the same browser.
   ===================================================================== */
(function () {
  'use strict';

  var EL = window.EL;
  var TOKEN_KEY = 'elegant_admin_token';
  var USER_KEY = 'elegant_admin_user';

  /* ------------------------------------------------------------ session */
  var session = {
    token: function () {
      return EL.store.get(TOKEN_KEY, '');
    },
    user: function () {
      return EL.store.get(USER_KEY, null);
    },
    set: function (token, user) {
      EL.store.set(TOKEN_KEY, token);
      EL.store.set(USER_KEY, user);
    },
    clear: function () {
      EL.store.remove(TOKEN_KEY);
      EL.store.remove(USER_KEY);
    },
  };

  /* ---------------------------------------------------------- transport */
  async function req(method, path, body) {
    var init = { method: method, headers: {} };
    var token = session.token();
    if (token) init.headers.Authorization = 'Bearer ' + token;
    if (body instanceof FormData) {
      init.body = body;
    } else if (body !== undefined) {
      init.headers['Content-Type'] = 'application/json';
      init.body = JSON.stringify(body);
    }
    var res;
    try {
      res = await fetch(EL.api.base + path, init);
    } catch (err) {
      throw Object.assign(new Error('Network error — is the API running on port 5000?'), { status: 0 });
    }
    var text = await res.text();
    var data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch (err) {
      data = { message: text };
    }
    if (res.status === 401 || res.status === 403) {
      session.clear();
      if (!/login\.html$/.test(location.pathname)) {
        location.href = 'login.html?expired=1';
      }
    }
    if (!res.ok) {
      throw Object.assign(new Error((data && data.message) || 'Request failed (' + res.status + ')'), {
        status: res.status,
        errors: (data && data.errors) || null,
      });
    }
    return data;
  }

  var A = {
    get: function (p) {
      return req('GET', p);
    },
    post: function (p, b) {
      return req('POST', p, b === undefined ? {} : b);
    },
    put: function (p, b) {
      return req('PUT', p, b);
    },
    patch: function (p, b) {
      return req('PATCH', p, b);
    },
    del: function (p) {
      return req('DELETE', p);
    },
  };

  /* ------------------------------------------------------------- pieces */
  var MARK =
    '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M7 6.5h10M7 12h7.5M7 17.5h10"/></svg>';

  var NAV_ICONS = {
    dashboard:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.6"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.6"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6"/></svg>',
    products:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 8h14l1 12H4L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    upload:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 16V5m0 0L8 9m4-4 4 4"/><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
    orders:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 4h11l3 3v13H5z"/><path d="M8 10h8M8 14h6"/></svg>',
    store:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 10h16v10H4z"/><path d="M4 10l2-5h12l2 5"/><path d="M9 20v-5h6v5"/></svg>',
    close:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    burger:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    image:
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4.5" width="18" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/></svg>',
  };

  function initials(name) {
    return String(name || 'AD')
      .split(/\s+/)
      .slice(0, 2)
      .map(function (w) {
        return w.charAt(0).toUpperCase();
      })
      .join('');
  }

  function renderRail(active) {
    var host = document.querySelector('[data-rail]');
    if (!host) return;
    var user = session.user() || { name: 'Administrator', email: '' };
    function link(page, key, label) {
      return (
        '<a href="' + page + '"' + (active === key ? ' class="active"' : '') + '>' +
        NAV_ICONS[key] + '<span>' + label + '</span></a>'
      );
    }
    host.className = 'rail';
    host.innerHTML =
      '<div class="rail__brand"><span class="mark">' + MARK + '</span>' +
      '<span><b>Elegant</b><small>Admin console</small></span></div>' +
      '<nav class="rail__nav">' +
      '<p class="rail__label">Overview</p>' +
      link('dashboard.html', 'dashboard', 'Dashboard') +
      '<p class="rail__label">Catalogue</p>' +
      link('products.html', 'products', 'Products') +
      link('upload.html', 'upload', 'Media library') +
      '<p class="rail__label">Sales</p>' +
      link('orders.html', 'orders', 'Orders') +
      '<p class="rail__label">Storefront</p>' +
      '<a href="../index.html">' + NAV_ICONS.store + '<span>View shop</span></a>' +
      '</nav>' +
      '<div class="rail__foot"><div class="rail__who"><span class="av">' + initials(user.name) + '</span>' +
      '<span><b>' + EL.escapeHtml(user.name) + '</b><br><small>' + EL.escapeHtml(user.email) + '</small></span></div>' +
      '<button class="rail__logout" type="button" data-logout>Sign out</button></div>';

    host.querySelector('[data-logout]').addEventListener('click', function () {
      session.clear();
      location.href = 'login.html';
    });

    // Mobile drawer
    var burger = document.querySelector('[data-burger]');
    if (burger) {
      burger.innerHTML = NAV_ICONS.burger;
      var scrim = document.createElement('div');
      scrim.className = 'rail-scrim';
      document.body.appendChild(scrim);
      function close() {
        host.classList.remove('open');
        scrim.classList.remove('on');
      }
      burger.addEventListener('click', function () {
        host.classList.add('open');
        scrim.classList.add('on');
      });
      scrim.addEventListener('click', close);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    }
  }

  function guard() {
    if (!session.token()) {
      location.href = 'login.html?next=' + encodeURIComponent(location.pathname.split('/').pop());
      return false;
    }
    return true;
  }

  function statusPill(status) {
    var map = {
      pending: 'amber',
      processing: 'rose',
      shipped: 'rose',
      delivered: 'green',
      cancelled: 'red',
      paid: 'green',
      failed: 'red',
    };
    return '<span class="pill pill--' + (map[status] || 'grey') + '">' + EL.escapeHtml(status) + '</span>';
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function skeletonRows(host, rows, cols) {
    host.innerHTML = new Array(rows)
      .fill('<div class="skel skel-row"></div>')
      .join('');
  }

  /* =================================================================== */
  /* Page: login                                                         */
  /* =================================================================== */
  function pageLogin() {
    var form = document.getElementById('adminLogin');
    if (!form) return;
    if (EL.qs('expired')) EL.toast('Session expired — please sign in again.', 'error');
    if (session.token()) {
      location.href = 'dashboard.html';
      return;
    }
    var fill = document.getElementById('useDemo');
    if (fill) {
      fill.addEventListener('click', function () {
        form.email.value = 'admin@elegant.com';
        form.password.value = 'password123';
      });
    }
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var errBox = form.querySelector('[data-err="form"]');
      errBox.textContent = '';
      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      try {
        var out = await A.post('/api/admin/login', {
          email: form.email.value.trim(),
          password: form.password.value,
        });
        session.set(out.token, out.user);
        var next = EL.qs('next');
        location.href = next && /^[a-z-]+\.html$/.test(next) ? next : 'dashboard.html';
      } catch (err) {
        errBox.textContent = err.message;
        btn.disabled = false;
        btn.textContent = 'Sign in';
      }
    });
  }

  /* =================================================================== */
  /* Page: dashboard                                                     */
  /* =================================================================== */
  async function pageDashboard() {
    if (!guard()) return;
    renderRail('dashboard');
    var statHost = document.getElementById('statGrid');
    var chart = document.getElementById('revChart');
    var lowHost = document.getElementById('lowStock');
    var topHost = document.getElementById('topProducts');
    var recentHost = document.getElementById('recentOrders');
    var modeNote = document.getElementById('modeNote');

    statHost.innerHTML = new Array(4).fill('<div class="stat"><div class="skel skel-row"></div></div>').join('');

    var data;
    try {
      data = await A.get('/api/admin/dashboard');
    } catch (err) {
      statHost.innerHTML = '<div class="empty"><h3>Could not load analytics</h3><p>' + EL.escapeHtml(err.message) + '</p></div>';
      return;
    }
    var s = data.stats;
    if (modeNote) modeNote.textContent = 'Datastore: ' + (data.mode || 'json');

    statHost.innerHTML =
      '<div class="stat stat--dark"><small>Revenue (paid)</small><b>' + EL.money(s.revenue) + '</b>' +
      '<span class="delta" style="color:rgba(248,239,235,.7)">Avg order ' + EL.money(s.avgOrderValue) + '</span></div>' +
      '<div class="stat"><small>Orders</small><b>' + s.orders + '</b><span class="delta">' + s.pendingOrders + ' awaiting action</span></div>' +
      '<div class="stat"><small>Products live</small><b>' + s.products + '</b><span class="delta">' + (data.lowStock || []).length + ' low on stock</span></div>' +
      '<div class="stat"><small>Customers</small><b>' + s.customers + '</b><span class="delta">' + s.subscribers + ' newsletter subs</span></div>';

    // Revenue chart (hand-built bars — no chart library needed)
    var days = data.revenueByDay || [];
    var max = Math.max.apply(null, days.map(function (d) { return d.revenue; }).concat([1]));
    chart.innerHTML = days
      .map(function (d) {
        var h = Math.max(4, Math.round((d.revenue / max) * 150));
        var label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short' });
        return (
          '<div class="chart__col"><span class="chart__val">' + (d.revenue ? EL.money(d.revenue) : '') + '</span>' +
          '<span class="chart__bar" style="height:' + h + 'px"></span><small>' + label + '</small></div>'
        );
      })
      .join('');

    lowHost.innerHTML = (data.lowStock || []).length
      ? (data.lowStock || [])
          .map(function (p) {
            return (
              '<div class="summary-row" style="display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #f6efe9">' +
              '<span><b style="font-weight:500">' + EL.escapeHtml(p.name) + '</b><br><small class="muted">' + EL.escapeHtml(p.category) + '</small></span>' +
              '<span class="pill pill--' + (p.stock === 0 ? 'red' : 'amber') + '">' + p.stock + ' left</span></div>'
            );
          })
          .join('')
      : '<p class="muted">Every product is comfortably in stock.</p>';

    topHost.innerHTML = (data.topProducts || []).length
      ? '<div class="table-wrap"><table><thead><tr><th>Product</th><th class="num">Units</th><th class="num">Revenue</th></tr></thead><tbody>' +
        data.topProducts
          .map(function (p) {
            return '<tr><td>' + EL.escapeHtml(p.name) + '</td><td class="num">' + p.units + '</td><td class="num">' + EL.money(p.revenue) + '</td></tr>';
          })
          .join('') +
        '</tbody></table></div>'
      : '<p class="muted">No sales recorded yet — place a test order from the storefront to populate this table.</p>';

    recentHost.innerHTML = (data.recentOrders || []).length
      ? '<div class="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Payment</th><th>Status</th><th class="num">Total</th></tr></thead><tbody>' +
        data.recentOrders
          .map(function (o) {
            return (
              '<tr><td><b style="font-weight:500">' + EL.escapeHtml(o.orderNumber) + '</b></td>' +
              '<td>' + EL.escapeHtml((o.customer && o.customer.name) || 'Guest') + '</td>' +
              '<td>' + fmtDate(o.createdAt) + '</td>' +
              '<td>' + EL.escapeHtml(o.paymentMethod) + ' ' + statusPill(o.paymentStatus) + '</td>' +
              '<td>' + statusPill(o.status) + '</td>' +
              '<td class="num">' + EL.money(o.total) + '</td></tr>'
            );
          })
          .join('') +
        '</tbody></table></div>'
      : '<div class="empty"><h3>No orders yet</h3><p>Orders placed on the storefront appear here instantly.</p></div>';
  }

  /* =================================================================== */
  /* Page: products                                                      */
  /* =================================================================== */
  async function pageProducts() {
    if (!guard()) return;
    renderRail('products');

    var tbody = document.getElementById('prodBody');
    var countOut = document.getElementById('prodCount');
    var search = document.getElementById('prodSearch');
    var catFilter = document.getElementById('prodCat');
    var modal = document.getElementById('prodModal');
    var form = document.getElementById('prodForm');
    var modalTitle = document.getElementById('prodModalTitle');
    var all = [];
    var editing = null;

    function visible() {
      var q = (search.value || '').toLowerCase().trim();
      var cat = catFilter.value;
      return all.filter(function (p) {
        if (cat !== 'all' && p.category !== cat) return false;
        if (q && (p.name + ' ' + p.category + ' ' + (p.material || '')).toLowerCase().indexOf(q) === -1) return false;
        return true;
      });
    }

    function draw() {
      var rows = visible();
      countOut.textContent = rows.length + ' of ' + all.length + ' products';
      if (!rows.length) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty"><h3>Nothing matches</h3><p>Try a different search or category.</p></div></td></tr>';
        return;
      }
      tbody.innerHTML = rows
        .map(function (p) {
          var flags = []
            .concat(p.isNewArrival ? ['<span class="pill pill--rose">New</span>'] : [])
            .concat(p.isTrending ? ['<span class="pill pill--amber">Trending</span>'] : [])
            .concat(p.isBestSeller ? ['<span class="pill pill--green">Best</span>'] : []);
          return (
            '<tr data-id="' + p.id + '">' +
            '<td><div class="cellprod"><img src="' + EL.img(p.image) + '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'../images/hero.png\'">' +
            '<span><b>' + EL.escapeHtml(p.name) + '</b><br><small>' + EL.escapeHtml(p.category) + '</small></span></div></td>' +
            '<td class="num">' + EL.money(p.price) + (p.oldPrice ? '<br><small class="muted" style="text-decoration:line-through">' + EL.money(p.oldPrice) + '</small>' : '') + '</td>' +
            '<td><input class="stock-input" type="number" min="0" value="' + Number(p.stock || 0) + '" data-stock aria-label="Stock for ' + EL.escapeHtml(p.name) + '"></td>' +
            '<td>' + (Number(p.rating) || 0).toFixed(1) + ' ★</td>' +
            '<td>' + (flags.join(' ') || '<span class="muted">—</span>') + '</td>' +
            '<td>' + fmtDate(p.createdAt) + '</td>' +
            '<td><div class="rowacts">' +
            '<button class="btn btn--ghost btn--sm" data-edit type="button">Edit</button>' +
            '<button class="btn btn--danger btn--sm" data-del type="button">Delete</button>' +
            '</div></td></tr>'
          );
        })
        .join('');
    }

    async function load() {
      tbody.innerHTML = '<tr><td colspan="7">' + new Array(6).fill('<div class="skel skel-row"></div>').join('') + '</td></tr>';
      try {
        var out = await A.get('/api/admin/products');
        all = out.products || [];
        draw();
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="7"><div class="empty"><h3>Could not load products</h3><p>' + EL.escapeHtml(err.message) + '</p></div></td></tr>';
      }
    }

    function openModal(product) {
      editing = product || null;
      form.reset();
      form.querySelectorAll('.err').forEach(function (e) {
        e.textContent = '';
      });
      modalTitle.textContent = product ? 'Edit product' : 'New product';
      var preview = document.getElementById('prodPreview');
      if (product) {
        ['name', 'category', 'price', 'oldPrice', 'stock', 'rating', 'material', 'description', 'image'].forEach(function (k) {
          if (form[k]) form[k].value = product[k] == null ? '' : product[k];
        });
        form.isNewArrival.checked = !!product.isNewArrival;
        form.isTrending.checked = !!product.isTrending;
        form.isBestSeller.checked = !!product.isBestSeller;
        form.specs.value = JSON.stringify(product.specs || [], null, 0);
        preview.src = EL.img(product.image);
        preview.style.display = 'block';
      } else {
        form.category.value = 'accessories';
        form.rating.value = '4.8';
        form.stock.value = '10';
        preview.style.display = 'none';
      }
      modal.classList.add('open');
      form.name.focus();
    }
    function closeModal() {
      modal.classList.remove('open');
      editing = null;
    }

    document.getElementById('newProduct').addEventListener('click', function () {
      openModal(null);
    });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.closest('[data-close]')) closeModal();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      form.querySelectorAll('.err').forEach(function (el) {
        el.textContent = '';
      });
      var fd = new FormData();
      ['name', 'category', 'price', 'oldPrice', 'stock', 'rating', 'material', 'description', 'image'].forEach(function (k) {
        if (form[k] && form[k].value !== '') fd.append(k, form[k].value.trim ? form[k].value.trim() : form[k].value);
      });
      fd.append('isNewArrival', form.isNewArrival.checked);
      fd.append('isTrending', form.isTrending.checked);
      fd.append('isBestSeller', form.isBestSeller.checked);
      if (form.specs.value.trim()) fd.append('specs', form.specs.value.trim());
      var file = form.imageFile.files[0];
      if (file) fd.append('image', file);

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      var label = btn.textContent;
      btn.textContent = 'Saving…';
      try {
        if (editing) {
          await A.put('/api/admin/products/' + editing.id, fd);
          EL.toast('Product updated.', 'success');
        } else {
          await A.post('/api/admin/products', fd);
          EL.toast('Product created.', 'success');
        }
        closeModal();
        load();
      } catch (err) {
        if (err.errors) {
          Object.keys(err.errors).forEach(function (k) {
            var box = form.querySelector('.err[data-err="' + k + '"]');
            if (box) box.textContent = err.errors[k];
          });
        }
        var formErr = form.querySelector('.err[data-err="form"]');
        if (formErr) formErr.textContent = err.message;
        EL.toast(err.message, 'error');
      } finally {
        btn.disabled = false;
        btn.textContent = label;
      }
    });

    // Row interactions
    tbody.addEventListener('click', async function (e) {
      var row = e.target.closest('tr[data-id]');
      if (!row) return;
      var id = row.getAttribute('data-id');
      var product = all.filter(function (p) {
        return String(p.id) === String(id);
      })[0];
      if (e.target.closest('[data-edit]')) openModal(product);
      if (e.target.closest('[data-del]')) {
        if (!window.confirm('Delete “' + product.name + '”? This cannot be undone.')) return;
        try {
          await A.del('/api/admin/products/' + id);
          EL.toast('Product deleted.', 'success');
          load();
        } catch (err) {
          EL.toast(err.message, 'error');
        }
      }
    });

    tbody.addEventListener('change', async function (e) {
      var input = e.target.closest('[data-stock]');
      if (!input) return;
      var id = e.target.closest('tr[data-id]').getAttribute('data-id');
      try {
        await A.patch('/api/admin/products/' + id + '/stock', { stock: Number(input.value) });
        EL.toast('Stock updated.', 'success');
        var p = all.filter(function (x) {
          return String(x.id) === String(id);
        })[0];
        if (p) p.stock = Number(input.value);
      } catch (err) {
        EL.toast(err.message, 'error');
      }
    });

    search.addEventListener('input', draw);
    catFilter.addEventListener('change', draw);
    load();
  }

  /* =================================================================== */
  /* Page: media upload                                                  */
  /* =================================================================== */
  function pageUpload() {
    if (!guard()) return;
    renderRail('upload');

    var drop = document.getElementById('drop');
    var input = document.getElementById('fileInput');
    var grid = document.getElementById('uploadGrid');
    var icon = document.getElementById('dropIcon');
    if (icon) icon.innerHTML = NAV_ICONS.image;

    var uploaded = [];

    function draw() {
      if (!uploaded.length) {
        grid.innerHTML = '';
        return;
      }
      grid.innerHTML = uploaded
        .map(function (u) {
          return (
            '<div class="up-item"><img src="' + EL.api.base + u.path + '" alt="' + EL.escapeHtml(u.filename) + '">' +
            '<div class="meta"><code>' + EL.escapeHtml(u.path) + '</code></div></div>'
          );
        })
        .join('');
    }

    async function send(files) {
      var list = Array.prototype.slice.call(files).filter(function (f) {
        return /^image\//.test(f.type);
      });
      if (!list.length) {
        EL.toast('Only image files are accepted.', 'error');
        return;
      }
      for (var i = 0; i < list.length; i += 1) {
        var fd = new FormData();
        fd.append('image', list[i]);
        try {
          var out = await A.post('/api/admin/upload', fd);
          uploaded.unshift(out);
          draw();
          EL.toast(list[i].name + ' uploaded.', 'success');
        } catch (err) {
          EL.toast(list[i].name + ' — ' + err.message, 'error');
        }
      }
    }

    drop.addEventListener('click', function () {
      input.click();
    });
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') input.click();
    });
    input.addEventListener('change', function () {
      send(input.files);
      input.value = '';
    });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.add('over');
      });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) {
        e.preventDefault();
        drop.classList.remove('over');
      });
    });
    drop.addEventListener('drop', function (e) {
      if (e.dataTransfer && e.dataTransfer.files) send(e.dataTransfer.files);
    });
  }

  /* =================================================================== */
  /* Page: orders                                                        */
  /* =================================================================== */
  async function pageOrders() {
    if (!guard()) return;
    renderRail('orders');

    var tbody = document.getElementById('orderBody');
    var filter = document.getElementById('statusFilter');
    var countOut = document.getElementById('orderCount');
    var STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    var PAY = ['pending', 'paid', 'failed', 'cancelled'];

    function itemLines(o) {
      return (o.items || [])
        .map(function (i) {
          return EL.escapeHtml(i.name) + ' × ' + i.qty;
        })
        .join('<br>');
    }

    function draw(orders) {
      countOut.textContent = orders.length + (orders.length === 1 ? ' order' : ' orders');
      if (!orders.length) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty"><h3>No orders here</h3><p>Try a different status filter, or place a test order on the storefront.</p></div></td></tr>';
        return;
      }
      tbody.innerHTML = orders
        .map(function (o) {
          function sel(name, options, value) {
            return (
              '<select class="mini" data-' + name + ' aria-label="' + name + ' for ' + EL.escapeHtml(o.orderNumber) + '">' +
              options
                .map(function (s) {
                  return '<option value="' + s + '"' + (s === value ? ' selected' : '') + '>' + s + '</option>';
                })
                .join('') +
              '</select>'
            );
          }
          var addr = o.shippingAddress || {};
          return (
            '<tr data-id="' + o.id + '">' +
            '<td><b style="font-weight:500">' + EL.escapeHtml(o.orderNumber) + '</b><br><small class="muted">' + fmtDate(o.createdAt) + '</small></td>' +
            '<td><b style="font-weight:500">' + EL.escapeHtml((o.customer && o.customer.name) || 'Guest') + '</b><br>' +
            '<small class="muted">' + EL.escapeHtml((o.customer && o.customer.email) || '') + '<br>' +
            EL.escapeHtml(addr.line1 || '') + ', ' + EL.escapeHtml(addr.city || '') + '</small></td>' +
            '<td><small>' + itemLines(o) + '</small></td>' +
            '<td><small class="muted">' + EL.escapeHtml(o.paymentMethod) + '</small><br>' + (o.transactionId ? '<code style="font-size:.72rem">' + EL.escapeHtml(o.transactionId) + '</code><br>' : '<small class="muted">No transaction ID</small><br>') + sel('pay', PAY, o.paymentStatus) + '</td>' +
            '<td>' + sel('status', STATUSES, o.status) + '</td>' +
            '<td class="num"><b style="font-weight:500">' + EL.money(o.total) + '</b><br><small class="muted">ship ' + EL.money(o.shipping) + '</small></td>' +
            '</tr>'
          );
        })
        .join('');
    }

    async function load() {
      tbody.innerHTML = '<tr><td colspan="6">' + new Array(5).fill('<div class="skel skel-row"></div>').join('') + '</td></tr>';
      try {
        var out = await A.get('/api/admin/orders?status=' + encodeURIComponent(filter.value));
        draw(out.orders || []);
      } catch (err) {
        tbody.innerHTML = '<tr><td colspan="6"><div class="empty"><h3>Could not load orders</h3><p>' + EL.escapeHtml(err.message) + '</p></div></td></tr>';
      }
    }

    tbody.addEventListener('change', async function (e) {
      var row = e.target.closest('tr[data-id]');
      if (!row) return;
      var id = row.getAttribute('data-id');
      var patch = {};
      if (e.target.hasAttribute('data-status')) patch.status = e.target.value;
      if (e.target.hasAttribute('data-pay')) patch.paymentStatus = e.target.value;
      if (!Object.keys(patch).length) return;
      try {
        await A.patch('/api/admin/orders/' + id, patch);
        EL.toast('Order updated.', 'success');
      } catch (err) {
        EL.toast(err.message, 'error');
        load();
      }
    });

    filter.addEventListener('change', load);
    load();
  }

  /* =================================================================== */
  var ROUTES = {
    login: pageLogin,
    dashboard: pageDashboard,
    products: pageProducts,
    upload: pageUpload,
    orders: pageOrders,
  };

  document.addEventListener('DOMContentLoaded', function () {
    var page = document.body.getAttribute('data-page');
    var run = ROUTES[page];
    if (run) {
      try {
        run();
      } catch (err) {
        console.error(err);
        EL.toast('Something went wrong on this page.', 'error');
      }
    }
  });

  window.ELAdmin = { A: A, session: session, statusPill: statusPill };
})();
