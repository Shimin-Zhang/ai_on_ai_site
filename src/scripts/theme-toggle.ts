// src/scripts/theme-toggle.ts
const KEY = 'aionai-theme';
const html = document.documentElement;
const stored = localStorage.getItem(KEY);
if (stored === 'light') html.setAttribute('data-theme', 'light');

const button = document.getElementById('theme-toggle') as HTMLButtonElement | null;

function syncLabel() {
  if (!button) return;
  const icon = button.querySelector<HTMLElement>('.theme-icon');
  const label = button.querySelector<HTMLElement>('.theme-label');
  const isLight = html.getAttribute('data-theme') === 'light';
  if (icon)  icon.textContent  = isLight ? '◐' : '◑';
  if (label) label.textContent = isLight ? 'light' : 'dark';
}
syncLabel();

button?.addEventListener('click', () => {
  const isLight = html.getAttribute('data-theme') === 'light';
  if (isLight) {
    html.removeAttribute('data-theme');
    localStorage.setItem(KEY, 'dark');
  } else {
    html.setAttribute('data-theme', 'light');
    localStorage.setItem(KEY, 'light');
  }
  syncLabel();
});
