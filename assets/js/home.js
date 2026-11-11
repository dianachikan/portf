const header = document.querySelector('.scroll-header');
const headerInner = header.querySelector('.scroll-header__inner');
const cover = document.querySelector('.cover');
const coverIntro = cover.querySelector('.intro');
const coverContacts = document.querySelector('.cover .contacts');
headerInner.append(coverContacts.cloneNode(true), document.querySelector('.cover .languages').cloneNode(true));
const compactLanguageButton = document.createElement('button');
compactLanguageButton.className = 'language-toggle';
compactLanguageButton.type = 'button';
headerInner.append(compactLanguageButton);

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

// Intentional scrolls connect the cover, cases and experience. The case list
// itself and the return from experience keep their normal scrolling behavior.
const cases = document.querySelector('#cases');
const lastCase = cases.querySelector('.cards a:last-child');
const experience = document.querySelector('#about');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let scrollingBetweenSections = false;
let scrollDirection = 0;
let scrollDestination = '';
let transitionFrame = 0;
let transitionTimer = 0;
let touchStartY = null;
let touchOrigin = null;

function atCoverStart() {
  return window.scrollY < Math.min(cover.offsetHeight * .45, 300)
    && cases.getBoundingClientRect().top > window.innerHeight * .35;
}

function sectionTarget(section) {
  return Math.max(0, window.scrollY + section.getBoundingClientRect().top - header.offsetHeight - 8);
}

function atCasesStart() {
  return window.scrollY > Math.min(cover.offsetHeight * .45, 300)
    && window.scrollY < sectionTarget(cases) + 160;
}

function atLastCase() {
  const lastCaseBottom = lastCase.getBoundingClientRect().bottom;
  return lastCaseBottom > 0
    && lastCaseBottom <= window.innerHeight - 24
    && experience.getBoundingClientRect().top > header.offsetHeight + 24;
}

function moveBetweenSections(destination, force = false) {
  const canMove = destination === 'cases' ? atCoverStart()
    : destination === 'hero' ? atCasesStart() : atLastCase();
  if (scrollingBetweenSections || (!force && !canMove)) return;
  scrollingBetweenSections = true;
  scrollDirection = destination === 'hero' ? -1 : 1;
  scrollDestination = destination;
  clearTimeout(transitionTimer);
  const start = window.scrollY;
  const target = destination === 'hero' ? 0 : sectionTarget(destination === 'cases' ? cases : experience);

  if (reducedMotion.matches) {
    window.scrollTo(0, target);
    scrollingBetweenSections = false;
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
      transitionTimer = window.setTimeout(() => { scrollingBetweenSections = false; }, 180);
    }
  }
  transitionFrame = requestAnimationFrame(step);
}

window.addEventListener('wheel', (event) => {
  if (event.ctrlKey) return;
  if (scrollingBetweenSections) {
    if (Math.sign(event.deltaY) === -scrollDirection) {
      if (transitionFrame) cancelAnimationFrame(transitionFrame);
      clearTimeout(transitionTimer);
      scrollingBetweenSections = false;
      if (scrollDestination !== 'experience') {
        event.preventDefault();
        moveBetweenSections(scrollDestination === 'cases' ? 'hero' : 'cases', true);
      }
      return;
    }
    event.preventDefault();
    return;
  }
  const destination = event.deltaY > 0
    ? (atCoverStart() ? 'cases' : atLastCase() ? 'experience' : '')
    : (event.deltaY < 0 && atCasesStart() ? 'hero' : '');
  if (destination) {
    event.preventDefault();
    moveBetweenSections(destination);
  }
}, { passive: false });

window.addEventListener('touchstart', (event) => {
  touchOrigin = event.touches.length === 1
    ? { cover: atCoverStart(), cases: atCasesStart(), lastCase: atLastCase() } : null;
  touchStartY = touchOrigin && Object.values(touchOrigin).some(Boolean) ? event.touches[0].clientY : null;
}, { passive: true });
window.addEventListener('touchmove', (event) => {
  if (event.touches.length !== 1) {
    touchStartY = null;
    touchOrigin = null;
    return;
  }
  if (scrollingBetweenSections) {
    event.preventDefault();
    return;
  }
  const delta = touchStartY === null ? 0 : touchStartY - event.touches[0].clientY;
  const destination = delta > 0
    ? (touchOrigin?.cover ? 'cases' : touchOrigin?.lastCase ? 'experience' : '')
    : (touchOrigin?.cases ? 'hero' : '');
  if (Math.abs(delta) > 18 && destination) {
    event.preventDefault();
    touchStartY = null;
    touchOrigin = null;
    moveBetweenSections(destination, true);
  }
}, { passive: false });
window.addEventListener('touchend', () => { touchStartY = null; touchOrigin = null; }, { passive: true });

window.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || (event.target instanceof Element && event.target.closest('button, a, input, textarea, select'))) return;
  if ((event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') && atCoverStart()) {
    event.preventDefault();
    moveBetweenSections('cases');
  } else if ((event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') && atLastCase()) {
    event.preventDefault();
    moveBetweenSections('experience');
  } else if ((event.key === 'ArrowUp' || event.key === 'PageUp') && atCasesStart()) {
    event.preventDefault();
    moveBetweenSections('hero');
  }
});

// Reveal section content once as it enters the viewport. Keep content visible when
// motion is reduced or IntersectionObserver is unavailable.
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const revealItems = document.querySelectorAll('#cases h2, #cases .cards a, .experience h2, .experience__item');
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
