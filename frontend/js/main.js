/* =====================================================================
   main.js — shared chrome (header, drawer, footer, floating cart, loader),
   the product-card component, and the per-page controllers.
   Page logic is selected from <body data-page="...">.
   ===================================================================== */
(function () {
  'use strict';
  var EL = window.EL;
  var Cart = window.ELCart;
  var Auth = window.ELAuth;
  var I = EL.ICONS;
  var U = EL.url;

  /* =================================================== 1. shared chrome */

  var LOGO_SVG =
    '<svg class="brand__badge" viewBox="0 0 34 34" width="34" height="34" role="img" aria-label="ELEGANT">' +
    '<defs><linearGradient id="elgGrad" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#E8B4A0"/><stop offset="1" stop-color="#B76E79"/></linearGradient></defs>' +
    '<rect width="34" height="34" rx="9" fill="url(#elgGrad)"/>' +
    '<path d="M11.5 10.5h11M11.5 17h8.5M11.5 23.5h11" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>' +
    '</svg>';

  var NAV = [
    { label: 'Home', href: 'index.html' },
    { label: 'Shop', href: 'shop.html' },
    { label: 'Categories', href: 'index.html#categories' },
    { label: 'Wishlist', href: 'wishlist.html' },
    { label: 'Contact', href: 'index.html#contact' },
  ];

  function currentPage() {
    return (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  }

  function renderHeader() {
    var host = document.querySelector('[data-chrome="header"]');
    if (!host) return;
    var page = currentPage();
    
    // Direct localStorage check to ensure reliable sign-in state resolution
    var signedIn = !!(localStorage.getItem('el_token') || localStorage.getItem('token') || (Auth && Auth.isLoggedIn && Auth.isLoggedIn()));
    
    var navHtml = NAV.map(function (n) {
      // Anchor links (shop.html#categories) never claim the active state —
      // only the canonical page link does.
      var active = n.href.indexOf('#') === -1 && n.href === page ? ' aria-current="page"' : '';
      return '<a href="' + U(n.href) + '"' + active + '>' + n.label + '</a>';
    }).join('');

    host.innerHTML =
      '<div class="header-pill">' +
      '<a class="brand" href="' +
      U('index.html') +
      '" aria-label="ELEGANT — home">' +
      LOGO_SVG +
      '<span class="brand__word">Elegant</span></a>' +
      '<nav class="nav" aria-label="Main">' +
      navHtml +
      '</nav>' +
      '<div class="header-actions">' +
      '<button class="icon-btn icon-btn--desk" id="searchToggle" aria-label="Search products">' +
      I.search +
      '</button>' +
      '<a class="icon-btn icon-btn--desk" href="' +
      U('wishlist.html') +
      '" aria-label="Wishlist">' +
      I.heart +
      '</a>' +
      '<a class="icon-btn" href="' +
      U('cart.html') +
      '" aria-label="Cart"><span data-cart-count class="count-bubble">0</span>' +
      I.bag +
      '</a>' +
      '<a class="icon-btn icon-btn--desk" href="' +
      U(signedIn ? 'account.html' : 'login.html') +
      '" aria-label="Account">' +
      I.user +
      '</a>' +
      (signedIn
        ? '<a class="btn btn--primary" href="' + U('account.html') + '">My Account</a>'
        : '<a class="btn btn--primary" href="' + U('login.html') + '">Sign In</a>') +
      '<button class="icon-btn hamburger" id="menuToggle" aria-label="Open menu" aria-expanded="false">' +
      I.menu +
      '</button>' +
      '</div></div>' +
      '<div class="search-pop" id="searchPop"><form role="search">' +
      '<input type="search" name="q" placeholder="Search for silk, cashmere, earbuds…" aria-label="Search products">' +
      '<button class="btn btn--primary" type="submit">Search</button>' +
      '</form></div>';

    // search
    var pop = document.getElementById('searchPop');
    var toggle = document.getElementById('searchToggle');
    if (toggle)
      toggle.addEventListener('click', function () {
        pop.classList.toggle('open');
        var input = pop.querySelector('input');
        if (pop.classList.contains('open') && input) input.focus();
      });
    pop.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = pop.querySelector('input').value.trim();
      window.location.href = U('shop.html') + (q ? '?q=' + encodeURIComponent(q) : '');
    });

    // drawer
    var drawer = document.createElement('aside');
    drawer.className = 'drawer';
    drawer.innerHTML =
      '<button class="icon-btn" id="drawerClose" aria-label="Close menu" style="align-self:flex-end">' +
      I.close +
      '</button>' +
      NAV.map(function (n) {
        return '<a href="' + U(n.href) + '">' + n.label + '</a>';
      }).join('') +
      '<a href="' +
      U(signedIn ? 'account.html' : 'login.html') +
      '">' +
      (signedIn ? 'My Account' : 'Sign In') +
      '</a>' +
      '<a href="' +
      U('cart.html') +
      '">Cart</a>' +
      '<form role="search" style="display:flex;gap:8px;margin-top:auto">' +
      '<input type="search" placeholder="Search…" aria-label="Search products">' +
      '<button class="btn btn--primary btn--sm" type="submit">Go</button></form>';
    var backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      var mt = document.getElementById('menuToggle');
      if (mt) mt.setAttribute('aria-expanded', 'false');
    }
    document.getElementById('menuToggle').addEventListener('click', function () {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      this.setAttribute('aria-expanded', 'true');
    });
    document.getElementById('drawerClose').addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer);
    drawer.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var q = this.querySelector('input').value.trim();
      window.location.href = U('shop.html') + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  }

  function renderFooter() {
    var host = document.querySelector('[data-chrome="footer"]');
    if (!host) return;
    host.innerHTML =
      '<div class="wrap"><div class="footer-grid">' +
      '<div class="footer-about"><div class="brand">' +
      LOGO_SVG +
      '<span class="brand__word">Elegant</span></div>' +
      '<p>Considered accessories, fashion and gadgets for people who dress with intention. Curated in Dhaka, shipped nationwide.</p>' +
      '<div class="socials">' +
      '<a href="#" aria-label="Instagram">' +
      I.instagram +
      '</a><a href="#" aria-label="Facebook">' +
      I.facebook +
      '</a><a href="#" aria-label="Pinterest">' +
      I.pinterest +
      '</a><a href="#" aria-label="TikTok">' +
      I.tiktok +
      '</a></div></div>' +
      '<div><h4>Shop</h4><ul>' +
      '<li><a href="' +
      U('shop.html?category=accessories') +
      '">Accessories</a></li>' +
      '<li><a href="' +
      U('shop.html?category=fashion') +
      '">Fashion</a></li>' +
      '<li><a href="' +
      U('shop.html?category=gadgets') +
      '">Gadgets</a></li>' +
      '<li><a href="' +
      U('shop.html?flag=new') +
      '">New Arrivals</a></li>' +
      '<li><a href="' +
      U('shop.html?flag=bestseller') +
      '">Best Sellers</a></li></ul></div>' +
      '<div id="contact"><h4>Contact</h4><ul>' +
      '<li>House 42, Road 11<br>Panchagarh, Panchagarh 5000</li>' +
      '<li><a href="tel:+8801601600289">+880 1601 600 289</a></li>' +
      '<li><a href="mailto:khayrulrahman85@gmail.com">khayrulrahman85@gmail.com</a></li>' +
      '<li>Sat–Thu · 10am – 8pm</li></ul></div>' +
      '<div class="footer-news"><h4>Newsletter</h4>' +
      '<p style="font-size:13px;opacity:.75;margin-bottom:12px">Ten percent off your first order, and first look at every drop.</p>' +
      '<form class="news-form" data-newsletter style="flex-direction:column">' +
      '<input type="email" name="email" placeholder="you@example.com" aria-label="Email address" required>' +
      '<button class="btn btn--rose" type="submit">Subscribe</button>' +
      '<span class="err" data-news-msg></span></form></div>' +
      '</div><div class="footer-bottom"><span>© ' +
      new Date().getFullYear() +
      ' ELEGANT. All rights reserved.</span>' +
      '<span>Payments by SSLCommerz · bKash · Cash on delivery</span></div></div>';
    wireNewsletter(host);
  }

  function renderFab() {
    if (document.querySelector('.cart-fab')) return;
    var a = document.createElement('a');
    a.className = 'cart-fab';
    a.href = U('cart.html');
    a.setAttribute('aria-label', 'View cart');
    a.innerHTML =
      I.bag +
      '<span class="cart-fab__count">0 ITEMS</span>' +
      '<span class="cart-fab__total">৳0</span>';
    document.body.appendChild(a);
    Cart.renderFab();
  }

  function wireNewsletter(scope) {
    scope.querySelectorAll('[data-newsletter]').forEach(function (form) {
      form.addEventListener('submit', async function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type=email]');
        var msg = form.querySelector('[data-news-msg]');
        var btn = form.querySelector('button');
        if (msg) msg.textContent = '';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim())) {
          if (msg) msg.textContent = 'Please enter a valid email address.';
          EL.toast('Please enter a valid email address.', 'err');
          return;
        }
        btn.disabled = true;
        try {
          var data = await EL.api.post('/api/newsletter', { email: input.value.trim() });
          EL.toast(data.message, 'ok');
          input.value = '';
        } catch (err) {
          if (msg) msg.textContent = err.message;
          EL.toast(err.message, 'err');
        } finally {
          btn.disabled = false;
        }
      });
    });
  }

  /* --------------------------------------------- loader + scroll reveal */
  function hideLoader() {
    var l = document.querySelector('.page-loader');
    if (l) setTimeout(function () {
      l.classList.add('done');
    }, 220);
  }
  function observeReveals(root) {
    var items = (root || document).querySelectorAll('.reveal:not(.in)');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (i) {
        i.classList.add('in');
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add('in');
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
    );
    items.forEach(function (i) {
      io.observe(i);
    });
    // Safety net: never leave content invisible if the observer never fires
    // (headless capture, restored scroll position, zero-height parents…).
    setTimeout(function () {
      items.forEach(function (i) {
        i.classList.add('in');
      });
    }, 2600);
  }

  /* ============================================ 2. product card + grids */

  function badgeFor(p) {
    if (p.stock === 0) return { label: 'Sold Out', cls: 'badge--beige' };
    if (p.isNewArrival) return { label: 'New', cls: '' };
    if (p.isTrending) return { label: 'Trending', cls: 'badge--beige' };
    if (p.isBestSeller) return { label: 'Best Selling', cls: 'badge--rose' };
    if (p.stock <= 5) return { label: 'Limited', cls: 'badge--beige' };
    if (p.rating >= 4.8) return { label: 'Top Rated', cls: 'badge--beige' };
    return null;
  }

  function productCard(p) {
    var badge = badgeFor(p);
    var wished = Cart.inWishlist(p.id);
    var priceHtml =
      (p.oldPrice && p.oldPrice > p.price ? '<s>' + EL.money(p.oldPrice) + '</s>' : '') + EL.money(p.price);
    return (
      '<article class="pcard reveal" data-id="' +
      p.id +
      '">' +
      '<a class="pcard__media" href="' +
      U('product.html?id=' + p.id) +
      '" aria-label="' +
      EL.escapeHtml(p.name) +
      '">' +
      '<img src="' +
      EL.img(p.image) +
      '" alt="' +
      EL.escapeHtml(p.name) +
      '" loading="lazy">' +
      (badge ? '<span class="badge ' + badge.cls + '">' + badge.label + '</span>' : '') +
      '</a>' +
      '<button class="wish-btn' +
      (wished ? ' active' : '') +
      '" data-wish="' +
      p.id +
      '" aria-label="Save ' +
      EL.escapeHtml(p.name) +
      ' to wishlist" aria-pressed="' +
      wished +
      '">' +
      I.heart +
      '</button>' +
      '<div class="pcard__body">' +
      '<span class="pcard__cat">' +
      EL.titleCase(p.category) +
      '</span>' +
      '<a class="pcard__name" href="' +
      U('product.html?id=' + p.id) +
      '" title="' +
      EL.escapeHtml(p.name) +
      '">' +
      EL.escapeHtml(p.name) +
      '</a>' +
      '<div class="pcard__row"><span class="price">' +
      priceHtml +
      '</span><span class="rating">★ <b>' +
      (p.rating || 0).toFixed(1) +
      '</b></span></div>' +
      '</div>' +
      '<div class="pcard__foot"><button class="btn btn--beige btn--block" data-add="' +
      p.id +
      '"' +
      (p.stock === 0 ? ' disabled' : '') +
      '>' +
      (p.stock === 0 ? 'Sold Out' : 'Add to Cart') +
      '</button></div>' +
      '</article>'
    );
  }

  var productIndex = {}; // id -> product, for add-to-cart without a refetch

  function renderGrid(host, products) {
    products.forEach(function (p) {
      productIndex[p.id] = p;
    });
    host.innerHTML = products.map(productCard).join('');
    observeReveals(host);
  }

  function skeletonGrid(host, n) {
    var one =
      '<div class="skel-card"><div class="skel skel-img"></div><div class="skel-lines">' +
      '<div class="skel skel-line" style="width:40%"></div>' +
      '<div class="skel skel-line" style="width:80%"></div>' +
      '<div class="skel skel-line" style="width:55%"></div>' +
      '<div class="skel skel-line" style="height:34px;margin-top:6px"></div>' +
      '</div></div>';
    host.innerHTML = new Array(n || 5).fill(one).join('');
  }

  /* Global delegation for add-to-cart + wishlist buttons. */
  document.addEventListener('click', async function (e) {
    var addBtn = e.target.closest('[data-add]');
    if (addBtn) {
      var id = addBtn.getAttribute('data-add');
      var p = productIndex[id];
      if (!p) {
        try {
          p = (await EL.api.get('/api/products/' + id)).product;
          productIndex[id] = p;
        } catch (err) {
          EL.toast(err.message, 'err');
          return;
        }
      }
      Cart.add(p, 1);
      return;
    }
    var wishBtn = e.target.closest('[data-wish]');
    if (wishBtn) {
      var wid = wishBtn.getAttribute('data-wish');
      var added = await Cart.toggleWish(wid);
      wishBtn.classList.toggle('active', added);
      wishBtn.setAttribute('aria-pressed', String(added));
    }
  });

  /* ================================================= 3. page: homepage */

  var CHIPS = [
    { label: 'Jewellery', icon: 'gem', href: 'shop.html?category=accessories' },
    { label: 'Bags', icon: 'bagIcon', href: 'shop.html?category=accessories' },
    { label: 'Scarves', icon: 'scarf', href: 'shop.html?category=accessories' },
    { label: 'Outerwear', icon: 'coat', href: 'shop.html?category=fashion' },
    { label: 'Dresses', icon: 'dress', href: 'shop.html?category=fashion' },
    { label: 'Knitwear', icon: 'knit', href: 'shop.html?category=fashion' },
    { label: 'Audio', icon: 'audio', href: 'shop.html?category=gadgets' },
    { label: 'Wearables', icon: 'watch', href: 'shop.html?category=gadgets' },
    { label: 'Home Tech', icon: 'home', href: 'shop.html?category=gadgets' },
  ];

  var TESTIMONIALS = [
    { name: 'Tasnim R.', text: 'The pearl earrings arrived in the most beautiful box. They have not left my ears since.' },
    { name: 'Sadia M.', text: 'Silk slip dress fits like it was made for me — and the delivery took two days.' },
    { name: 'Rafi A.', text: 'Bought the Aurora earbuds expecting style over substance. The noise cancelling genuinely works.' },
    { name: 'Nabila H.', text: 'Third order from ELEGANT. The packaging alone makes it feel like a gift to myself.' },
    { name: 'Mahia I.', text: 'Support helped me swap a strap size the same evening. Thoughtful and fast.' },
  ];

  function chipStrip() {
    return CHIPS.map(function (c) {
      return (
        '<a class="chip-card" href="' +
        U(c.href) +
        '"><span class="chip-card__disc">' +
        I[c.icon] +
        '</span><span>' +
        c.label +
        '</span></a>'
      );
    }).join('');
  }

  function testimonialCards() {
    return TESTIMONIALS.map(function (t) {
      var initials = t.name
        .split(' ')
        .map(function (w) {
          return w[0];
        })
        .join('')
        .slice(0, 2);
      return (
        '<article class="review-card reveal"><span class="verified">Verified Buyer</span>' +
        '<div class="stars" aria-label="5 out of 5">★★★★★</div>' +
        '<blockquote>“' +
        EL.escapeHtml(t.text) +
        '”</blockquote>' +
        '<div class="reviewer"><span class="avatar">' +
        initials +
        '</span><div><b>' +
        EL.escapeHtml(t.name) +
        '</b><small>Verified</small></div></div></article>'
      );
    }).join('');
  }

  async function pageHome() {
    document.getElementById('chipStrip').innerHTML = chipStrip();
    document.getElementById('reviewRow').innerHTML = testimonialCards();

    var sections = [
      { host: document.getElementById('bestSellers'), flag: 'bestseller' },
      { host: document.getElementById('newArrivals'), flag: 'new' },
      { host: document.getElementById('trending'), flag: 'trending' },
    ];
    sections.forEach(function (s) {
      skeletonGrid(s.host, 5);
    });

    try {
      var results = await Promise.all(
        sections.map(function (s) {
          return EL.api.get('/api/products?flag=' + s.flag + '&limit=5');
        })
      );
      sections.forEach(function (s, i) {
        renderGrid(s.host, results[i].products);
      });
    } catch (err) {
      sections.forEach(function (s) {
        s.host.innerHTML =
          '<div class="empty" style="grid-column:1/-1"><h3>Catalogue unavailable</h3><p>' +
          EL.escapeHtml(err.message) +
          '</p></div>';
      });
    }
    observeReveals();
  }

  /* ===================================================== 4. page: shop */

  async function pageShop() {
    var grid = document.getElementById('shopGrid');
    var countEl = document.getElementById('resultCount');
    var form = document.getElementById('filterForm');
    var sortSel = document.getElementById('sortSelect');
    var searchInput = document.getElementById('shopSearch');
    var maxOut = document.getElementById('maxOut');
    var range = form.querySelector('input[name=max]');

    // seed state from the URL
    var p = new URLSearchParams(window.location.search);
    if (p.get('category')) {
      var radio = form.querySelector('input[name=category][value="' + p.get('category') + '"]');
      if (radio) radio.checked = true;
    }
    if (p.get('q')) searchInput.value = p.get('q');
    if (p.get('sort')) sortSel.value = p.get('sort');
    var flag = p.get('flag') || '';
    if (flag) {
      document.getElementById('shopHeading').textContent =
        flag === 'new' ? 'New Arrivals' : flag === 'trending' ? 'Trending Now' : 'Best Sellers';
    }

    // category counts in the filter rail
    try {
      var summary = (await EL.api.get('/api/products/categories')).categories;
      var total = summary.reduce(function (s, c) {
        return s + c.count;
      }, 0);
      form.querySelectorAll('[data-count]').forEach(function (el) {
        var key = el.getAttribute('data-count');
        if (key === 'all') el.textContent = total;
        else {
          var found = summary.filter(function (c) {
            return c.category === key;
          })[0];
          el.textContent = found ? found.count : 0;
        }
      });
    } catch (err) {
      /* counts are decorative */
    }

    async function load() {
      skeletonGrid(grid, 6);
      var data = new FormData(form);
      var params = new URLSearchParams();
      var cat = data.get('category') || 'all';
      if (cat !== 'all') params.set('category', cat);
      if (data.get('max')) params.set('max', data.get('max'));
      if (searchInput.value.trim()) params.set('q', searchInput.value.trim());
      if (sortSel.value) params.set('sort', sortSel.value);
      if (flag) params.set('flag', flag);
      // keep the address bar shareable
      history.replaceState(null, '', params.toString() ? '?' + params.toString() : location.pathname);
      try {
        var res = await EL.api.get('/api/products?' + params.toString());
        if (!res.products.length) {
          grid.innerHTML =
            '<div class="empty" style="grid-column:1/-1"><div class="empty__disc">' +
            I.search +
            '</div><h3>Nothing matches those filters</h3>' +
            '<p>Try widening the price range, or clear the filters to see the full collection.</p>' +
            '<button class="btn btn--primary" id="clearFilters">Clear filters</button></div>';
          countEl.textContent = '0 pieces';
          var clear = document.getElementById('clearFilters');
          if (clear)
            clear.addEventListener('click', function () {
              form.reset();
              searchInput.value = '';
              range.value = range.max;
              maxOut.textContent = EL.money(range.max);
              load();
            });
          return;
        }
        renderGrid(grid, res.products);
        countEl.textContent = res.count + (res.count === 1 ? ' piece' : ' pieces');
      } catch (err) {
        grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><h3>Could not load products</h3><p>' + EL.escapeHtml(err.message) + '</p></div>';
      }
    }

    form.addEventListener('change', load);
    range.addEventListener('input', function () {
      maxOut.textContent = EL.money(range.value);
    });
    sortSel.addEventListener('change', load);
    document.getElementById('searchForm').addEventListener('submit', function (e) {
      e.preventDefault();
      load();
    });
    document.getElementById('filterToggle').addEventListener('click', function () {
      document.querySelector('.filters').classList.toggle('open');
    });
    maxOut.textContent = EL.money(range.value);
    load();
  }

  /* ================================================== 5. page: product */

  async function pageProduct() {
    var id = EL.qs('id');
    var host = document.getElementById('pdp');
    if (!id) {
      window.location.replace(U('shop.html'));
      return;
    }
    try {
      var data = await EL.api.get('/api/products/' + id);
    } catch (err) {
      host.innerHTML =
        '<div class="empty"><div class="empty__disc">' +
        I.bag +
        '</div><h3>Product not found</h3><p>' +
        EL.escapeHtml(err.message) +
        '</p><a class="btn btn--primary" href="' +
        U('shop.html') +
        '">Back to shop</a></div>';
      return;
    }
    var p = data.product;
    productIndex[p.id] = p;
    document.title = p.name + ' — ELEGANT';
    var gallery = (p.images && p.images.length ? p.images : [p.image]).filter(Boolean);
    var qty = 1;
    var wished = Cart.inWishlist(p.id);

    host.innerHTML =
      '<div><div class="gallery__main"><img id="galMain" src="' +
      EL.img(gallery[0]) +
      '" alt="' +
      EL.escapeHtml(p.name) +
      '"></div>' +
      (gallery.length > 1
        ? '<div class="gallery__thumbs">' +
          gallery
            .map(function (g, i) {
              return (
                '<button data-thumb="' +
                EL.escapeHtml(g) +
                '" class="' +
                (i === 0 ? 'active' : '') +
                '" aria-label="View image ' +
                (i + 1) +
                '"><img src="' +
                EL.img(g) +
                '" alt=""></button>'
              );
            })
            .join('') +
          '</div>'
        : '') +
      '</div>' +
      '<div><p class="eyebrow">' +
      EL.titleCase(p.category) +
      '</p><h1>' +
      EL.escapeHtml(p.name) +
      '</h1>' +
      '<div class="pdp__meta"><span class="rating">★ <b>' +
      (p.rating || 0).toFixed(1) +
      '</b> · ' +
      (p.reviewCount || 0) +
      ' reviews</span>' +
      '<span class="' +
      (p.stock === 0 ? 'stock-note stock-note--out' : 'stock-note') +
      '">' +
      (p.stock === 0 ? 'Out of stock' : p.stock + ' in stock') +
      '</span></div>' +
      '<div class="pdp__price"><span class="price">' +
      (p.oldPrice > p.price ? '<s>' + EL.money(p.oldPrice) + '</s>' : '') +
      EL.money(p.price) +
      '</span>' +
      (p.oldPrice > p.price
        ? '<span class="status-pill">Save ' + EL.money(p.oldPrice - p.price) + '</span>'
        : '') +
      '</div>' +
      '<p class="pdp__desc">' +
      EL.escapeHtml(p.description) +
      '</p>' +
      '<div class="pdp__actions">' +
      '<div class="qty"><button id="qtyDown" aria-label="Decrease quantity">−</button><span id="qtyVal">1</span>' +
      '<button id="qtyUp" aria-label="Increase quantity">+</button></div>' +
      '<button class="btn btn--primary" id="addBtn"' +
      (p.stock === 0 ? ' disabled' : '') +
      '>Add to Cart</button>' +
      '<button class="btn btn--rose" id="buyNow"' +
      (p.stock === 0 ? ' disabled' : '') +
      '>' + (Auth.isLoggedIn() ? 'Buy Now' : 'Sign in to Buy') + '</button>' +
      '<button class="btn btn--ghost" id="wishBtn" aria-pressed="' +
      wished +
      '">' +
      (wished ? 'Saved ♥' : 'Add to Wishlist') +
      '</button></div>' +
      '<div class="specs"><p class="eyebrow" style="margin-top:24px">Specifications</p>' +
      (p.specs || [])
        .map(function (s) {
          return '<div><span class="k">' + EL.escapeHtml(s.label) + '</span><span>' + EL.escapeHtml(s.value) + '</span></div>';
        })
        .join('') +
      (p.material ? '<div><span class="k">Material</span><span>' + EL.escapeHtml(p.material) + '</span></div>' : '') +
      '</div></div>';

    // gallery thumbs
    host.querySelectorAll('[data-thumb]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.getElementById('galMain').src = EL.img(btn.getAttribute('data-thumb'));
        host.querySelectorAll('[data-thumb]').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');
      });
    });
    function setQty(v) {
      qty = Math.max(1, Math.min(p.stock || 99, v));
      document.getElementById('qtyVal').textContent = qty;
    }
    document.getElementById('qtyUp').addEventListener('click', function () {
      setQty(qty + 1);
    });
    document.getElementById('qtyDown').addEventListener('click', function () {
      setQty(qty - 1);
    });
    document.getElementById('addBtn').addEventListener('click', function () {
      Cart.add(p, qty);
    });
    document.getElementById('buyNow').addEventListener('click', function () {
      if (!Auth.isLoggedIn()) {
        window.location.href = U('login.html?next=' + encodeURIComponent('checkout.html'));
        return;
      }
      Cart.add(p, qty);
      window.location.href = U('checkout.html');
    });
    document.getElementById('wishBtn').addEventListener('click', async function () {
      var added = await Cart.toggleWish(p.id);
      this.textContent = added ? 'Saved ♥' : 'Add to Wishlist';
      this.setAttribute('aria-pressed', String(added));
    });

    // reviews
    renderReviews(data.reviews);
    document.getElementById('reviewForm').addEventListener('submit', async function (e) {
      e.preventDefault();
      var form = e.target;
      var payload = {
        name: form.name.value.trim(),
        rating: Number(form.querySelector('[name=rating]').value),
        comment: form.comment.value.trim(),
      };
      var errs = form.querySelectorAll('.err');
      errs.forEach(function (el) {
        el.textContent = '';
      });
      try {
        var res = await EL.api.post('/api/reviews/' + p.id, payload);
        EL.toast('Thank you — your review is published.', 'ok');
        form.reset();
        setStars(0);
        var fresh = await EL.api.get('/api/reviews/' + p.id);
        renderReviews(fresh.reviews);
      } catch (err) {
        if (err.errors) {
          Object.keys(err.errors).forEach(function (k) {
            var el = form.querySelector('[data-err="' + k + '"]');
            if (el) el.textContent = err.errors[k];
          });
        }
        EL.toast(err.message, 'err');
      }
    });

    // star picker
    var picker = document.getElementById('starPicker');
    var ratingInput = document.querySelector('#reviewForm [name=rating]');
    function setStars(n) {
      ratingInput.value = n;
      picker.querySelectorAll('button').forEach(function (b, i) {
        b.classList.toggle('on', i < n);
      });
    }
    picker.innerHTML = '12345'
      .split('')
      .map(function (n) {
        return '<button type="button" data-star="' + n + '" aria-label="' + n + ' stars">★</button>';
      })
      .join('');
    picker.addEventListener('click', function (e) {
      var b = e.target.closest('[data-star]');
      if (b) setStars(Number(b.getAttribute('data-star')));
    });
    setStars(5);

    // related
    var rel = document.getElementById('related');
    if (data.related && data.related.length) renderGrid(rel, data.related);
    else document.getElementById('relatedSection').style.display = 'none';
    observeReveals();
  }

  function renderReviews(reviews) {
    var host = document.getElementById('reviewList');
    var countLabel = document.getElementById('reviewCount');
    if (countLabel) countLabel.textContent = reviews.length + (reviews.length === 1 ? ' review' : ' reviews');
    if (!reviews.length) {
      host.innerHTML =
        '<div class="empty"><h3>No reviews yet</h3><p>Be the first to tell everyone what you think.</p></div>';
      return;
    }
    host.innerHTML = reviews
      .map(function (r) {
        var initials = r.name.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2);
        return (
          '<article class="review-item"><header><span class="avatar">' +
          EL.escapeHtml(initials) +
          '</span><div><b style="font-weight:500">' +
          EL.escapeHtml(r.name) +
          '</b><div class="stars">' +
          EL.stars(r.rating) +
          '</div></div>' +
          '<span class="rating" style="margin-left:auto">' +
          new Date(r.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) +
          '</span></header><p class="muted">' +
          EL.escapeHtml(r.comment) +
          '</p></article>'
        );
      })
      .join('');
  }

  /* ===================================================== 6. page: cart */

  function cartTotals() {
    var sub = Cart.subtotal();
    var shipping = sub === 0 || sub >= 5000 ? 0 : 80;
    return { sub: sub, shipping: shipping, total: sub + shipping };
  }

  function pageCart() {
    var host = document.getElementById('cartItems');
    var summary = document.getElementById('cartSummary');

    function draw() {
      var cart = Cart.getCart();
      if (!cart.length) {
        host.innerHTML =
          '<div class="empty"><div class="empty__disc">' +
          I.bag +
          '</div><h3>Your bag is empty</h3><p>Pieces you add will appear here — nothing is ever lost between visits.</p>' +
          '<a class="btn btn--primary" href="' +
          U('shop.html') +
          '">Start shopping</a></div>';
        summary.style.display = 'none';
        var clearBtn = document.getElementById('clearCart');
        if (clearBtn) clearBtn.style.display = 'none';
        var layout = host.closest('.cart-layout');
        if (layout) layout.classList.add('cart-layout--empty');
        return;
      }
      summary.style.display = '';
      var clear = document.getElementById('clearCart');
      if (clear) clear.style.display = '';
      var lay = host.closest('.cart-layout');
      if (lay) lay.classList.remove('cart-layout--empty');
      host.innerHTML = cart
        .map(function (l) {
          return (
            '<div class="line-item" data-line="' +
            l.productId +
            '"><div class="line-item__media"><img src="' +
            EL.img(l.image) +
            '" alt="' +
            EL.escapeHtml(l.name) +
            '"></div>' +
            '<div><h3><a href="' +
            U('product.html?id=' + l.productId) +
            '">' +
            EL.escapeHtml(l.name) +
            '</a></h3>' +
            '<p class="muted" style="font-size:13px">' +
            EL.money(l.price) +
            ' each</p>' +
            '<div class="qty" style="margin-top:10px"><button data-dec="' +
            l.productId +
            '" aria-label="Decrease quantity">−</button><span>' +
            l.qty +
            '</span><button data-inc="' +
            l.productId +
            '" aria-label="Increase quantity">+</button></div></div>' +
            '<div class="line-item__end" style="text-align:right"><p class="price">' +
            EL.money(l.price * l.qty) +
            '</p>' +
            '<button class="remove" data-remove="' +
            l.productId +
            '">Remove</button></div></div>'
          );
        })
        .join('');

      var t = cartTotals();
      summary.querySelector('[data-sub]').textContent = EL.money(t.sub);
      summary.querySelector('[data-ship]').textContent = t.shipping ? EL.money(t.shipping) : 'Free';
      summary.querySelector('[data-total]').textContent = EL.money(t.total);
      var note = summary.querySelector('[data-ship-note]');
      note.textContent =
        t.shipping === 0
          ? 'Free nationwide delivery applied.'
          : 'Spend ' + EL.money(5000 - t.sub) + ' more for free delivery.';
    }

    host.addEventListener('click', function (e) {
      var inc = e.target.closest('[data-inc]');
      var dec = e.target.closest('[data-dec]');
      var rm = e.target.closest('[data-remove]');
      var cart = Cart.getCart();
      function qtyOf(id) {
        var l = cart.filter(function (x) {
          return x.productId === id;
        })[0];
        return l ? l.qty : 1;
      }
      if (inc) Cart.setQty(inc.getAttribute('data-inc'), qtyOf(inc.getAttribute('data-inc')) + 1);
      if (dec) Cart.setQty(dec.getAttribute('data-dec'), qtyOf(dec.getAttribute('data-dec')) - 1);
      if (rm) {
        Cart.remove(rm.getAttribute('data-remove'));
        EL.toast('Removed from your bag');
      }
      if (inc || dec || rm) draw();
    });
    document.getElementById('clearCart').addEventListener('click', function () {
      Cart.clear();
      draw();
    });
    draw();
  }

  /* ================================================= 7. page: checkout */

  async function pageCheckout() {
    if (!Auth.requireAuth()) return;
    var form = document.getElementById('checkoutForm');
    var summary = document.getElementById('checkoutSummary');
    var cart = Cart.getCart();

    if (!cart.length) {
      document.getElementById('checkoutBody').innerHTML =
        '<div class="empty"><div class="empty__disc">' +
        I.bag +
        '</div><h3>Nothing to check out</h3><p>Your bag is empty. Add a piece or two and come back.</p>' +
        '<a class="btn btn--primary" href="' +
        U('shop.html') +
        '">Browse the collection</a></div>';
      return;
    }

    // prefill from the signed-in profile
    var user = Auth.currentUser();
    if (user) {
      form.name.value = user.name || '';
      form.email.value = user.email || '';
      form.phone.value = user.phone || '';
      if (user.address) {
        form.line1.value = user.address.line1 || '';
        form.city.value = user.address.city || '';
        form.postcode.value = user.address.postcode || '';
      }
    }

    // order summary
    var t = cartTotals();
    summary.querySelector('[data-lines]').innerHTML = cart
      .map(function (l) {
        return (
          '<div class="summary-row"><span>' +
          EL.escapeHtml(l.name) +
          ' × ' +
          l.qty +
          '</span><span>' +
          EL.money(l.price * l.qty) +
          '</span></div>'
        );
      })
      .join('');
    summary.querySelector('[data-sub]').textContent = EL.money(t.sub);
    summary.querySelector('[data-ship]').textContent = t.shipping ? EL.money(t.shipping) : 'Free';
    summary.querySelector('[data-total]').textContent = EL.money(t.total);

    // payment mode notice
    try {
      var cfg = await EL.api.get('/api/payments/config');
      var num = document.getElementById('bkashNumber');
      if (num) num.textContent = cfg.bkashMerchantNumber || '01XXXXXXXXX';
    } catch (err) {
      /* keep the configured placeholder visible */
    }
    var amountNode = document.getElementById('bkashAmount');
    if (amountNode) amountNode.textContent = EL.money(t.total);
    var copyBtn = document.getElementById('copyBkash');
    if (copyBtn) copyBtn.addEventListener('click', function () {
      var text = document.getElementById('bkashNumber').textContent.trim();
      navigator.clipboard && navigator.clipboard.writeText(text).then(function () { EL.toast('bKash number copied.', 'ok'); });
    });
    var bkashBox = document.getElementById('bkashBox');
    function syncPaymentBox() {
      var method = form.querySelector('[name=paymentMethod]:checked').value;
      bkashBox.hidden = method !== 'bkash';
      form.transactionId.required = method === 'bkash';
    }
    form.querySelectorAll('[name=paymentMethod]').forEach(function (r) { r.addEventListener('change', syncPaymentBox); });
    syncPaymentBox();

    if (EL.qs('payment') === 'fail') EL.toast('That payment did not go through. Try another method.', 'err');
    if (EL.qs('payment') === 'cancel') EL.toast('Payment cancelled — your bag is still here.', 'err');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = document.getElementById('placeOrder');
      form.querySelectorAll('.err').forEach(function (el) {
        el.textContent = '';
      });

      // client-side validation
      var errs = {};
      if (form.name.value.trim().length < 2) errs.name = 'Please enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.value.trim())) errs.email = 'Enter a valid email.';
      if (form.phone.value.replace(/\D/g, '').length < 8) errs.phone = 'Enter a valid phone number.';
      if (form.line1.value.trim().length < 4) errs.line1 = 'Street address is required.';
      if (!form.city.value.trim()) errs.city = 'City is required.';
      if (Object.keys(errs).length) {
        Object.keys(errs).forEach(function (k) {
          var el = form.querySelector('[data-err="' + k + '"]');
          if (el) el.textContent = errs[k];
        });
        EL.toast('Please correct the highlighted fields.', 'err');
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Placing order…';
      try {
        var payload = {
          items: Cart.getCart().map(function (l) {
            return { productId: l.productId, qty: l.qty };
          }),
          customer: {
            name: form.name.value.trim(),
            email: form.email.value.trim(),
            phone: form.phone.value.trim(),
          },
          shippingAddress: {
            line1: form.line1.value.trim(),
            city: form.city.value.trim(),
            postcode: form.postcode.value.trim(),
            country: 'Bangladesh',
            notes: form.notes.value.trim(),
          },
          paymentMethod: form.querySelector('[name=paymentMethod]:checked').value,
        };
        if (payload.paymentMethod === 'bkash' && !form.transactionId.value.trim()) {
          throw Object.assign(new Error('Please enter the bKash transaction ID after sending the payment.'), { errors: { transactionId: 'Transaction ID is required.' } });
        }
        payload.transactionId = form.transactionId.value.trim();
        var order = (await EL.api.post('/api/orders', payload)).order;
        Cart.clear();
        window.location.href = U('confirmation.html?order=' + encodeURIComponent(order.orderNumber));
      } catch (err) {
        if (err.errors) {
          Object.keys(err.errors).forEach(function (k) {
            var el = form.querySelector('[data-err="' + k + '"]');
            if (el) el.textContent = err.errors[k];
          });
        }
        EL.toast(err.message, 'err');
        btn.disabled = false;
        btn.textContent = 'Place Order';
      }
    });
  }

  /* ============================================= 8. page: confirmation */

  async function pageConfirmation() {
    if (!Auth.requireAuth()) return;
    var host = document.getElementById('confirmBody');
    var num = EL.qs('order');
    if (!num) {
      host.innerHTML = '<div class="empty"><h3>No order reference</h3><p>Check the link in your confirmation email.</p></div>';
      return;
    }
    try {
      var order = (await EL.api.get('/api/orders/' + num)).order;
    } catch (err) {
      host.innerHTML =
        '<div class="empty"><h3>Order not found</h3><p>' +
        EL.escapeHtml(err.message) +
        '</p><a class="btn btn--primary" href="' +
        U('shop.html') +
        '">Back to shop</a></div>';
      return;
    }
    var paidPill =
      order.paymentStatus === 'paid'
        ? '<span class="status-pill status-pill--paid">Paid</span>'
        : order.paymentStatus === 'failed'
        ? '<span class="status-pill status-pill--failed">Payment failed</span>'
        : '<span class="status-pill">' + EL.titleCase(order.paymentStatus) + '</span>';

    host.innerHTML =
      '<div class="form-card confirm-card"><div class="confirm-tick">' +
      I.check +
      '</div><p class="eyebrow">Thank you</p><h1 class="serif" style="font-size:2rem">Your order is confirmed</h1>' +
      '<p class="muted" style="margin-top:12px">A confirmation has been sent to ' +
      EL.escapeHtml(order.customer.email) +
      '.</p>' +
      '<div class="order-no">' +
      order.orderNumber +
      '</div>' +
      '<div style="margin-top:20px">' +
      paidPill +
      ' <span class="status-pill">' +
      EL.titleCase(order.status) +
      '</span> <span class="status-pill">' +
      (order.paymentMethod === 'cod' ? 'Cash on delivery' : order.paymentMethod === 'bkash' ? 'bKash' : 'SSLCommerz') +
      '</span></div>' +
      '<div style="text-align:left;margin-top:32px">' +
      order.items
        .map(function (i) {
          return (
            '<div class="summary-row"><span>' +
            EL.escapeHtml(i.name) +
            ' × ' +
            i.qty +
            '</span><span>' +
            EL.money(i.price * i.qty) +
            '</span></div>'
          );
        })
        .join('') +
      '<div class="summary-row"><span>Shipping</span><span>' +
      (order.shipping ? EL.money(order.shipping) : 'Free') +
      '</span></div>' +
      '<div class="summary-row summary-row--total"><span>Total</span><span>' +
      EL.money(order.total) +
      '</span></div></div>' +
      '<div style="text-align:left;margin-top:24px" class="muted"><p class="eyebrow">Delivering to</p><p>' +
      EL.escapeHtml(order.customer.name) +
      '<br>' +
      EL.escapeHtml(order.shippingAddress.line1) +
      '<br>' +
      EL.escapeHtml(order.shippingAddress.city) +
      ' ' +
      EL.escapeHtml(order.shippingAddress.postcode || '') +
      '<br>' +
      EL.escapeHtml(order.shippingAddress.country) +
      '</p></div>' +
      '<div style="display:flex;gap:12px;justify-content:center;margin-top:32px;flex-wrap:wrap">' +
      '<a class="btn btn--primary" href="' +
      U('shop.html') +
      '">Continue shopping</a>' +
      '<a class="btn btn--ghost" href="' +
      U('account.html') +
      '">View my orders</a></div></div>';
  }

  /* ============================================= 9. page: mock gateway */

  function pageMock() {
    var num = EL.qs('order');
    var gateway = EL.qs('gateway') || 'sslcommerz';
    var amount = Number(EL.qs('amount') || 0);
    document.getElementById('mockOrder').textContent = num;
    document.getElementById('mockAmount').textContent = EL.money(amount);
    document.getElementById('mockGateway').textContent =
      gateway === 'bkash' ? 'bKash Sandbox' : 'SSLCommerz Sandbox';

    async function finish(result) {
      try {
        await EL.api.post('/api/payments/confirm', { orderNumber: num, result: result });
      } catch (err) {
        EL.toast(err.message, 'err');
      }
      if (result === 'success') window.location.href = U('confirmation.html?order=' + num);
      else window.location.href = U('checkout.html?payment=' + result + '&order=' + num);
    }
    document.getElementById('mockPay').addEventListener('click', function () {
      this.disabled = true;
      this.textContent = 'Authorising…';
      finish('success');
    });
    document.getElementById('mockFail').addEventListener('click', function () {
      finish('fail');
    });
    document.getElementById('mockCancel').addEventListener('click', function () {
      finish('cancel');
    });
  }

  /* ================================================= 10. page: wishlist */

  async function pageWishlist() {
    var grid = document.getElementById('wishGrid');
    skeletonGrid(grid, 4);
    var products = [];
    try {
      if (Auth.isLoggedIn()) {
        products = (await EL.api.get('/api/wishlist')).products;
      } else {
        var ids = Cart.wishIds();
        if (ids.length) {
          var all = (await EL.api.get('/api/products')).products;
          products = all.filter(function (p) {
            return ids.indexOf(p.id) !== -1;
          });
        }
      }
    } catch (err) {
      EL.toast(err.message, 'err');
    }
    if (!products.length) {
      grid.innerHTML =
        '<div class="empty" style="grid-column:1/-1"><div class="empty__disc">' +
        I.heart +
        '</div><h3>Your wishlist is empty</h3>' +
        '<p>Tap the heart on any piece to keep it here.' +
        (Auth.isLoggedIn() ? '' : ' Sign in and it will follow you across devices.') +
        '</p><a class="btn btn--primary" href="' +
        U('shop.html') +
        '">Find something you love</a></div>';
      return;
    }
    renderGrid(grid, products);
    document.addEventListener('wishlist:change', function () {
      pageWishlist();
    }, { once: true });
  }

  /* ==================================================== 11. page: auth */

  function pageLogin() {
    var form = document.getElementById('loginForm');
    var toggle = document.getElementById('toggleLoginPassword');
    if (toggle) toggle.addEventListener('click', function(){ var input=document.getElementById('loginPassword'); input.type=input.type==='password'?'text':'password'; toggle.textContent=input.type==='password'?'Show':'Hide'; });
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      form.querySelectorAll('.err').forEach(function (el) {
        el.textContent = '';
      });
      var email = form.email.value.trim();
      var pass = form.password.value;
      var ok = true;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        form.querySelector('[data-err=email]').textContent = 'Enter a valid email address.';
        ok = false;
      }
      if (pass.length < 6) {
        form.querySelector('[data-err=password]').textContent = 'Password must be at least 6 characters.';
        ok = false;
      }
      if (!ok) return;
      var btn = form.querySelector('button[type=submit]');
      btn.disabled = true;
      btn.textContent = 'Signing in…';
      try {
        var user = await Auth.login(email, pass);
        EL.toast('Welcome back, ' + user.name.split(' ')[0] + '.', 'ok');
        var next = EL.qs('next');
        window.location.href = U(next || 'account.html');
      } catch (err) {
        EL.toast(err.message, 'err');
        form.querySelector('[data-err=password]').textContent = err.message;
        btn.disabled = false;
        btn.textContent = 'Sign In';
      }
    });
    var demo = document.getElementById('useDemo');
    if (demo)
      demo.addEventListener('click', function () {
        form.email.value = 'user@elegant.com';
        form.password.value = 'password123';
      });
  }

  function pageSignup() {
    var form = document.getElementById('signupForm');
    if (!form) return;
    var verifiedStep = false;
    var otpBox = document.getElementById('otpBox');
    var submit = document.getElementById('signupSubmit');

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      form.querySelectorAll('.err').forEach(function (el) { el.textContent = ''; });
      var name = form.name.value.trim();
      var email = form.email.value.trim().toLowerCase();
      var pass = form.password.value;
      var confirm = form.confirm.value;
      var errs = {};
      if (name.length < 2) errs.name = 'Please enter your full name.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
      if (pass.length < 6) errs.password = 'Use at least 6 characters.';
      if (pass !== confirm) errs.confirm = 'Passwords do not match.';
      if (verifiedStep && !/^\d{6}$/.test(form.otp.value.trim())) errs.otp = 'Enter the 6-digit code from your email.';
      if (Object.keys(errs).length) {
        Object.keys(errs).forEach(function (k) { var el = form.querySelector('[data-err="' + k + '"]'); if (el) el.textContent = errs[k]; });
        return;
      }
      submit.disabled = true;
      try {
        if (!verifiedStep) {
          await EL.api.post('/api/users/send-otp', { email: email });
          verifiedStep = true;
          otpBox.hidden = false;
          submit.textContent = 'Verify & Create Account';
          form.otp.focus();
          EL.toast('Verification code sent to your email.', 'ok');
        } else {
          var data = await EL.api.post('/api/users/verify-otp', { name: name, email: email, password: pass, code: form.otp.value.trim() });
          Auth.setSession(data.token, data.user);
          await window.ELCart.syncWishlistAfterLogin();
          EL.toast('Account created successfully.', 'ok');
          var next = EL.qs('next');
          window.location.href = U(next || 'account.html');
        }
      } catch (err) {
        EL.toast(err.message, 'err');
        if (err.errors) Object.keys(err.errors).forEach(function (k) { var el = form.querySelector('[data-err="' + k + '"]'); if (el) el.textContent = err.errors[k]; });
      } finally {
        submit.disabled = false;
      }
    });
  }


  function pageResetPassword() {
    var form = document.getElementById('resetForm'); if (!form) return;
    document.getElementById('sendReset').addEventListener('click', async function(){
      var email=form.email.value.trim().toLowerCase(); if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return EL.toast('Enter a valid email address.','err');
      var b=this; b.disabled=true; try { await EL.api.post('/api/users/send-reset-otp',{email:email}); EL.toast('If an account exists, a code has been sent.','ok'); } catch(e){EL.toast(e.message,'err');} finally{b.disabled=false;}
    });
    form.addEventListener('submit', async function(e){e.preventDefault(); if(form.newPassword.value.length<8 || form.newPassword.value!==form.confirm.value) return EL.toast('Passwords must match and be at least 8 characters.','err'); try{await EL.api.post('/api/users/reset-password',{email:form.email.value.trim().toLowerCase(),code:form.code.value.trim(),newPassword:form.newPassword.value}); EL.toast('Password reset successfully.','ok'); setTimeout(function(){location.href=U('login.html');},700);}catch(err){EL.toast(err.message,'err');}});
  }

  /* ================================================= 12. page: account */

  async function pageAccount() {
    if (!Auth.requireAuth()) return;
    var user = (await Auth.refresh()) || Auth.currentUser();
    if (!user) return;
    document.getElementById('acctName').textContent = user.name;
    document.getElementById('acctEmail').textContent = user.email;

    var profileForm = document.getElementById('profileForm');
    profileForm.name.value = user.name || '';
    profileForm.phone.value = user.phone || '';
    profileForm.line1.value = (user.address && user.address.line1) || '';
    profileForm.city.value = (user.address && user.address.city) || '';
    profileForm.postcode.value = (user.address && user.address.postcode) || '';

    profileForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      try {
        await EL.api.put('/api/users/me', {
          name: profileForm.name.value.trim(),
          phone: profileForm.phone.value.trim(),
          address: {
            line1: profileForm.line1.value.trim(),
            city: profileForm.city.value.trim(),
            postcode: profileForm.postcode.value.trim(),
            country: 'Bangladesh',
          },
        });
        await Auth.refresh();
        EL.toast('Profile updated.', 'ok');
        document.getElementById('acctName').textContent = profileForm.name.value.trim();
      } catch (err) {
        EL.toast(err.message, 'err');
      }
    });

    document.getElementById('logoutBtn').addEventListener('click', function () {
      Auth.logout();
    });

    // tabs
    var tabs = document.querySelectorAll('.acct-nav button[data-tab]');
    tabs.forEach(function (b) {
      b.addEventListener('click', function () {
        tabs.forEach(function (x) {
          x.classList.remove('active');
        });
        b.classList.add('active');
        document.querySelectorAll('[data-panel]').forEach(function (p) {
          p.hidden = p.getAttribute('data-panel') !== b.getAttribute('data-tab');
        });
      });
    });

    // orders
    var host = document.getElementById('orderList');
    try {
      var orders = (await EL.api.get('/api/orders/mine')).orders;
      if (!orders.length) {
        host.innerHTML =
          '<div class="empty"><h3>No orders yet</h3><p>Once you place an order it will appear here with live status.</p>' +
          '<a class="btn btn--primary" href="' +
          U('shop.html') +
          '">Start shopping</a></div>';
      } else {
        host.innerHTML = orders
          .map(function (o) {
            return (
              '<article class="order-card"><header><div><b style="font-weight:500">' +
              o.orderNumber +
              '</b><br><small class="muted">' +
              new Date(o.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
              '</small></div>' +
              '<div><span class="status-pill' +
              (o.paymentStatus === 'paid' ? ' status-pill--paid' : '') +
              '">' +
              EL.titleCase(o.paymentStatus) +
              '</span> <span class="status-pill">' +
              EL.titleCase(o.status) +
              '</span></div></header><ul>' +
              o.items
                .map(function (i) {
                  return '<li><span>' + EL.escapeHtml(i.name) + ' × ' + i.qty + '</span><span>' + EL.money(i.price * i.qty) + '</span></li>';
                })
                .join('') +
              '<li style="border-top:1px solid var(--line);margin-top:8px;padding-top:8px;color:var(--ink)"><b style="font-weight:500">Total</b><b style="font-weight:500">' +
              EL.money(o.total) +
              '</b></li></ul>' +
              '<a class="view-all" style="margin-top:12px;display:inline-flex" href="' +
              U('confirmation.html?order=' + o.orderNumber) +
              '">Order details ' +
              I.arrow +
              '</a></article>'
            );
          })
          .join('');
      }
    } catch (err) {
      host.innerHTML = '<div class="empty"><h3>Could not load orders</h3><p>' + EL.escapeHtml(err.message) + '</p></div>';
    }

    var passwordForm = document.getElementById('passwordForm');
    if (passwordForm) passwordForm.addEventListener('submit', async function(e){
      e.preventDefault();
      if(passwordForm.newPassword.value.length<8 || passwordForm.newPassword.value!==passwordForm.confirmPassword.value) return EL.toast('New passwords must match and be at least 8 characters.','err');
      try { await EL.api.put('/api/users/me/password',{currentPassword:passwordForm.currentPassword.value,newPassword:passwordForm.newPassword.value}); passwordForm.reset(); EL.toast('Password changed successfully.','ok'); }
      catch(err){ EL.toast(err.message,'err'); }
    });
    var deleteForm=document.getElementById('deleteAccountForm');
    if(deleteForm) deleteForm.addEventListener('submit', async function(e){
      e.preventDefault();
      if(!confirm('Delete your ELEGANT account permanently? This cannot be undone.')) return;
      try { await EL.api.del('/api/users/me'); Auth.logout(false); window.location.href=U('index.html'); EL.toast('Account deleted.','ok'); }
      catch(err){ EL.toast(err.message,'err'); }
    });

    // wishlist panel
    var wishHost = document.getElementById('acctWish');
    try {
      var products = (await EL.api.get('/api/wishlist')).products;
      if (!products.length)
        wishHost.innerHTML =
          '<div class="empty" style="grid-column:1/-1"><h3>Nothing saved yet</h3><p>Tap the heart on any product to save it.</p></div>';
      else renderGrid(wishHost, products);
    } catch (err) {
      /* ignore */
    }
  }

  /* ==================================================== 13. bootstrap */

  document.addEventListener('DOMContentLoaded', function () {
    renderHeader();
    renderFooter();
    renderFab();
    Cart.renderFab();
    observeReveals();
    document.addEventListener('cart:change', Cart.renderFab);

    var page = (document.body.getAttribute('data-page') || '').toLowerCase();
    var routes = {
      home: pageHome,
      shop: pageShop,
      product: pageProduct,
      cart: pageCart,
      checkout: pageCheckout,
      confirmation: pageConfirmation,
      wishlist: pageWishlist,
      login: pageLogin,
      signup: pageSignup,
      reset: pageResetPassword,
      account: pageAccount,
      mock: pageMock,
    };
    var run = routes[page];
    if (run) {
      Promise.resolve()
        .then(run)
        .catch(function (err) {
          console.error(err);
          EL.toast(err.message || 'Something went wrong.', 'err');
        })
        .finally(hideLoader);
    } else {
      hideLoader();
    }
    // safety: never leave the loader up
    setTimeout(hideLoader, 2500);
  });
})();