const select = document.getElementById('output-select') as HTMLSelectElement | null;
const reasoningToggle = document.getElementById('output-reasoning') as HTMLInputElement | null;
const bodies = Array.from(document.querySelectorAll<HTMLElement>('.output-body'));

function show(letter: string) {
  bodies.forEach((b) => {
    b.classList.toggle('hidden', b.dataset.letter !== letter);
    // Reset expand state on every section within this body
    b.querySelectorAll('.expanded').forEach((el) => el.classList.remove('expanded'));
  });
}

function applyReasoning() {
  const showIt = reasoningToggle?.checked ?? false;
  bodies.forEach((b) => {
    b.querySelectorAll<HTMLElement>('.reasoning-block').forEach((block) => {
      block.classList.toggle('hidden', !showIt);
    });
  });
}

// Each expand button targets its immediate parent wrapper — either the .reasoning-block
// or the answer's containing div.
document.querySelectorAll<HTMLButtonElement>('.output-expand').forEach((btn) => {
  btn.addEventListener('click', () => {
    const scope = btn.parentElement;
    scope?.classList.add('expanded');
  });
});

if (select) {
  show(select.value);
  select.addEventListener('change', () => show(select.value));
}
if (reasoningToggle) {
  reasoningToggle.addEventListener('change', applyReasoning);
}
applyReasoning();
