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
