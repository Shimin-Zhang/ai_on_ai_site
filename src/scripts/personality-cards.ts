// src/scripts/personality-cards.ts
function setExpanded(card: HTMLElement, expanded: boolean) {
  const detail = card.querySelector<HTMLElement>('.card-detail');
  if (!detail) return;
  detail.classList.toggle('hidden', !expanded);
  card.classList.toggle('border-term-green', expanded);
}

const cards = document.querySelectorAll<HTMLElement>('article.card');
cards.forEach((card) => {
  card.addEventListener('click', () => {
    const isOpen = !card.querySelector<HTMLElement>('.card-detail')?.classList.contains('hidden');
    setExpanded(card, !isOpen);
    const letter = card.dataset.letter;
    if (letter && !isOpen) history.replaceState(null, '', `#card-${letter}`);
  });
});

// Open card from URL hash on load
const hash = window.location.hash;
if (hash.startsWith('#card-')) {
  const target = document.querySelector<HTMLElement>(hash);
  if (target?.classList.contains('card')) {
    setExpanded(target, true);
    target.scrollIntoView({ behavior: 'instant', block: 'start' });
  }
}
