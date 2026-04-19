// src/scripts/raw-explorer.ts
const select = document.getElementById('output-select') as HTMLSelectElement | null;
const reasoningToggle = document.getElementById('output-reasoning') as HTMLInputElement | null;
const bodies = Array.from(document.querySelectorAll<HTMLElement>('.output-body'));

function show(letter: string) {
  bodies.forEach((b) => b.classList.toggle('hidden', b.dataset.letter !== letter));
}

function applyReasoning() {
  const showIt = reasoningToggle?.checked ?? false;
  bodies.forEach((b) => {
    const block = b.querySelector<HTMLElement>('.reasoning-block');
    if (block) block.classList.toggle('hidden', !showIt);
  });
}

if (select) {
  show(select.value);
  select.addEventListener('change', () => show(select.value));
}
if (reasoningToggle) {
  reasoningToggle.addEventListener('change', applyReasoning);
}
applyReasoning();
