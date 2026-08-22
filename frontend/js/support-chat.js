/*
 * ELEGANT — Predefined Customer Support Chat
 * Standalone file: no changes to main.js or style.css required.
 * Add this script to the frontend pages you want the chat on.
 */
(function () {
  'use strict';

  if (window.__ELEGANT_SUPPORT_CHAT__) return;
  window.__ELEGANT_SUPPORT_CHAT__ = true;

  var CSS = `
    #elegant-support-chat,
    #elegant-support-chat * { box-sizing: border-box; }

    #elegant-support-chat {
      --esc-maroon: #4a2c2a;
      --esc-maroon-2: #603a37;
      --esc-rose: #b76e79;
      --esc-bg: #fbf7f4;
      --esc-paper: #fff;
      --esc-line: #efe4dc;
      --esc-text: #2e2523;
      --esc-muted: #8d7e78;
      position: fixed;
      right: 22px;
      bottom: 94px;
      z-index: 99999;
      font-family: Poppins, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    #elegant-support-chat button {
      font: inherit;
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .esc-launcher {
      border: 0;
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 9px 12px 9px 14px;
      border-radius: 999px;
      background: rgba(255,255,255,.97);
      color: var(--esc-maroon);
      box-shadow: 0 12px 35px rgba(74,44,42,.18);
      border: 1px solid rgba(74,44,42,.08);
      transition: .22s ease;
    }

    .esc-launcher:hover { transform: translateY(-2px); }

    .esc-launcher-icon {
      width: 35px;
      height: 35px;
      border-radius: 50%;
      display: grid;
      place-items: center;
      background: var(--esc-maroon);
      color: #fff;
    }

    .esc-launcher-icon svg { width: 18px; height: 18px; }

    .esc-window {
      position: fixed;
      right: 22px;
      bottom: 22px;
      width: min(390px, calc(100vw - 28px));
      height: min(650px, calc(100vh - 44px));
      overflow: hidden;
      display: flex;
      flex-direction: column;
      background: var(--esc-paper);
      border-radius: 24px;
      border: 1px solid rgba(74,44,42,.08);
      box-shadow: 0 28px 80px rgba(55,35,32,.28);
      opacity: 0;
      visibility: hidden;
      transform: translateY(18px) scale(.97);
      transform-origin: bottom right;
      transition: opacity .24s ease, visibility .24s ease, transform .24s ease;
    }

    .esc-open .esc-window {
      opacity: 1;
      visibility: visible;
      transform: translateY(0) scale(1);
    }

    .esc-open .esc-launcher {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
    }

    .esc-header {
      min-height: 76px;
      padding: 14px 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #fff;
      background:
        radial-gradient(circle at 100% 0, rgba(183,110,121,.28), transparent 42%),
        var(--esc-maroon);
    }

    .esc-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .esc-logo {
      width: 43px;
      height: 43px;
      flex: 0 0 43px;
      display: grid;
      place-items: center;
      border-radius: 12px;
      color: #fff;
      background: linear-gradient(135deg,#b76e79,#8b4c55);
      font-family: Georgia, serif;
      font-size: 21px;
      font-weight: 700;
    }

    .esc-brand-name {
      font-size: 14px;
      font-weight: 600;
      letter-spacing: .03em;
    }

    .esc-status {
      margin-top: 2px;
      color: rgba(255,255,255,.7);
      font-size: 10px;
    }

    .esc-close {
      width: 35px;
      height: 35px;
      flex: 0 0 35px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      border: 1px solid rgba(255,255,255,.25);
      background: transparent;
      color: #fff;
    }

    .esc-close:hover { background: rgba(255,255,255,.1); }
    .esc-close svg { width: 17px; height: 17px; }

    .esc-body {
      flex: 1;
      min-height: 0;
      overflow-y: auto;
      padding: 17px 15px 18px;
      background:
        radial-gradient(circle at 50% 0, rgba(183,110,121,.08), transparent 40%),
        var(--esc-bg);
      scroll-behavior: smooth;
    }

    .esc-welcome {
      min-height: 100%;
      display: flex;
      flex-direction: column;
    }

    .esc-welcome-card {
      padding: 23px 19px;
      border-radius: 20px;
      color: #fff;
      background:
        radial-gradient(circle at 50% 80%, rgba(183,110,121,.2), transparent 46%),
        linear-gradient(145deg,#4a2c2a,#6b3935);
    }

    .esc-eyebrow {
      margin: 0 0 9px;
      color: #e8b4a0;
      font-size: 9px;
      font-weight: 600;
      letter-spacing: .16em;
    }

    .esc-welcome-card h3 {
      margin: 0;
      color: #fff;
      font-size: 23px;
      line-height: 1.22;
      font-weight: 700;
      letter-spacing: -.025em;
    }

    .esc-welcome-card p {
      margin: 12px 0 0;
      color: rgba(255,255,255,.78);
      font-size: 12px;
      line-height: 1.65;
    }

    .esc-start-wrap {
      margin-top: auto;
      padding-top: 20px;
    }

    .esc-start {
      width: 100%;
      min-height: 61px;
      padding: 11px 15px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      border: 0;
      border-radius: 16px;
      color: var(--esc-maroon);
      background: #fff;
      box-shadow: 0 10px 25px rgba(0,0,0,.08);
    }

    .esc-start:hover { transform: translateY(-1px); }

    .esc-start-title {
      display: block;
      font-size: 13px;
      font-weight: 600;
    }

    .esc-start-sub {
      display: block;
      margin-top: 2px;
      color: var(--esc-muted);
      font-size: 10px;
    }

    .esc-message {
      display: flex;
      margin-bottom: 12px;
    }

    .esc-message.bot { justify-content: flex-start; }
    .esc-message.user { justify-content: flex-end; }

    .esc-bubble {
      max-width: 84%;
      padding: 10px 12px;
      border-radius: 14px;
      font-size: 12px;
      line-height: 1.6;
      white-space: pre-line;
    }

    .esc-message.bot .esc-bubble {
      color: var(--esc-text);
      background: #fff;
      border: 1px solid var(--esc-line);
      border-bottom-left-radius: 5px;
      box-shadow: 0 4px 14px rgba(74,44,42,.06);
    }

    .esc-message.user .esc-bubble {
      color: #fff;
      background: var(--esc-maroon);
      border-bottom-right-radius: 5px;
    }

    .esc-options {
      display: grid;
      gap: 8px;
      margin: 2px 0 17px;
    }

    .esc-option {
      width: 100%;
      min-height: 45px;
      padding: 9px 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      text-align: left;
      border: 1px solid var(--esc-line);
      border-radius: 13px;
      color: var(--esc-maroon);
      background: #fff;
      font-size: 11.5px;
      font-weight: 500;
      transition: .18s ease;
    }

    .esc-option:hover {
      background: #f8eeeb;
      border-color: #d8b9b1;
      transform: translateY(-1px);
    }

    .esc-arrow {
      opacity: .5;
      font-size: 16px;
    }

    .esc-footer {
      flex: 0 0 auto;
      padding: 8px 12px 10px;
      text-align: center;
      background: #fff;
      border-top: 1px solid var(--esc-line);
    }

    .esc-footer small {
      color: var(--esc-muted);
      font-size: 9px;
    }

    @media (max-width: 600px) {
      #elegant-support-chat {
        right: 13px;
        bottom: 84px;
      }

      .esc-window {
        right: 7px;
        bottom: 7px;
        width: calc(100vw - 14px);
        height: min(690px, calc(100vh - 14px));
        border-radius: 22px;
      }

      .esc-header { min-height: 70px; }
      .esc-body { padding: 15px 12px 16px; }

      .esc-welcome-card { padding: 22px 18px; }
      .esc-welcome-card h3 { font-size: 21px; }
    }

    @media (prefers-reduced-motion: reduce) {
      #elegant-support-chat * { transition: none !important; }
    }
  `;

  function addStyles() {
    var style = document.createElement('style');
    style.id = 'elegant-support-chat-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  var FLOW = {
    main: {
      message: 'Hi! Welcome to ELEGANT. How can we help you today?',
      options: [
        ['order', '📦 Order Status'],
        ['shipping', '🚚 Shipping & Delivery'],
        ['payment', '💳 Payment Help'],
        ['returns', '↩️ Return & Refund'],
        ['products', '🛍️ Product Information'],
        ['account', '👤 Account Help'],
        ['contact', '📞 Contact Support']
      ]
    },

    order: {
      message: 'What would you like to know about your order?',
      options: [
        ['reply', 'Check my order status', 'You can check your latest order from Account → My Orders. Open an order to see its current status and details.'],
        ['reply', 'View order details', 'Go to Account → My Orders and select the order you want to view.'],
        ['reply', 'Cancel an order', 'If your order has not been processed yet, please contact support as soon as possible so the team can check whether cancellation is possible.'],
        ['main', '← Back to main menu']
      ]
    },

    shipping: {
      message: 'What do you need to know about delivery?',
      options: [
        ['reply', 'Delivery time', 'Delivery time depends on your location and the order. Your order status will show the latest delivery information.'],
        ['reply', 'Delivery charge', 'Any applicable delivery charge is shown during checkout before you confirm your order.'],
        ['reply', 'Delivery area', 'ELEGANT currently accepts orders for supported delivery locations shown during checkout.'],
        ['main', '← Back to main menu']
      ]
    },

    payment: {
      message: 'What do you need help with regarding payment?',
      options: [
        ['reply', 'Payment methods', 'Available payment methods are shown at checkout. Select the method you prefer before confirming your order.'],
        ['reply', 'Payment failed', 'Please check whether your payment was actually deducted before trying again. If money was deducted but the order was not confirmed, contact support with your order information.'],
        ['reply', 'Payment was deducted', 'If your payment was deducted but your order is not showing as confirmed, please contact support and provide your order/payment reference.'],
        ['main', '← Back to main menu']
      ]
    },

    returns: {
      message: 'How can we help with returns or refunds?',
      options: [
        ['reply', 'Return an item', 'Please contact support with your order number and the item you want to return. The team will guide you through the applicable return process.'],
        ['reply', 'Refund status', 'If you are waiting for a refund, contact support with your order number so the team can check its current status.'],
        ['reply', 'Return policy', 'Return eligibility can depend on the product and order. Please contact support with your order number for the applicable policy.'],
        ['main', '← Back to main menu']
      ]
    },

    products: {
      message: 'What would you like to know about our products?',
      options: [
        ['reply', 'Product availability', 'The current availability of a product is shown on its product page.'],
        ['reply', 'Product information', 'Open any product page to view its available information, price and options.'],
        ['reply', 'Help me choose', 'Choose the product category you are interested in and our support team can help with product-related questions.'],
        ['main', '← Back to main menu']
      ]
    },

    account: {
      message: 'What do you need help with regarding your account?',
      options: [
        ['reply', 'I cannot log in', 'Please check your email and password. If you forgot your password, use the Forgot Password option on the login page.'],
        ['reply', 'Change my password', 'Open your account settings and use the password-change option. Your current password may be required for verification.'],
        ['reply', 'Update my profile', 'Open your account/profile section to update the information available there.'],
        ['main', '← Back to main menu']
      ]
    },

    contact: {
      message: 'Choose how you would like to continue:',
      options: [
        ['reply', 'Talk to support', 'Please use the website contact/support option to send your question. Include your order number when your question is about an order.'],
        ['reply', 'Order-related help', 'Please include your order number and a short description of the problem so support can assist you faster.'],
        ['main', '← Back to main menu']
      ]
    }
  };

  function createChat() {
    if (document.getElementById('elegant-support-chat')) return;

    addStyles();

    var root = document.createElement('div');
    root.id = 'elegant-support-chat';

    root.innerHTML = `
      <button class="esc-launcher" type="button" aria-label="Open ELEGANT support chat">
        <span>Chat with us</span>
        <span class="esc-launcher-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
            <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5 8 8 0 0 1-3.4-.75L5 19.5l1.25-3.55A7.45 7.45 0 0 1 5 11.5a7.5 7.5 0 1 1 15 0Z"/>
            <path d="M9 11.5h.01M12 11.5h.01M15 11.5h.01"/>
          </svg>
        </span>
      </button>

      <section class="esc-window" aria-label="ELEGANT customer support">
        <header class="esc-header">
          <div class="esc-brand">
            <div class="esc-logo">E</div>
            <div>
              <div class="esc-brand-name">ELEGANT</div>
              <div class="esc-status">Customer support</div>
            </div>
          </div>

          <button class="esc-close" type="button" aria-label="Close chat">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M6 6l12 12M18 6L6 18"/>
            </svg>
          </button>
        </header>

        <div class="esc-body"></div>

        <footer class="esc-footer">
          <small>ELEGANT Customer Support</small>
        </footer>
      </section>
    `;

    document.body.appendChild(root);

    var launcher = root.querySelector('.esc-launcher');
    var close = root.querySelector('.esc-close');
    var body = root.querySelector('.esc-body');

    function scrollBottom() {
      setTimeout(function () {
        body.scrollTop = body.scrollHeight;
      }, 30);
    }

    function message(text, type) {
      var row = document.createElement('div');
      row.className = 'esc-message ' + type;

      var bubble = document.createElement('div');
      bubble.className = 'esc-bubble';
      bubble.textContent = text;

      row.appendChild(bubble);
      body.appendChild(row);
      scrollBottom();
    }

    function options(list) {
      var wrap = document.createElement('div');
      wrap.className = 'esc-options';

      list.forEach(function (item) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'esc-option';

        var label = document.createElement('span');
        label.textContent = item[1];

        var arrow = document.createElement('span');
        arrow.className = 'esc-arrow';
        arrow.textContent = '›';

        button.appendChild(label);
        button.appendChild(arrow);

        button.addEventListener('click', function () {
          handle(item);
        });

        wrap.appendChild(button);
      });

      body.appendChild(wrap);
      scrollBottom();
    }

    function showNode(id) {
      var node = FLOW[id] || FLOW.main;
      message(node.message, 'bot');
      options(node.options);
    }

    function welcome() {
      body.innerHTML = `
        <div class="esc-welcome">
          <div class="esc-welcome-card">
            <p class="esc-eyebrow">ELEGANT SUPPORT</p>
            <h3>Welcome to ELEGANT!<br>How can we help you today?</h3>
            <p>Choose a topic below and we'll show you the most relevant information.</p>
          </div>

          <div class="esc-start-wrap">
            <button class="esc-start" type="button">
              <span>
                <span class="esc-start-title">Start Conversation</span>
                <span class="esc-start-sub">Choose a topic to get help</span>
              </span>
              <span style="font-size:22px;color:#b76e79">›</span>
            </button>
          </div>
        </div>
      `;

      body.querySelector('.esc-start').addEventListener('click', function () {
        body.innerHTML = '';
        showNode('main');
      });
    }

    function handle(item) {
      var type = item[0];
      var id = item[0];
      var label = item[1];

      message(label, 'user');

      if (type === 'main') {
        setTimeout(function () {
          showNode('main');
        }, 220);
        return;
      }

      if (type === 'reply') {
        setTimeout(function () {
          message(item[2], 'bot');

          setTimeout(function () {
            options([
              ['main', '← Back to main menu']
            ]);
          }, 120);
        }, 260);
        return;
      }

      setTimeout(function () {
        showNode(id);
      }, 260);
    }

    launcher.addEventListener('click', function () {
      root.classList.add('esc-open');

      if (!root.dataset.started) {
        root.dataset.started = '1';
        welcome();
      }
    });

    close.addEventListener('click', function () {
      root.classList.remove('esc-open');
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        root.classList.remove('esc-open');
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChat);
  } else {
    createChat();
  }
})();
