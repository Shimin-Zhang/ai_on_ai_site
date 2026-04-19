// src/scripts/id-matrix.ts
const tooltip = document.getElementById('id-tooltip') as HTMLDivElement | null;
if (tooltip) {
  document.querySelectorAll<HTMLElement>('.idcell').forEach((cell) => {
    cell.addEventListener('mouseenter', (event) => show(cell, event));
    cell.addEventListener('mousemove', (event) => position(event));
    cell.addEventListener('mouseleave', () => tooltip.classList.add('hidden'));
  });
}

function show(cell: HTMLElement, event: MouseEvent) {
  if (!tooltip) return;
  const correct = cell.dataset.correct === '1';
  tooltip.innerHTML = `
    <p class="text-term-green">[${cell.dataset.evaluator}] guessed for [${cell.dataset.subject}]:</p>
    <p class="mt-1 text-term-fg">"${cell.dataset.guess}"</p>
    <p class="mt-1 text-term-${correct ? 'green' : 'dim'}">${correct ? '✓ correct (matches provider/family)' : '— wrong'}</p>
  `;
  tooltip.classList.remove('hidden');
  position(event);
}

function position(event: MouseEvent) {
  if (!tooltip) return;
  const x = event.clientX + 12;
  const y = event.clientY + 12;
  tooltip.style.left = `${Math.min(x, window.innerWidth - tooltip.offsetWidth - 8)}px`;
  tooltip.style.top = `${Math.min(y, window.innerHeight - tooltip.offsetHeight - 8)}px`;
}
