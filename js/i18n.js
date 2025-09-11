let translations = {};

function t(key, vars = {}) {
  const parts = key.split('.');
  let value = translations;
  for (const p of parts) {
    value = value ? value[p] : undefined;
  }
  if (typeof value !== 'string') {
    return key;
  }
  return value.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : ''));
}

async function loadTranslations(lang) {
  const res = await fetch(`/js/i18n/${lang}.json`);
  if (!res.ok) throw new Error('missing lang');
  translations = await res.json();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
}

async function initI18n() {
  const pathLang = location.pathname.split('/')[1];
  const htmlLang = document.documentElement.lang;
  let lang = pathLang || htmlLang || 'en';
  try {
    await loadTranslations(lang);
  } catch (e) {
    if (lang !== 'en') {
      await loadTranslations('en');
    }
  }
  applyTranslations();
}

window.t = t;
window.initI18n = initI18n;
