const header = document.querySelector('.scroll-header');
const headerInner = header.querySelector('.scroll-header__inner');
const cover = document.querySelector('.cover');
const coverContacts = document.querySelector('.cover .contacts');
headerInner.append(coverContacts.cloneNode(true), document.querySelector('.cover .languages').cloneNode(true));
const compactLanguageButton = document.createElement('button');
compactLanguageButton.className = 'language-toggle';
compactLanguageButton.type = 'button';
headerInner.append(compactLanguageButton);

function updateHeader() {
  const visible = cover.getBoundingClientRect().bottom <= 0;
  header.classList.toggle('is-visible', visible);
  header.inert = !visible;
}
window.addEventListener('scroll', updateHeader, { passive: true });
if ('ResizeObserver' in window) {
  new ResizeObserver(updateHeader).observe(cover);
} else {
  window.addEventListener('resize', updateHeader);
}
updateHeader();

const copy = [...document.querySelectorAll('[data-en]')];
const buttons = document.querySelectorAll('[data-lang]');
const socialLinks = document.querySelectorAll('.social-link');
const originalTitle = document.title;
for (const item of copy) item.dataset.ru = item.textContent;
for (const link of socialLinks) {
  link.dataset.ruHref = link.getAttribute('href');
  link.querySelector('img').dataset.ruSrc = link.querySelector('img').getAttribute('src');
}

function setLanguage(language) {
  const en = language === 'en';
  document.documentElement.lang = language;
  header.setAttribute('aria-label', en ? 'Navigation' : 'Навигация');
  header.querySelector('.home-mark').setAttribute('aria-label', en ? 'Home' : 'На главную');
  document.title = en ? 'Diana Chikan — Product Designer' : originalTitle;
  document.querySelector('.portrait').alt = en ? 'Diana Chikan' : 'Диана Чикан';
  for (const item of copy) item.textContent = item.dataset[language];
  for (const link of socialLinks) {
    link.href = link.dataset[`${language}Href`];
    link.querySelector('img').src = link.querySelector('img').dataset[`${language}Src`];
    link.setAttribute('aria-label', en ? 'LinkedIn' : 'Телеграм-канал');
  }
  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  }
  compactLanguageButton.textContent = en ? 'RU' : 'EN';
  compactLanguageButton.lang = en ? 'ru' : 'en';
  compactLanguageButton.setAttribute('aria-label', en ? 'Переключить на русский' : 'Switch to English');
}

const url = new URL(location.href);
setLanguage(url.searchParams.get('lang') === 'en' ? 'en' : 'ru');

let languageSwitching = false;
function switchLanguage(language) {
  if (languageSwitching || language === document.documentElement.lang) return;
  languageSwitching = true;

  const apply = () => {
    setLanguage(language);
    const next = new URL(location.href);
    next.searchParams.set('lang', language);
    history.replaceState(null, '', next);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    apply();
    languageSwitching = false;
  } else {
    document.documentElement.classList.add('language-changing');
    window.setTimeout(() => {
      apply();
      requestAnimationFrame(() => {
        document.documentElement.classList.remove('language-changing');
        window.setTimeout(() => { languageSwitching = false; }, 180);
      });
    }, 150);
  }
}

for (const button of buttons) {
  button.addEventListener('click', () => {
    switchLanguage(button.dataset.lang);
  });
}
compactLanguageButton.addEventListener('click', () => {
  switchLanguage(document.documentElement.lang === 'ru' ? 'en' : 'ru');
});

// Reveal projects once as they enter the viewport. Keep content visible when
// motion is reduced or IntersectionObserver is unavailable.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
  const revealItems = document.querySelectorAll('#cases h2, #cases .cards a');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-revealed');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  for (const item of revealItems) {
    item.classList.add('reveal');
    revealObserver.observe(item);
  }
  document.documentElement.classList.add('motion-ready');
}
