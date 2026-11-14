const header = document.querySelector('.site-header--home');
const cover = document.querySelector('.cover');
const coverIntro = cover.querySelector('.intro');
const coverContacts = document.querySelector('.cover .contacts');
const compactLanguageButton = header.querySelector('.site-header__language-toggle');

function updateHeader() {
  const visible = Math.max(
    coverIntro.getBoundingClientRect().bottom,
    coverContacts.getBoundingClientRect().bottom
  ) <= 0;
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
  header.querySelector('.site-header__mark').setAttribute('aria-label', en ? 'Home' : 'На главную');
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
  updateHeader();
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

// Snap only between the cover and the start of the featured cases.
const casesHeading = document.querySelector('#cases h2');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let transitionDirection = 0;
let transitionFrame = 0;
let touchStartY = null;

function atCoverStart() {
  return window.scrollY < Math.min(cover.offsetHeight * .45, 300)
    && casesHeading.getBoundingClientRect().top > window.innerHeight * .35;
}

function sectionTarget(section) {
  return Math.max(0, window.scrollY + section.getBoundingClientRect().top - header.offsetHeight - 8);
}

function atCasesStart() {
  const target = sectionTarget(casesHeading);
  return window.scrollY > Math.min(cover.offsetHeight * .45, 300)
    && window.scrollY <= target + 140;
}

function moveBetweenSections(direction) {
  if (transitionDirection === direction) return;
  if (!transitionDirection && !(direction > 0 ? atCoverStart() : atCasesStart())) return;
  cancelAnimationFrame(transitionFrame);
  transitionDirection = direction;
  const start = window.scrollY;
  const target = direction > 0 ? sectionTarget(casesHeading) : 0;

  if (reducedMotion.matches) {
    window.scrollTo(0, target);
    transitionDirection = 0;
    return;
  }

  const duration = 700;
  let startedAt;
  function step(now) {
    if (startedAt === undefined) startedAt = now;
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    window.scrollTo(0, start + (target - start) * eased);
    if (progress < 1) {
      transitionFrame = requestAnimationFrame(step);
    } else {
      transitionFrame = 0;
      transitionDirection = 0;
    }
  }
  transitionFrame = requestAnimationFrame(step);
}

window.addEventListener('wheel', (event) => {
  if (event.ctrlKey || !event.deltaY) return;
  const direction = Math.sign(event.deltaY);
  if (transitionDirection) {
    event.preventDefault();
    if (direction !== transitionDirection) moveBetweenSections(direction);
    return;
  }
  if (direction > 0 ? atCoverStart() : atCasesStart()) {
    event.preventDefault();
    moveBetweenSections(direction);
  }
}, { passive: false });

window.addEventListener('touchstart', (event) => {
  touchStartY = event.touches.length === 1 && (atCoverStart() || atCasesStart() || transitionDirection)
    ? event.touches[0].clientY : null;
}, { passive: true });
window.addEventListener('touchmove', (event) => {
  if (event.touches.length !== 1 || touchStartY === null) return;
  const delta = touchStartY - event.touches[0].clientY;
  if (Math.abs(delta) <= 18) return;
  const direction = Math.sign(delta);
  if (transitionDirection) {
    event.preventDefault();
    if (direction !== transitionDirection) moveBetweenSections(direction);
    return;
  }
  if (direction > 0 ? atCoverStart() : atCasesStart()) {
    event.preventDefault();
    touchStartY = null;
    moveBetweenSections(direction);
  }
}, { passive: false });
window.addEventListener('touchend', () => { touchStartY = null; }, { passive: true });

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (event.target instanceof Element && event.target.closest('button, a, input, textarea, select'))) return;
  if ((event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') && atCoverStart()) {
    event.preventDefault();
    moveBetweenSections(1);
  } else if ((event.key === 'ArrowUp' || event.key === 'PageUp') && atCasesStart()) {
    event.preventDefault();
    moveBetweenSections(-1);
  }
});
