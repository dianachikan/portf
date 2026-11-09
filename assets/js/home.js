const copy = [...document.querySelectorAll('[data-en]')];
const buttons = document.querySelectorAll('[data-lang]');
const originalTitle = document.title;
for (const item of copy) item.dataset.ru = item.textContent;

function setLanguage(language) {
  const en = language === 'en';
  document.documentElement.lang = language;
  document.title = en ? 'Diana Chikan — Product Designer' : originalTitle;
  document.querySelector('.portrait').alt = en ? 'Diana Chikan' : 'Диана Чикан';
  for (const item of copy) item.textContent = item.dataset[language];
  for (const button of buttons) {
    button.setAttribute('aria-pressed', String(button.dataset.lang === language));
  }
}

const url = new URL(location.href);
setLanguage(url.searchParams.get('lang') === 'en' ? 'en' : 'ru');
for (const button of buttons) {
  button.addEventListener('click', () => {
    const language = button.dataset.lang;
    setLanguage(language);
    const next = new URL(location.href);
    next.searchParams.set('lang', language);
    history.replaceState(null, '', next);
  });
}
