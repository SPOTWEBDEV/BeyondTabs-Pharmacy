// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const mobileMenu = document.getElementById('mobile-menu');
if (navToggle && mobileMenu) {
  navToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });
}

// Footer year
const yearEls = document.querySelectorAll('#year');
yearEls.forEach((el) => (el.textContent = new Date().getFullYear()));

// Newsletter form — POSTs to the PHP backend (server/newsletter/subscribe.php).
const newsletterForm = document.getElementById('newsletter-form');
const newsletterMessage = document.getElementById('newsletter-message');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = newsletterForm.querySelector('input[type="email"]').value.trim();
    if (!email) return;

    try {
      const res = await fetch('server/newsletter/subscribe.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Subscription failed.');

      newsletterForm.reset();
      if (newsletterMessage) {
        newsletterMessage.textContent = "Thanks for subscribing! We'll be in touch. 💌";
        newsletterMessage.classList.remove('hidden', 'text-red-200');
        newsletterMessage.classList.add('text-brand-pink');
      }
    } catch (err) {
      if (newsletterMessage) {
        newsletterMessage.textContent = "We couldn't complete your subscription — please try again in a moment.";
        newsletterMessage.classList.remove('hidden', 'text-brand-pink');
        newsletterMessage.classList.add('text-red-200');
      }
    }
  });
}

// Contact form — POSTs to the PHP backend (server/contact/submit.php).
const contactForm = document.getElementById('contact-form');
const contactMessage = document.getElementById('contact-message');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: contactForm.querySelector('#name')?.value.trim() || '',
      phone: contactForm.querySelector('#phone')?.value.trim() || '',
      email: contactForm.querySelector('#email')?.value.trim() || '',
      message: contactForm.querySelector('#message')?.value.trim() || '',
    };

    try {
      const res = await fetch('server/contact/submit.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Message could not be sent.');

      contactForm.reset();
      if (contactMessage) {
        contactMessage.textContent = "Thanks! Your message has been sent — we'll reach out shortly.";
        contactMessage.classList.remove('hidden', 'text-red-600');
        contactMessage.classList.add('text-brand-magenta');
      }
    } catch (err) {
      if (contactMessage) {
        contactMessage.textContent = "We couldn't send your message — please try again, or reach us on WhatsApp instead.";
        contactMessage.classList.remove('hidden', 'text-brand-magenta');
        contactMessage.classList.add('text-red-600');
      }
    }
  });
}

// Simple scroll-reveal for elements marked [data-animate]
const animatedEls = document.querySelectorAll('[data-animate]');
if ('IntersectionObserver' in window && animatedEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  animatedEls.forEach((el) => observer.observe(el));
}

/* =========================================================
   AI CHAT WIDGET — "Ask BeyondTabs"
   Rule-based assistant trained on BeyondTabs Pharmacy's own
   brand content (mission, hours, location, policies, CellGevity).
   Chat history is stored in the browser's localStorage so it
   persists between visits and across pages on the SAME hosted
   domain. (Note: if you open these files locally via file://,
   some browsers isolate localStorage per file rather than per
   site — this works seamlessly once the site is hosted online.)
   ========================================================= */
(function () {
  const STORAGE_KEY = 'beyondtabs_chat_v1';
  const WHATSAPP_LINK = 'https://wa.me/2349031218118?text=Hello%20BeyondTabs%20Pharmacy%2C%20I%27d%20like%20to%20ask%20about...';

  const chatToggle = document.getElementById('chat-toggle');
  const chatPanel = document.getElementById('chat-panel');
  const chatClose = document.getElementById('chat-close');
  const chatMessages = document.getElementById('chat-messages');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-input');
  const chatClear = document.getElementById('chat-clear');

  if (!chatToggle || !chatPanel) return; // widget not present on this page

  const WELCOME_MESSAGE =
    "Hi, I'm the BeyondTabs assistant 👋 Ask me about our hours, location, delivery, or products. For anything about your health or a specific medication, I'll connect you straight to our licensed pharmacists on WhatsApp.";

  // Topics the bot should never try to answer itself
  const SAFETY_KEYWORDS = [
    'dosage', 'dose', 'mg', 'overdose', 'side effect', 'side-effect',
    'interaction', 'pregnant', 'pregnancy', 'allergic', 'allergy',
    'symptom', 'diagnose', 'diagnosis', 'pain', 'fever', 'rash',
    'should i take', 'can i take', 'safe to take', 'breastfeeding'
  ];
  const SAFETY_RESPONSE =
    `That's a question best answered by one of our licensed pharmacists rather than me — I don't want to guess on anything medication-related. ` +
    `<a href="${WHATSAPP_LINK}" target="_blank" rel="noopener">Chat with a pharmacist on WhatsApp</a> and they'll get back to you quickly.`;

  // Brand knowledge base
  const KB = [
    { keywords: ['hour', 'open', 'time', 'close', 'closing'], response: "We're open Monday–Saturday, 8:00am–10:00pm, and Sundays 10:00am–8:00pm. Health doesn't wait for business hours, so neither do we." },
    { keywords: ['address', 'location', 'where are you', 'find you', 'direction', 'jakande', 'ebeano'], response: "We're inside Prince Ebeano Supermarket, Platinum Way, Jakande, Lagos. Need directions? Ask us on WhatsApp and we'll guide you in." },
    { keywords: ['deliver', 'delivery', 'ship'], response: "Yes — we deliver across Lagos, with select arrangements outside the state. Send your location on WhatsApp and we'll confirm timing and cost." },
    { keywords: ['prescription', 'script'], response: "Some medications need a valid prescription — send a photo via WhatsApp or bring it in-store. Over-the-counter items don't require one." },
    { keywords: ['genuine', 'fake', 'counterfeit', 'original', 'authentic'], response: "Every product we stock is sourced from verified manufacturers and licensed distributors. We don't stock counterfeit or expired medication." },
    { keywords: ['cellgevity', 'glutathione', 'riboceine'], response: "CellGevity is a glutathione-support supplement built on RiboCeine technology. It's not a substitute for medical treatment, so we'd rather talk it through with you on WhatsApp before you buy." },
    { keywords: ['whatsapp', 'order', 'buy', 'purchase'], response: "Easiest way to order: message us on WhatsApp with the product name or a photo of your prescription, and we'll confirm price, availability, and delivery or pickup." },
    { keywords: ['mission', 'about you', 'who are you', 'story', 'beyondtabs'], response: "BeyondTabs Pharmacy exists to make quality healthcare simple, honest, and within reach — genuine products, honest advice, and care that goes beyond the transaction." },
    { keywords: ['ceo', 'founder', 'adaora', 'nnadi', 'owner', 'pharmacist in charge'], response: "BeyondTabs is led by Pharm. (Mrs.) Adaora Nnadi, MD/CEO. You can watch her story on our About page." },
    { keywords: ['phone', 'call', 'number', 'contact'], response: "You can call or WhatsApp us on 0903 121 8118 — whichever's easier for you." },
    { keywords: ['newsletter', 'subscribe', 'email list'], response: "You can subscribe to our wellness newsletter right on the homepage — occasional tips, no spam." },
    { keywords: ['price', 'cost', 'how much'], response: "Prices vary by product, so the fastest way to get an accurate quote is to send us the product name on WhatsApp." },
    { keywords: ['counseling', 'advice', 'talk to pharmacist', 'speak to pharmacist'], response: "Always welcome. Free health counseling is one of the reasons people choose us — call, WhatsApp, or visit us in-store." },
    { keywords: ['product', 'catalog', 'shop', 'skincare', 'supplement list', 'what do you sell', 'what do you stock'], response: "You can browse our full product catalog — medications, supplements, skincare and more — on the Shop page. Tap a product's WhatsApp button to order it directly." },
    { keywords: ['account', 'sign up', 'signup', 'register', 'create account'], response: "You can create a free account on our Register page — it makes checkout faster and lets you track orders and bookings." },
    { keywords: ['login', 'log in', 'sign in'], response: "You can sign in anytime from the Login page in the top menu. Don't have an account yet? Registering only takes a minute." },
    { keywords: ['book', 'booking', 'consultation', 'appointment', 'aesthetics'], response: "You can book a consultation — pharmacist, skin assessment, or wellness check-in — on our Book Consultation page. Pick a service, date and time, and we'll confirm your slot." },
    { keywords: ['team', 'staff', 'pharmacist name', 'who works', 'meet the team'], response: "Meet the team on our homepage — led by Pharm. (Mrs.) Adaora Nnadi, MD/CEO, alongside our pharmacists and customer care team." },
    { keywords: ['subscription', 'subscribe', 'plan', 'monthly plan', 'membership'], response: "We have three subscription plans — Essential, Plus, and Family — with free delivery and discounts built in. Take a look on our Subscriptions page." },
    { keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'], response: "Hello! 👋 Ask me about our hours, location, delivery, or products." },
    { keywords: ['thank', 'thanks', 'appreciate'], response: "You're always welcome! Anything else I can help with?" },
    { keywords: ['bye', 'goodbye'], response: "Take care, and feel better, feel alive! 💗 We're a WhatsApp message away if you need anything." },
  ];

  const FALLBACK_RESPONSE =
    `I don't have that answered yet — for anything specific, our team will sort you out quickly. ` +
    `<a href="${WHATSAPP_LINK}" target="_blank" rel="noopener">Message us on WhatsApp</a>.`;

  function loadHistory() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (err) {
      return null;
    }
  }

  function saveHistory(history) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    } catch (err) {
      // localStorage unavailable (e.g. private browsing) — chat still works, just won't persist
    }
  }

  let history = loadHistory();
  if (!history || !history.length) {
    history = [{ role: 'bot', text: WELCOME_MESSAGE }];
    saveHistory(history);
  }

  function renderMessage(msg) {
    const wrapper = document.createElement('div');
    wrapper.className = msg.role === 'user' ? 'flex justify-end' : 'flex justify-start';

    const bubble = document.createElement('div');
    bubble.className =
      msg.role === 'user'
        ? 'max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-brand-magenta to-brand-violet text-white text-sm px-4 py-2.5 leading-relaxed'
        : 'chat-bubble-bot max-w-[80%] rounded-2xl rounded-bl-sm bg-brand-blush text-brand-ink text-sm px-4 py-2.5 leading-relaxed';
    bubble.innerHTML = msg.text;

    wrapper.appendChild(bubble);
    return wrapper;
  }

  function renderAll() {
    chatMessages.innerHTML = '';
    history.forEach((msg) => chatMessages.appendChild(renderMessage(msg)));
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function showTyping() {
    const wrapper = document.createElement('div');
    wrapper.id = 'typing-indicator';
    wrapper.className = 'flex justify-start';
    wrapper.innerHTML =
      '<div class="rounded-2xl rounded-bl-sm bg-brand-blush px-4 py-3 flex items-center gap-1">' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-brand-ink/40 inline-block"></span>' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-brand-ink/40 inline-block"></span>' +
      '<span class="typing-dot h-1.5 w-1.5 rounded-full bg-brand-ink/40 inline-block"></span>' +
      '</div>';
    chatMessages.appendChild(wrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function removeTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  function getResponse(userText) {
    const text = userText.toLowerCase();

    for (const word of SAFETY_KEYWORDS) {
      if (text.includes(word)) return SAFETY_RESPONSE;
    }

    let bestMatch = null;
    let bestScore = 0;
    KB.forEach((entry) => {
      let score = 0;
      entry.keywords.forEach((kw) => {
        if (text.includes(kw)) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    });

    return bestMatch ? bestMatch.response : FALLBACK_RESPONSE;
  }

  function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    history.push({ role: 'user', text: escapeHtml(trimmed) });
    saveHistory(history);
    renderAll();

    showTyping();
    const delay = 500 + Math.random() * 500;
    setTimeout(() => {
      removeTyping();
      const response = getResponse(trimmed);
      history.push({ role: 'bot', text: response });
      saveHistory(history);
      renderAll();
    }, delay);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  renderAll();

  chatToggle.addEventListener('click', () => {
    chatPanel.classList.toggle('chat-hidden');
    if (!chatPanel.classList.contains('chat-hidden')) {
      chatInput.focus();
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  });

  if (chatClose) {
    chatClose.addEventListener('click', () => {
      chatPanel.classList.add('chat-hidden');
    });
  }

  if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      sendMessage(chatInput.value);
      chatInput.value = '';
    });
  }

  if (chatClear) {
    chatClear.addEventListener('click', () => {
      history = [{ role: 'bot', text: WELCOME_MESSAGE }];
      saveHistory(history);
      renderAll();
    });
  }
})();

/* =========================================================
   PRODUCT CATALOG — products.html
   Fetches live from server/products/list.php (MySQL via the PHP
   backend). "Order" buttons deep-link into WhatsApp with the product
   name pre-filled — there's no cart or online checkout yet, consistent
   with how the rest of the site takes orders.
   ========================================================= */
(function () {
  const grid = document.getElementById('product-grid');
  if (!grid) return; // not on the products page

  const WHATSAPP_NUMBER = '2349031218118';

  const CATEGORY_STYLES = {
    Medications: { grad: 'from-brand-magenta to-brand-magentaDark', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    Supplements: { grad: 'from-brand-violet to-brand-violetDark', icon: 'M9 12.75l3 3 3-3m-6-6.75l3-3 3 3M12 3v18' },
    Skincare: { grad: 'from-brand-pink to-brand-magenta', icon: 'M12 2.25c-3 3-6 6.75-6 10.5a6 6 0 0012 0c0-3.75-3-7.5-6-10.5z' },
    Wellness: { grad: 'from-brand-violetDark to-brand-ink', icon: 'M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    'Mother & Baby': { grad: 'from-brand-magenta to-brand-violet', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
  };

  const naira = (n) => '\u20a6' + Number(n).toLocaleString('en-NG');
  const filterBar = document.getElementById('product-filters');
  const searchInput = document.getElementById('product-search');
  const resultCount = document.getElementById('product-count');
  let activeCategory = 'All';
  let allProducts = [];

  function buildFilters(products) {
    if (!filterBar) return;
    const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
    filterBar.innerHTML = categories.map((cat, i) => `
      <button data-cat="${cat}" class="shrink-0 text-xs font-semibold px-4 py-2 rounded-full transition-colors ${cat === activeCategory ? 'bg-brand-ink text-white' : 'bg-brand-blush text-brand-ink/60'}">${cat}</button>
    `).join('');
    filterBar.querySelectorAll('[data-cat]').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.dataset.cat;
        renderProducts();
      });
    });
  }

  function renderProducts() {
    const term = (searchInput?.value || '').toLowerCase();
    const rows = allProducts.filter((p) => {
      const matchesCat = activeCategory === 'All' || p.category === activeCategory;
      const matchesTerm = !term || p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term);
      return matchesCat && matchesTerm;
    });

    buildFilters(allProducts);
    if (resultCount) resultCount.textContent = `${rows.length} product${rows.length === 1 ? '' : 's'}`;

    grid.innerHTML = rows.length
      ? rows.map((p) => {
          const style = CATEGORY_STYLES[p.category] || CATEGORY_STYLES.Medications;
          const waText = encodeURIComponent(`Hello BeyondTabs Pharmacy, I'd like to order: ${p.name}`);
          const outOfStock = p.status === 'Out of Stock';
          return `
          <article class="bg-white rounded-3xl overflow-hidden shadow-soft ring-1 ring-brand-ink/5 flex flex-col ${outOfStock ? 'opacity-70' : ''}">
            <div class="aspect-[4/3] ${p.image ? '' : `bg-gradient-to-br ${style.grad}`} flex items-center justify-center relative overflow-hidden">
              ${p.image
                ? `<img src="${p.image}" alt="${p.name}" class="h-full w-full object-cover">`
                : `<svg class="h-14 w-14 text-white/85" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${style.icon}"/></svg>`}
              ${p.rx ? '<span class="absolute top-3 left-3 bg-white/90 text-brand-magenta text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">Rx Required</span>' : ''}
              ${outOfStock ? '<span class="absolute top-3 right-3 bg-brand-ink/80 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">Out of Stock</span>' : ''}
            </div>
            <div class="p-5 flex flex-col flex-1">
              <p class="text-[11px] font-bold uppercase tracking-widest text-brand-magenta">${p.category}</p>
              <h3 class="mt-1.5 font-display font-700 text-base text-brand-ink leading-snug">${p.name}</h3>
              <p class="mt-2 text-sm text-brand-ink/60 leading-relaxed flex-1">${p.blurb}</p>
              ${p.status === 'Low Stock' ? '<p class="mt-1 text-[11px] font-semibold text-amber-600">Only a few left</p>' : ''}
              <div class="mt-4 flex items-center justify-between gap-3">
                <span class="font-display font-800 text-lg text-brand-ink">${naira(p.price)}</span>
                ${outOfStock
                  ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-brand-ink/10 px-4 py-2 text-xs font-bold text-brand-ink/40 whitespace-nowrap">Unavailable</span>'
                  : `<a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener"
                       class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-violet px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap">
                       Order
                     </a>`}
              </div>
              ${p.rx ? '<p class="mt-2 text-[11px] text-brand-ink/40">Requires a valid prescription \u2014 send it via WhatsApp when ordering.</p>' : ''}
            </div>
          </article>`;
        }).join('')
      : `<p class="col-span-full text-center text-sm text-brand-ink/40 py-12">No products match your search — try another term or category.</p>`;
  }

  function loadProducts() {
    grid.innerHTML = `<p class="col-span-full text-center text-sm text-brand-ink/40 py-12">Loading products…</p>`;
    fetch('server/products/list.php')
      .then((res) => res.json())
      .then((result) => {
        if (!result.success) throw new Error(result.error || 'Could not load products.');
        allProducts = result.products || [];
        renderProducts();
      })
      .catch(() => {
        grid.innerHTML = `<p class="col-span-full text-center text-sm text-brand-magenta py-12">We couldn't load the shop right now — please refresh, or message us on WhatsApp for the latest catalog.</p>`;
      });
  }

  if (searchInput) searchInput.addEventListener('input', renderProducts);
  loadProducts();
})();

/* =========================================================
   LOGIN / REGISTER / CONSULTATION forms
   These POST to the PHP backend (server/…). Login and register are
   auth actions, so — unlike the newsletter/contact forms — they do
   NOT silently fall back to "pretend success" if the server can't be
   reached; a real account needs a real server. The consultation form
   is informational like contact/newsletter, so it does fall back to
   a local save so the page still feels functional without a server.
   ========================================================= */

// ---------- Login ----------
(function () {
  const form = document.getElementById('login-form');
  if (!form) return;
  const errorEl = document.getElementById('login-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.classList.add('hidden');
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
      const res = await fetch('server/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await res.json();
      if (result.success) {
        try { localStorage.setItem('beyondtabs_user', JSON.stringify(result.user)); } catch (err) {}
        window.location.href = 'index.html';
      } else if (errorEl) {
        errorEl.textContent = result.error || 'Incorrect email or password.';
        errorEl.classList.remove('hidden');
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = "We couldn't reach the server to sign you in. If you're the site owner, make sure the PHP backend is running (see server/README.md).";
        errorEl.classList.remove('hidden');
      }
    }
  });
})();

// ---------- Register ----------
(function () {
  const form = document.getElementById('register-form');
  if (!form) return;
  const errorEl = document.getElementById('register-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.classList.add('hidden');
    const name = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const phone = document.getElementById('register-phone').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
      if (errorEl) {
        errorEl.textContent = 'Passwords do not match.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    try {
      const res = await fetch('server/auth/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const result = await res.json();
      if (result.success) {
        try { localStorage.setItem('beyondtabs_user', JSON.stringify(result.user)); } catch (err) {}
        window.location.href = 'index.html';
      } else if (errorEl) {
        errorEl.textContent = result.error || 'Could not create your account.';
        errorEl.classList.remove('hidden');
      }
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = "We couldn't reach the server to create your account. If you're the site owner, make sure the PHP backend is running (see server/README.md).";
        errorEl.classList.remove('hidden');
      }
    }
  });
})();

// ---------- Book Consultation ----------
(function () {
  const form = document.getElementById('consultation-form');
  if (!form) return;
  const successEl = document.getElementById('consultation-success');
  const errorEl = document.getElementById('consultation-error');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errorEl) errorEl.classList.add('hidden');
    if (successEl) successEl.classList.add('hidden');

    const data = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('server/consultations/book.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!result.success) throw new Error(result.error || 'Booking failed.');

      form.reset();
      if (successEl) successEl.classList.remove('hidden');
    } catch (err) {
      if (errorEl) {
        errorEl.textContent = "We couldn't submit your booking — please try again, or message us on WhatsApp instead.";
        errorEl.classList.remove('hidden');
      }
    }
  });
})();

/* =========================================================
   FEATURED PRODUCTS — homepage preview
   Fetches live from server/products/list.php — the same source that
   powers products.html and the admin dashboard's Products page.
   ========================================================= */
(function () {
  const grid = document.getElementById('featured-products-grid');
  if (!grid) return;

  const CATEGORY_STYLES = {
    Medications: { grad: 'from-brand-magenta to-brand-magentaDark', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    Supplements: { grad: 'from-brand-violet to-brand-violetDark', icon: 'M9 12.75l3 3 3-3m-6-6.75l3-3 3 3M12 3v18' },
    Skincare: { grad: 'from-brand-pink to-brand-magenta', icon: 'M12 2.25c-3 3-6 6.75-6 10.5a6 6 0 0012 0c0-3.75-3-7.5-6-10.5z' },
    Wellness: { grad: 'from-brand-violetDark to-brand-ink', icon: 'M12 6v6l4 2M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    'Mother & Baby': { grad: 'from-brand-magenta to-brand-violet', icon: 'M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z' },
  };

  const naira = (n) => '\u20a6' + Number(n).toLocaleString('en-NG');
  const WHATSAPP_NUMBER = '2349031218118';

  function render(products) {
    grid.innerHTML = products.map((p) => {
      const style = CATEGORY_STYLES[p.category] || CATEGORY_STYLES.Medications;
      const waText = encodeURIComponent(`Hello BeyondTabs Pharmacy, I'd like to order: ${p.name}`);
      return `
      <article class="bg-white rounded-3xl overflow-hidden shadow-soft ring-1 ring-brand-ink/5 flex flex-col">
        <div class="aspect-[4/3] ${p.image ? '' : `bg-gradient-to-br ${style.grad}`} flex items-center justify-center overflow-hidden">
          ${p.image
            ? `<img src="${p.image}" alt="${p.name}" class="h-full w-full object-cover">`
            : `<svg class="h-12 w-12 text-white/85" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="${style.icon}"/></svg>`}
        </div>
        <div class="p-5 flex flex-col flex-1">
          <p class="text-[11px] font-bold uppercase tracking-widest text-brand-magenta">${p.category}</p>
          <h3 class="mt-1.5 font-display font-700 text-base text-brand-ink leading-snug flex-1">${p.name}</h3>
          <div class="mt-4 flex items-center justify-between gap-3">
            <span class="font-display font-800 text-lg text-brand-ink">${naira(p.price)}</span>
            <a href="https://wa.me/${WHATSAPP_NUMBER}?text=${waText}" target="_blank" rel="noopener"
               class="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-brand-magenta to-brand-violet px-4 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity whitespace-nowrap">
               Order
            </a>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  grid.innerHTML = `<p class="col-span-full text-center text-sm text-brand-ink/40 py-12">Loading products…</p>`;
  fetch('server/products/list.php')
    .then((res) => res.json())
    .then((result) => {
      if (!result.success) throw new Error(result.error || 'Could not load products.');
      render((result.products || []).slice(0, 9));
    })
    .catch(() => {
      grid.innerHTML = '';
    });
})();

/* =========================================================
   CONSULTATION SPECIALIST CARDS — consultation.html
   The booking form stays hidden until the person picks who they want
   to see. Clicking a card reveals the form, records which specialist
   type was chosen (doctor / pharmacist / dentist / skin_specialist)
   in a hidden field that's submitted and stored with the booking, and
   scrolls the form into view.
   ========================================================= */
(function () {
  const cardWrap = document.getElementById('consult-cards');
  const formSection = document.getElementById('consultation-form-section');
  const typeField = document.getElementById('consult-type');
  const serviceField = document.getElementById('consult-service');
  const selectedLabel = document.getElementById('consult-selected-label');
  const changeBtn = document.getElementById('consult-change-btn');
  if (!cardWrap || !formSection || !typeField || !serviceField) return;

  const cards = cardWrap.querySelectorAll('[data-card]');

  function selectCard(card) {
    typeField.value = card.dataset.type;
    serviceField.value = card.dataset.service;
    if (selectedLabel) selectedLabel.textContent = card.querySelector('h3').textContent;

    cardWrap.closest('section').classList.add('hidden');
    formSection.classList.remove('hidden');
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  cards.forEach((card) => card.addEventListener('click', () => selectCard(card)));

  if (changeBtn) {
    changeBtn.addEventListener('click', () => {
      formSection.classList.add('hidden');
      cardWrap.closest('section').classList.remove('hidden');
      cardWrap.closest('section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
})();

/* =========================================================
   SUBSCRIPTION PLANS — subscriptions.html
   Fetches live from server/subscriptions/list.php. Plans are entirely
   managed by admin (Admin dashboard → Subscriptions), so this page has
   no hardcoded pricing — whatever admin sets is what shows here.
   ========================================================= */
(function () {
  const grid = document.getElementById('plans-grid');
  if (!grid) return;

  const naira = (n) => '\u20a6' + Number(n).toLocaleString('en-NG');
  const CHECK_SVG = '<svg class="h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"/></svg>';

  function planCard(plan) {
    const waText = encodeURIComponent(`Hi, I'd like to subscribe to the ${plan.name} plan.`);
    const features = (plan.features || []).map((f) => `<li class="flex gap-2.5">${CHECK_SVG}${f}</li>`).join('');

    if (plan.is_popular) {
      return `
      <div class="relative bg-gradient-to-br from-brand-ink via-brand-violetDark to-brand-magenta rounded-3xl shadow-soft p-8 flex flex-col text-white lg:-translate-y-3">
        <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-brand-magenta text-[11px] font-bold uppercase tracking-wide px-4 py-1 rounded-full shadow-soft">Most Popular</span>
        <h3 class="font-display font-700 text-xl">${plan.name}</h3>
        ${plan.tagline ? `<p class="mt-1 text-sm text-white/70">${plan.tagline}</p>` : ''}
        <p class="mt-6 font-display font-800 text-4xl">${naira(plan.price)}<span class="text-base font-body font-medium text-white/60">/${plan.billing_period || 'month'}</span></p>
        <ul class="mt-6 space-y-3 text-sm text-white/85 flex-1 [&_svg]:text-brand-pink">${features}</ul>
        <a href="https://wa.me/2349031218118?text=${waText}" target="_blank" rel="noopener"
           class="mt-8 w-full text-center rounded-full bg-white px-6 py-3 text-sm font-bold text-brand-ink hover:bg-brand-blush transition-colors">
          Get Started
        </a>
      </div>`;
    }

    return `
    <div class="bg-white rounded-3xl shadow-soft ring-1 ring-brand-ink/5 p-8 flex flex-col">
      <h3 class="font-display font-700 text-xl text-brand-ink">${plan.name}</h3>
      ${plan.tagline ? `<p class="mt-1 text-sm text-brand-ink/55">${plan.tagline}</p>` : ''}
      <p class="mt-6 font-display font-800 text-4xl text-brand-ink">${naira(plan.price)}<span class="text-base font-body font-medium text-brand-ink/45">/${plan.billing_period || 'month'}</span></p>
      <ul class="mt-6 space-y-3 text-sm text-brand-ink/70 flex-1 [&_svg]:text-brand-magenta">${features}</ul>
      <a href="https://wa.me/2349031218118?text=${waText}" target="_blank" rel="noopener"
         class="mt-8 w-full text-center rounded-full border-2 border-brand-ink px-6 py-3 text-sm font-bold text-brand-ink hover:bg-brand-ink hover:text-white transition-colors">
        Get Started
      </a>
    </div>`;
  }

  fetch('server/subscriptions/list.php')
    .then((res) => res.json())
    .then((result) => {
      if (!result.success) throw new Error(result.error || 'Could not load plans.');
      const plans = result.plans || [];
      grid.innerHTML = plans.length
        ? plans.map(planCard).join('')
        : `<p class="col-span-full text-center text-sm text-brand-ink/40 py-12">No subscription plans are available right now — check back soon, or ask us on WhatsApp.</p>`;
    })
    .catch(() => {
      grid.innerHTML = `<p class="col-span-full text-center text-sm text-brand-magenta py-12">We couldn't load our plans right now — please refresh, or message us on WhatsApp.</p>`;
    });
})();
