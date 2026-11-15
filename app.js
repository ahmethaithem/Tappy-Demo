/* global document, window, navigator, localStorage */
import { messages } from './translations.js';
import { newDemo, purchase, redeem, addCustomer, addLocation, contrast } from './model.js';
const languages = ['en', 'ar', 'tr', 'fr', 'es'];
let locale = 'en', state = newDemo(), view = 'overview', notice = null;
const $ = id => document.getElementById(id);
const titles = { overview: 'Overview', customers: 'Customers', design: 'Card Design', locations: 'Business locations', wallet: 'Google Wallet' };
const errorMessages = { 'invalid-amount': 'Enter a positive amount up to USD 10,000, using a decimal point and at most two decimal places.', insufficient: 'Not enough demo points or rewards. Simulate more purchases first.', 'invalid-name': 'Enter a fictional alias of 1–40 characters.', 'duplicate-name': 'That fictional alias is already in this demo.', 'invalid-location': 'Use a branch name, valid coordinates, and at most ten demo locations.', 'demo-limit': 'Demo limit reached. Reset the demo to start again.' };
const t = (key, values = {}) => (messages[locale][key] ?? key).replace(/\{(\w+)\}/g, (match, name) => Object.hasOwn(values, name) ? String(values[name]) : match);
const number = value => new Intl.NumberFormat(locale).format(value);
const money = minor => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }).format(minor / 100);
function text(id, value) { $(id).textContent = value; }
function feedback(key, values = {}) { notice = { key, values }; text('feedback', t(key, values)); }
function render() {
  text('view-title', t(titles[view]));
  document.querySelectorAll('[data-panel]').forEach(el => { el.hidden = el.dataset.panel !== view; });
  document.querySelectorAll('[data-view]').forEach(el => { if (el.dataset.view === view) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current'); });
  document.querySelectorAll('[data-mode]').forEach(el => el.setAttribute('aria-pressed', String(el.dataset.mode === state.mode)));
  text('customer-count', number(state.customers.length)); text('stamp-count', `${number(state.stamps)} / ${number(9)}`); text('point-count', number(state.points));
  text('mode-description', t(state.mode === 'STAMPS' ? '9 qualifying purchases unlock a free reward on the 10th visit.' : state.mode === 'POINTS' ? 'Every purchase adds up.' : 'Run stamps and points together for eligible purchases, with rules configured for your business.'));
  text('available', t('Available demo stamp rewards: {count}', { count: number(state.rewards.length) }));
  $('stamp-redeem').disabled = !state.rewards.length; $('points-redeem').disabled = state.mode === 'STAMPS' || state.points < 100;
  $('progress').replaceChildren(...Array.from({ length: 9 }, (_, i) => { const el = document.createElement('span'); el.textContent = i < state.stamps ? '✦' : '✧'; el.className = i < state.stamps ? 'filled' : ''; el.setAttribute('aria-hidden', 'true'); return el; }));
  $('history').replaceChildren(...(state.history.length ? state.history.slice(0, 25).map(event => { const li = document.createElement('li'); li.textContent = t('Demo visit {visit} · {operation}', { visit: number(event.visit), operation: event.kind === 'purchase' ? `${t('Simulated purchase')} · ${money(event.minor)}` : t(event.kind === 'stamp' ? 'Demo stamp reward redeemed' : 'Demo points reward redeemed') }); return li; }) : [Object.assign(document.createElement('li'), { textContent: t('No simulated operations yet.') })]));
  $('customers').replaceChildren(...state.customers.map((name, i) => { const row = document.createElement('tr'), cell = document.createElement('td'), id = document.createElement('td'), isolated = document.createElement('bdi'); isolated.dir = 'auto'; isolated.textContent = name; cell.append(isolated); id.textContent = `DEMO-${String(i + 1).padStart(4, '0')}`; id.dir = 'ltr'; row.append(cell, id); return row; }));
  $('locations').replaceChildren(...state.locations.map((location, i) => { const li = document.createElement('li'), name = document.createElement('bdi'), coordinates = document.createElement('bdi'), remove = document.createElement('button'); name.dir = 'auto'; name.textContent = location.name; coordinates.dir = 'ltr'; coordinates.textContent = ` · ${location.latitude}, ${location.longitude}`; remove.type = 'button'; remove.className = 'outline'; remove.textContent = t('Remove demo branch'); remove.addEventListener('click', () => { state.locations.splice(i, 1); render(); }); li.append(name, coordinates, remove); return li; }));
  if (notice) text('feedback', t(notice.key, notice.values));
  renderCard();
}
function renderCard() {
  const background = $('card-background').value, foreground = $('card-text').value;
  const ratio = contrast(background, foreground), readable = ratio >= 4.5;
  $('design-card').style.backgroundColor = readable ? background : '#b8ff32';
  $('design-card').style.color = readable ? foreground : '#12151e';
  text('design-name', $('card-name').value || t('Your loyalty card')); text('design-reward', $('card-reward').value || t('Your reward'));
  $('design-name').dir = 'auto'; $('design-reward').dir = 'auto';
  text('contrast', t('Contrast: {ratio}:1 · {status}', { ratio: new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(ratio), status: t(readable ? 'Readable' : 'Needs adjustment') }));
}
function applyLanguage(next) {
  locale = languages.includes(next) ? next : 'en';
  document.documentElement.lang = locale; document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr'; $('language').value = locale;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  try { localStorage.setItem('tappy-demo-language', locale); } catch { /* The demo works when browser storage is blocked. */ }
  render();
}
function changeView(next) { view = Object.hasOwn(titles, next) ? next : 'overview'; render(); }
$('tabs').addEventListener('click', event => { const target = event.target.closest('[data-view]'); if (target) { changeView(target.dataset.view); window.location.hash = `playground/${view}`; } });
$('modes').addEventListener('click', event => { const target = event.target.closest('[data-mode]'); if (target && ['STAMPS', 'POINTS', 'BOTH'].includes(target.dataset.mode)) { state.mode = target.dataset.mode; render(); } });
function simulate(action) { try { action(); feedback('Simulation complete. Live accounts and balances are unchanged.'); render(); } catch (error) { feedback(errorMessages[error.message] ?? 'The simulation could not be completed. Reset the demo and try again.'); } }
$('purchase').addEventListener('click', () => simulate(() => purchase(state, $('amount').value)));
$('stamp-redeem').addEventListener('click', () => simulate(() => redeem(state, 'stamp')));
$('points-redeem').addEventListener('click', () => simulate(() => redeem(state, 'points')));
$('enrollment').addEventListener('submit', event => { event.preventDefault(); simulate(() => addCustomer(state, $('alias').value)); });
$('location-form').addEventListener('submit', event => { event.preventDefault(); simulate(() => addLocation(state, $('branch-name').value, $('latitude').value, $('longitude').value)); });
['card-name', 'card-reward', 'card-background', 'card-text'].forEach(id => $(id).addEventListener('input', renderCard));
$('language').addEventListener('change', event => applyLanguage(event.target.value));
$('reset').addEventListener('click', () => { state = newDemo(); notice = null; text('feedback', ''); $('amount').value = '10.00'; $('alias').value = 'Robin Example'; $('card-name').value = 'Sunday Club'; $('card-reward').value = 'A little thanks'; $('card-background').value = '#b8ff32'; $('card-text').value = '#12151e'; $('location-form').reset(); render(); });
window.addEventListener('hashchange', () => { if (window.location.hash.startsWith('#playground/')) changeView(window.location.hash.split('/')[1]); });
let preferred; try { preferred = localStorage.getItem('tappy-demo-language'); } catch { /* No sensitive data is stored. */ }
if (!languages.includes(preferred)) preferred = (navigator.languages ?? [navigator.language]).map(tag => tag.toLowerCase().split('-')[0]).find(tag => languages.includes(tag)) ?? 'en';
applyLanguage(preferred); if (window.location.hash.startsWith('#playground/')) changeView(window.location.hash.split('/')[1]);
