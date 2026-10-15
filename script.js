'use strict';
(() => {
  const dictionaries = window.ECO_I18N;
  const languages = { en: ['English', 'EN', 'en_US'], es: ['Español', 'ES', 'es_ES'], uk: ['Українська', 'UK', 'uk_UA'], ru: ['Русский', 'RU', 'ru_RU'] };
  function detectLanguage() {
    try {
      const saved = localStorage.getItem('ec_lang');
      if (Object.hasOwn(languages, saved)) return saved;
    } catch { /* Language switching remains available when storage is blocked. */ }
    const browser = (navigator.language || 'en').slice(0, 2).toLowerCase();
    return Object.hasOwn(languages, browser) ? browser : 'en';
  }
  let currentLanguage = detectLanguage();
  const t = key => dictionaries[currentLanguage][key] ?? dictionaries.en[key] ?? '';
  const itemKeys = { 'Диван': 't098', 'Кресло / пуф': 't099', 'Матрас': 't100', 'Мягкие стулья': 't101', 'Ковёр / ковролин': 't102', 'Салон автомобиля': 't103' };
  const itemNames = () => [...selected].map(item => t(itemKeys[item])).join(', ');
  const selected = new Set();
  const options = [...document.querySelectorAll('[data-item]')];
  const whatsappLinks = [...document.querySelectorAll('[data-whatsapp]')];
  const selectionNote = document.getElementById('selection-note');
  const buildUrl = () => 'https://wa.me/34619507938?text=' + encodeURIComponent(t('wa.base') + (selected.size ? '\n' + t('wa.items') + itemNames() + '.' : '') + '\n' + t('wa.end'));
  function update() {
    options.forEach(button => {
      const active = selected.has(button.dataset.item);
      button.setAttribute('aria-pressed', String(active));
      button.querySelector('.item-mark').setAttribute('d', active ? 'm5 12 4 4L19 6' : 'M12 5v14M5 12h14');
    });
    selectionNote.textContent = selected.size ? t('order.prefix') + itemNames() + '.' : t('t104');
    const url = buildUrl();
    whatsappLinks.forEach(link => { link.href = url; });
  }
  options.forEach(button => button.addEventListener('click', () => {
    if(selected.has(button.dataset.item)) selected.delete(button.dataset.item);
    else selected.add(button.dataset.item);
    update();
  }));
  document.querySelectorAll('[data-select]').forEach(link => link.addEventListener('click', () => {
    selected.add(link.dataset.select);
    update();
  }));
  const toggle = document.querySelector('.menu-toggle');
  const navigation = document.getElementById('navigation');
  function closeMenu({ restoreFocus = false } = {}) {
    navigation.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    toggle.setAttribute('aria-label',t('t010'));
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }
  toggle.addEventListener('click', () => {
    const open = navigation.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.setAttribute('aria-label', open ? t('menu.close') : t('t010'));
    if (open) navigation.querySelector('a').focus({ preventScroll: true });
  });
  navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!navigation.classList.contains('is-open')) return;
    closeMenu();
    document.getElementById(link.hash.slice(1))?.focus({ preventScroll: true });
  }));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !languageOptions.hidden) {
      event.preventDefault();
      closeLanguage({ restoreFocus: true });
    } else if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
      event.preventDefault();
      closeMenu({ restoreFocus: true });
    }
  });
  document.addEventListener('click', event => {
    if (navigation.classList.contains('is-open') && !navigation.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    if (!languageOptions.hidden && !languageSwitch.contains(event.target)) closeLanguage();
  });
  const mobileMenu = matchMedia('(max-width: 600px)');
  mobileMenu.addEventListener('change', () => closeMenu());
  const languageSwitch = document.querySelector('.language-switch');
  const languageTrigger = document.getElementById('language-trigger');
  const languageOptions = document.getElementById('language-options');
  const languageChoices = [...document.querySelectorAll('[data-language]')];
  function closeLanguage({ restoreFocus = false } = {}) {
    languageOptions.hidden = true;
    languageTrigger.setAttribute('aria-expanded', 'false');
    if (restoreFocus) languageTrigger.focus({ preventScroll: true });
  }
  function applyLanguage(lang, persist = false) {
    currentLanguage = Object.hasOwn(languages, lang) ? lang : 'en';
    document.documentElement.lang = currentLanguage;
    window.ecLang = currentLanguage;
    document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
    for (const attr of ['alt', 'aria-label']) {
      document.querySelectorAll('[data-i18n-' + attr + ']').forEach(element => { element.setAttribute(attr, t(element.getAttribute('data-i18n-' + attr))); });
    }
    document.title = t('meta.title');
    document.querySelector('meta[name="description"]').content = t('meta.description');
    document.querySelector('meta[property="og:title"]').content = t('meta.title');
    document.querySelector('meta[property="og:description"]').content = t('meta.description');
    document.querySelector('meta[property="og:locale"]').content = languages[currentLanguage][2];
    languageTrigger.querySelector('.language-current-name').textContent = languages[currentLanguage][0];
    languageTrigger.querySelector('.language-current-code').textContent = languages[currentLanguage][1];
    document.getElementById('language-current-flag').src = 'assets/flags/' + currentLanguage + '.svg';
    languageTrigger.setAttribute('aria-label', t('language.choose') + ': ' + languages[currentLanguage][0]);
    languageChoices.forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.language === currentLanguage)); });
    toggle.setAttribute('aria-label', navigation.classList.contains('is-open') ? t('menu.close') : t('t010'));
    update();
    if (persist) { try { localStorage.setItem('ec_lang', currentLanguage); } catch { /* Storage is optional. */ } }
    window.dispatchEvent(new CustomEvent('ec:langChanged', { detail: { lang: currentLanguage } }));
  }
  languageTrigger.addEventListener('click', () => {
    if (!languageOptions.hidden) { closeLanguage(); return; }
    closeMenu();
    languageOptions.hidden = false;
    languageTrigger.setAttribute('aria-expanded', 'true');
    languageChoices.find(button => button.dataset.language === currentLanguage).focus({ preventScroll: true });
  });
  languageChoices.forEach(button => button.addEventListener('click', () => {
    applyLanguage(button.dataset.language, true);
    closeLanguage({ restoreFocus: true });
  }));
  languageSwitch.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (languageOptions.hidden) { languageOptions.hidden = false; languageTrigger.setAttribute('aria-expanded', 'true'); }
    const current = languageChoices.indexOf(document.activeElement);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? languageChoices.length - 1 : (current + (event.key === 'ArrowUp' ? -1 : 1) + languageChoices.length) % languageChoices.length;
    languageChoices[index].focus({ preventScroll: true });
  });
  window.__applyTranslations = () => applyLanguage(currentLanguage);
  document.getElementById('year').textContent = String(new Date().getFullYear());
  applyLanguage(currentLanguage);
  document.documentElement.classList.remove('i18n-pending');
})();
