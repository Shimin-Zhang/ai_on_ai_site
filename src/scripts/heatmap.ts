// src/scripts/heatmap.ts
const tooltip = document.getElementById('heatmap-tooltip') as HTMLDivElement | null;
if (tooltip) {
  document.querySelectorAll<HTMLElement>('.heatcell').forEach((cell) => {
    cell.addEventListener('mouseenter', (event) => showTooltip(cell, event));
    cell.addEventListener('mousemove', (event) => positionTooltip(event));
    cell.addEventListener('mouseleave', () => hideTooltip());
  });
}

function showTooltip(cell: HTMLElement, event: MouseEvent) {
  if (!tooltip) return;
  const ev = cell.dataset.evaluator!;
  const sub = cell.dataset.subject!;
  const score = cell.dataset.score!;
  const quote = cell.dataset.quote;
  tooltip.innerHTML = `
    <p class="text-term-green">[${ev}] → [${sub}] = <span class="text-term-yellow">${score}/30</span></p>
    ${quote ? `<p class="mt-2 text-term-fg leading-snug">"${quote}"</p>` : '<p class="mt-2 text-term-dim">// no quote parsed</p>'}
  `;
  tooltip.classList.remove('hidden');
  positionTooltip(event);
}

function positionTooltip(event: MouseEvent) {
  if (!tooltip) return;
  const x = event.clientX + 12;
  const y = event.clientY + 12;
  tooltip.style.left = `${Math.min(x, window.innerWidth - tooltip.offsetWidth - 8)}px`;
  tooltip.style.top = `${Math.min(y, window.innerHeight - tooltip.offsetHeight - 8)}px`;
}

function hideTooltip() {
  tooltip?.classList.add('hidden');
}
