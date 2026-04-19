import { newPuzzle, submitAnswer, advanceRound, type PuzzleState } from './beat-the-ais.js';
import type { Letter } from '../lib/types';

const root = document.getElementById('puzzle-root') as HTMLElement | null;
const board = document.getElementById('puzzle-board') as HTMLElement | null;
if (!root || !board) throw new Error('Puzzle root missing');

const snippets = JSON.parse(root.dataset.snippets!) as Parameters<typeof newPuzzle>[0];
const choices = JSON.parse(root.dataset.choices!) as Array<{ letter: Letter; displayName: string }>;

function seedFromHash(): number {
  const hashMatch = window.location.hash.match(/puzzle=(\d+)/);
  if (hashMatch) return Number(hashMatch[1]);
  const fresh = Math.floor(Math.random() * 1_000_000_000);
  history.replaceState(null, '', `${window.location.pathname}#puzzle=${fresh}`);
  return fresh;
}

let state: PuzzleState = newPuzzle(snippets, seedFromHash());

function shuffleChoices(): typeof choices {
  return choices.slice().sort(() => Math.random() - 0.5);
}

function timesIdd(letter: Letter): number {
  // Pulled from data-attribute lookup. Hard-coded mapping inline for simplicity (data is in models.json).
  // Updated automatically since we read window-attached data; if missing falls back to '?'.
  // For v1 we duplicate the source-of-truth in a small lookup written into root attributes:
  const map = JSON.parse((document.getElementById('puzzle-root')?.dataset.identifications) ?? '{}') as Record<string, number>;
  return map[letter] ?? 0;
}

function render() {
  if (state.complete) {
    const pct = Math.round((state.score / 5) * 100);
    board.innerHTML = `
      <p class="text-term-green text-sm mb-2">// FINAL</p>
      <p class="text-2xl text-term-fg">You got <span class="text-term-yellow">${state.score}/5</span> (${pct}%).</p>
      <p class="mt-3 text-term-dim text-sm">Best AI hit 45%. Median AI hit 18%. Random guessing is ~9%.</p>
      <button id="puzzle-share" class="mt-4 border border-term-border rounded px-3 py-1 text-term-green hover:bg-term-border">Copy result</button>
      <button id="puzzle-restart" class="mt-4 ml-2 border border-term-border rounded px-3 py-1 text-term-fg hover:bg-term-border">New puzzle</button>
    `;
    document.getElementById('puzzle-share')!.addEventListener('click', () => {
      navigator.clipboard.writeText(`I got ${state.score}/5 (${pct}%) on Beat the AIs. Best AI hit 45%. ${window.location.href}`);
    });
    document.getElementById('puzzle-restart')!.addEventListener('click', () => {
      history.replaceState(null, '', window.location.pathname);
      state = newPuzzle(snippets, Math.floor(Math.random() * 1_000_000_000));
      render();
    });
    return;
  }

  const round = state.rounds[state.currentRound];
  const answered = !!round.chosen;
  const shuffled = shuffleChoices();

  board.innerHTML = `
    <p class="text-term-dim text-xs mb-2">// round ${state.currentRound + 1} of 5 — score ${state.score}</p>
    <div class="bg-term-bg border border-term-border rounded p-4 mb-4 text-sm leading-relaxed text-term-fg max-h-72 overflow-y-auto">
      ${escapeHtml(round.snippet.text)}
    </div>
    <div id="puzzle-choices" class="grid grid-cols-2 md:grid-cols-3 gap-2"></div>
    ${answered ? `
      <div class="mt-4">
        <p class="text-term-${round.correct ? 'green' : 'red'}">
          ${round.correct ? '✓ correct' : '✗ wrong'} — that was <strong>${escapeHtml(displayName(round.snippet.letter))}</strong>.
          ${timesIdd(round.snippet.letter)} of 11 AI evaluators got this right.
        </p>
        <button id="puzzle-next" class="mt-3 border border-term-border rounded px-3 py-1 text-term-green hover:bg-term-border">
          ${state.currentRound === 4 ? 'See results' : 'Next round →'}
        </button>
      </div>
    ` : ''}
  `;

  const choicesEl = document.getElementById('puzzle-choices')!;
  for (const c of shuffled) {
    const btn = document.createElement('button');
    btn.className = 'border border-term-border rounded px-2 py-2 text-left text-sm hover:bg-term-border disabled:opacity-50';
    btn.textContent = c.displayName;
    btn.disabled = answered;
    if (answered) {
      if (c.letter === round.snippet.letter) btn.classList.add('text-term-green', 'border-term-green');
      else if (c.letter === round.chosen) btn.classList.add('text-term-red', 'border-term-red');
    }
    btn.addEventListener('click', () => {
      state = submitAnswer(state, c.letter);
      render();
    });
    choicesEl.appendChild(btn);
  }

  if (answered) {
    document.getElementById('puzzle-next')!.addEventListener('click', () => {
      state = advanceRound(state);
      render();
    });
  }
}

function displayName(letter: Letter): string {
  return choices.find((c) => c.letter === letter)?.displayName ?? letter;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

render();
