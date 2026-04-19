const select = document.getElementById('output-select') as HTMLSelectElement | null;
const reasoningToggle = document.getElementById('output-reasoning') as HTMLInputElement | null;
const bodies = Array.from(document.querySelectorAll<HTMLElement>('.output-body'));

function show(letter: string) {
  bodies.forEach((b) => {
    b.classList.toggle('hidden', b.dataset.letter !== letter);
    // Reset clamp state on switch
    b.classList.remove('expanded');
    b.querySelectorAll<HTMLElement>('.reasoning-block').forEach((r) => r.classList.remove('expanded'));
  });
}

function applyReasoning() {
  const showIt = reasoningToggle?.checked ?? false;
  bodies.forEach((b) => {
    const block = b.querySelector<HTMLElement>('.reasoning-block');
    if (block) block.classList.toggle('hidden', !showIt);
  });
}

// Expand buttons toggle the `expanded` class on the NEAREST clamp container.
// The reasoning trace has its own clamp inside `.reasoning-block`; the answer's clamp
// is a direct child of `.output-body`.
document.querySelectorAll<HTMLButtonElement>('.output-expand').forEach((btn) => {
  btn.addEventListener('click', () => {
    const scope = btn.closest('.reasoning-block') ?? btn.closest('.output-body');
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
