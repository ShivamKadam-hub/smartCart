const RESPONSES = [
  {
    triggers: ['skillet', 'cast iron', 'pan', 'frying'],
    state: 'responding',
    text: 'Great choice! Here are top picks that pair perfectly with your Cast Iron Skillet:',
    products: [
      { name: 'Cast Iron Lid 12"',      price: '$24.99', tag: 'Perfect fit' },
      { name: 'Silicone Spatula Set',   price: '$19.99', tag: 'Heat resistant' },
      { name: 'Cleaning Brush',         price: '$12.99', tag: 'Must have' },
      { name: 'Wooden Spoon Set',       price: '$15.99', tag: 'Bestseller' },
    ],
  },
  {
    triggers: ['bundle', 'set', 'deal', 'discount', 'save'],
    state: 'responding',
    text: "You're 2 items away from completing the Cookware Starter Bundle!",
    bundle: {
      title: 'Cookware Starter Bundle',
      desc:  'Add the Cast Iron Lid and Silicone Spatula Set to complete this bundle.',
      discount: 'Save 10% — $27.00 off when complete',
    },
  },
  {
    triggers: ['baking', 'bake', 'oven', 'bread', 'cake'],
    state: 'responding',
    text: 'Perfect for baking enthusiasts! Here are my top recommendations:',
    products: [
      { name: 'Non-Stick Baking Sheet', price: '$39.99', tag: 'Top rated' },
      { name: 'Silicone Baking Mat',    price: '$22.99', tag: 'Reusable' },
      { name: 'Ceramic Mixing Bowls',   price: '$44.99', tag: 'Set of 3' },
      { name: 'Stand Mixer Attachments',price: '$59.99', tag: 'Upgrade' },
    ],
  },
  {
    triggers: ['knife', 'cut', 'chop', 'chef'],
    state: 'responding',
    text: "Here's what every home chef needs for the perfect knife setup:",
    products: [
      { name: "Chef's Knife 8\"",       price: '$129.99', tag: 'Pro grade' },
      { name: 'Honing Steel',           price: '$34.99',  tag: 'Essential' },
      { name: 'Bamboo Cutting Board',   price: '$29.99',  tag: 'Large size' },
    ],
  },
  {
    triggers: ['sale', 'offer', 'cheap', 'affordable', 'price'],
    state: 'responding',
    text: "Here are today's best deals in your saved categories:",
    products: [
      { name: 'Non-Stick Frying Pan',   price: '$49.99', tag: '20% off' },
      { name: 'Spice Rack Organizer',   price: '$49.99', tag: 'New arrival' },
      { name: 'Glass Storage Set',      price: '$54.99', tag: 'Bundle deal' },
    ],
  },
  {
    triggers: ['recommend', 'suggest', 'what', 'show me', 'find'],
    state: 'responding',
    text: 'Based on your cart, here are my top picks for you:',
    products: [
      { name: 'Dutch Oven 5.5 Qt',      price: '$149.99', tag: 'Cart match' },
      { name: 'Saucepan 2 Qt',          price: '$69.99',  tag: 'Popular' },
      { name: 'Cast Iron Lid',          price: '$24.99',  tag: 'Complementary' },
    ],
  },
  {
    triggers: ['hello', 'hi', 'hey', 'start', 'help'],
    state: 'responding',
    text: "Hey! I'm your SmartCart assistant. I can help you find products, discover bundles, and get the best deals. Try asking about cookware, baking, or bundle deals!",
  },
  {
    triggers: ['error', 'fail', 'wrong', 'broken', 'bug'],
    state: 'error',
    text: "Oops! Something went wrong on my end. Please try again in a moment — I'm looking into it.",
  },
];

const FALLBACKS = [
  "Let me check that for you... Based on what's in your cart, I'd suggest exploring our Cookware Starter Bundle!",
  "Interesting! I found some products that match your interest. Would you like to see bundle deals too?",
  "Great question! Check out our top-rated Cookware and Bakeware collections — they have some amazing deals right now.",
];

export class Chat {
  constructor(avatar) {
    this.avatar     = avatar;
    this.cartItems  = new Set(['Cast Iron Skillet']);
    this.typingEl   = null;
    this.msgCount   = 0;
    this._bindEvents();
  }

  _bindEvents() {
    const input = document.getElementById('chat-input');
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') this._handleSend();
    });
    document.getElementById('send-btn').addEventListener('click', () => this._handleSend());

    document.querySelectorAll('.cart-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const item = chip.dataset.item;
        if (chip.classList.contains('active-chip')) this.cartItems.add(item);
        else this.cartItems.delete(item);
      });
    });
  }

  _handleSend() {
    const input = document.getElementById('chat-input');
    const text  = input.value.trim();
    if (!text) return;
    input.value = '';
    this.send(text);
  }

  send(text) {
    this._appendMsg(text, 'user');
    this.avatar.setState('thinking');

    const thinkTime   = 700  + Math.random() * 500;
    const respondTime = 1000 + Math.random() * 600;

    setTimeout(() => this._showTyping(), thinkTime * 0.3);

    setTimeout(() => {
      this._removeTyping();
      const match   = this._findResponse(text);
      const newState = match ? match.state : 'responding';
      this.avatar.setState(newState);
      this._renderBotResponse(match, text);
      setTimeout(() => this.avatar.setState('idle'), 2500);
    }, thinkTime + respondTime);
  }

  _findResponse(text) {
    const lower = text.toLowerCase();
    for (const r of RESPONSES) {
      if (r.triggers.some(t => lower.includes(t))) return r;
    }
    return null;
  }

  _renderBotResponse(match, originalText) {
    if (!match) {
      const fb = FALLBACKS[this.msgCount % FALLBACKS.length];
      this.msgCount++;
      this._appendMsg(fb, 'bot');
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'msg bot-msg';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = match.text;
    wrap.appendChild(bubble);

    if (match.products) {
      const grid = document.createElement('div');
      grid.className = 'product-grid';
      for (const p of match.products) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `<div class="p-name">${p.name}</div><div class="p-price">${p.price}</div><div class="p-tag">${p.tag}</div>`;
        grid.appendChild(card);
      }
      wrap.appendChild(grid);
    }

    if (match.bundle) {
      const bc = document.createElement('div');
      bc.className = 'bundle-card';
      bc.innerHTML = `
        <div class="b-title">${match.bundle.title}</div>
        <div class="b-desc">${match.bundle.desc}</div>
        <div class="b-discount">${match.bundle.discount}</div>
      `;
      wrap.appendChild(bc);
    }

    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = 'Just now';
    wrap.appendChild(time);

    const msgs = document.getElementById('messages');
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  _appendMsg(text, from) {
    const div  = document.createElement('div');
    div.className = `msg ${from === 'user' ? 'user-msg' : 'bot-msg'}`;
    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;
    div.appendChild(bubble);
    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = 'Just now';
    div.appendChild(time);
    const msgs = document.getElementById('messages');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  _showTyping() {
    if (this.typingEl) return;
    const wrap = document.createElement('div');
    wrap.className = 'msg bot-msg';
    wrap.innerHTML = `<div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    </div>`;
    this.typingEl = wrap;
    const msgs = document.getElementById('messages');
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  _removeTyping() {
    if (this.typingEl) { this.typingEl.remove(); this.typingEl = null; }
  }
}
