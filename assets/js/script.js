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

// Newsletter form (front-end only — wire this up to your email provider, e.g. Mailchimp or Formspree)
const newsletterForm = document.getElementById('newsletter-form');
const newsletterMessage = document.getElementById('newsletter-message');
if (newsletterForm) {
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    newsletterForm.reset();
    if (newsletterMessage) newsletterMessage.classList.remove('hidden');
  });
}

// Contact form (front-end only — wire this up to your backend or a form service, e.g. Formspree)
const contactForm = document.getElementById('contact-form');
const contactMessage = document.getElementById('contact-message');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    contactForm.reset();
    if (contactMessage) contactMessage.classList.remove('hidden');
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
