type View = 'responses' | 'gradings';

const section = document.getElementById('explorer');
const BASE = section?.dataset.base ?? '/';

const viewSelect = document.getElementById('view-select') as HTMLSelectElement | null;
const outputSelect = document.getElementById('output-select') as HTMLSelectElement | null;
const reasoningToggle = document.getElementById('output-reasoning') as HTMLInputElement | null;
const reasoningToggleLabel = document.getElementById('reasoning-toggle');
const entityLabel = document.getElementById('entity-label');

const responsesBody = document.getElementById('responses-body');
const gradingsBody = document.getElementById('gradings-body');
const gradingStatus = document.getElementById('grading-status');
const gradingContent = document.getElementById('grading-content');

const responseArticles = Array.from(document.querySelectorAll<HTMLElement>('.output-body'));
const gradingCache = new Map<string, string>();

let currentView: View = 'responses';
let currentLetter: string = outputSelect?.value ?? '';

function showResponse(letter: string) {
  responseArticles.forEach((b) => {
    b.classList.toggle('hidden', b.dataset.letter !== letter);
    b.querySelectorAll('.expanded').forEach((el) => el.classList.remove('expanded'));
  });
}

function applyReasoning() {
  const showIt = reasoningToggle?.checked ?? false;
  responseArticles.forEach((b) => {
    b.querySelectorAll<HTMLElement>('.reasoning-block').forEach((block) => {
      block.classList.toggle('hidden', !showIt);
    });
  });
}

async function renderGrading(letter: string) {
  if (!gradingStatus || !gradingContent) return;

  if (gradingCache.has(letter)) {
    gradingContent.innerHTML = gradingCache.get(letter)!;
    gradingStatus.textContent = '';
    return;
  }

  gradingStatus.textContent = `// loading [${letter}]\u2026`;
  gradingContent.innerHTML = '';

  try {
    const res = await fetch(`${BASE}data/evaluations/${letter}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { gradingHtml } = (await res.json()) as { gradingHtml: string };
    gradingCache.set(letter, gradingHtml);
    gradingContent.innerHTML = gradingHtml;
    gradingStatus.textContent = '';
  } catch (err) {
    const retryId = `retry-grading-${letter}`;
    gradingStatus.innerHTML = `\u2717 failed to load [${letter}] \u2014 <button id="${retryId}" class="underline hover:text-term-green cursor-pointer">retry?</button>`;
    document.getElementById(retryId)?.addEventListener('click', () => renderGrading(letter));
  }
}

function applyView(view: View) {
  currentView = view;

  if (entityLabel) entityLabel.textContent = view === 'gradings' ? 'EVALUATOR' : 'MODEL';

  reasoningToggleLabel?.classList.toggle('hidden', view === 'gradings');

  responsesBody?.classList.toggle('hidden', view !== 'responses');
  gradingsBody?.classList.toggle('hidden', view !== 'gradings');

  if (view === 'responses') {
    showResponse(currentLetter);
    applyReasoning();
  } else {
    renderGrading(currentLetter);
  }
}

document.querySelectorAll<HTMLButtonElement>('.output-expand').forEach((btn) => {
  btn.addEventListener('click', () => {
    btn.parentElement?.classList.add('expanded');
  });
});

if (viewSelect) {
  viewSelect.addEventListener('change', () => {
    const next = viewSelect.value === 'gradings' ? 'gradings' : 'responses';
    applyView(next);
  });
}

if (outputSelect) {
  outputSelect.addEventListener('change', () => {
    currentLetter = outputSelect.value;
    if (currentView === 'responses') {
      showResponse(currentLetter);
    } else {
      renderGrading(currentLetter);
    }
  });
}

if (reasoningToggle) {
  reasoningToggle.addEventListener('change', applyReasoning);
}

applyView('responses');
