import { describe, it, expect } from 'vitest';
import { parseLeaderboard, parseScoreMatrix, parseGuessMatrix } from './benchmark.js';
import { parseEvaluatorAccuracy, parseFindings } from './benchmark.js';

const SAMPLE_ACCURACY = `### Identification Accuracy (as evaluator)

How many of the 11 letter-to-model mappings each evaluator got correct (matching provider/family).

| Rank | Evaluator | Correct | Accuracy |
|------|-----------|---------|----------|
| 1 | anthropic/claude-opus-4.7 | 5 | 45% |
| 2 | openai/gpt-5.4 | 3 | 27% |
| 10 | google/gemini-2.5-flash | 0 | 0% |
`;

describe('parseEvaluatorAccuracy', () => {
  it('extracts ranked evaluators with correct counts', () => {
    const result = parseEvaluatorAccuracy(SAMPLE_ACCURACY);
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ slug: 'anthropic/claude-opus-4.7', correctIds: 5, accuracyPct: 45, sharpnessRank: 1 });
    expect(result[2]).toMatchObject({ slug: 'google/gemini-2.5-flash', correctIds: 0, sharpnessRank: 10 });
  });
});

const SAMPLE_VERDICT = `## 3. Verdict

### On the benchmark task (analysis quality)

**Claude Opus 4.7 and 4.6 dominated**, finishing first and second.

**GPT-5.4 took a clear third place**.

### On model identification

Model identification was **extremely difficult**.

### Bottom line

The benchmark reveals a clear three-tier structure.

---
`;

describe('parseFindings', () => {
  it('returns verdict subsections as separate entries', () => {
    const result = parseFindings(SAMPLE_VERDICT);
    expect(result.verdict.length).toBeGreaterThanOrEqual(3);
    expect(result.verdict[0]).toContain('Claude Opus 4.7 and 4.6 dominated');
  });
});

const SAMPLE_LEADERBOARD = `## 1. Model Score Rankings

Scores averaged across all 11 evaluators (including blind self-evaluation).

| Rank | Model | Letter | Avg Score (/30) | Reasoning | Originality | Correctness |
|------|-------|--------|-----------------|-----------|-------------|-------------|
| 1 | anthropic/claude-opus-4.7 | j | 27.6 | 9.6 | 9.0 | 9.0 |
| 2 | anthropic/claude-opus-4.6 | k | 27.0 | 9.4 | 8.7 | 8.9 |
| 3 | openai/gpt-5.4 | g | 26.5 | 9.2 | 8.2 | 9.1 |
| 4 | moonshotai/kimi-k2.5 | i | 25.3 | 8.6 | 9.3 | 7.4 |
| 5 | deepseek/deepseek-v3.2 | c | 24.7 | 8.5 | 8.4 | 7.8 |
| 6 | minimax/minimax-m2.7 | h | 23.9 | 8.4 | 7.2 | 8.4 |
| 7 | qwen/qwen3-max-thinking | d | 23.5 | 8.1 | 8.1 | 7.5 |
| 8 | z-ai/glm-5.1 | a | 23.5 | 8.1 | 8.5 | 6.9 |
| 9 | x-ai/grok-4.20 | b | 23.3 | 8.2 | 8.4 | 6.9 |
| 10 | google/gemini-2.5-flash | f | 23.0 | 8.4 | 7.1 | 7.5 |
| 11 | google/gemini-3.1-pro-preview | e | 21.9 | 7.4 | 8.1 | 6.5 |

### Score Distribution
`;

describe('parseLeaderboard', () => {
  it('extracts rank, scores, and pivots by letter', () => {
    const result = parseLeaderboard(SAMPLE_LEADERBOARD);
    expect(result.j).toMatchObject({
      letter: 'j', rank: 1, avgScore: 27.6, reasoning: 9.6, originality: 9.0, correctness: 9.0,
    });
    expect(result.e).toMatchObject({ rank: 11, avgScore: 21.9 });
  });
});

const SAMPLE_MATRIX = `### Score Distribution by Evaluator

Each cell is the total score (/30) the evaluator (column) gave to the model (row).

| Model (letter) | Opus 4.6 | Opus 4.7 | DeepSeek | Gem Flash | Gem Pro | MiniMax | Kimi | GPT-5.4 | Qwen3 | Grok | GLM |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **claude-opus-4.7 (j)** | 29 | 27 | 27 | 29 | 28 | 25 | 26 | 27 | 29 | 28 | 29 |
| **claude-opus-4.6 (k)** | 28 | 25 | 27 | 29 | 28 | 26 | 26 | 28 | 26 | 27 | 27 |
| **gemini-3.1-pro (e)** | 20 | 17 | 23 | 29 | 22 | 21 | 24 | 20 | 20 | 23 | 22 |

---

## 2. Model Identification Guesses
`;

describe('parseScoreMatrix', () => {
  it('extracts an 11×11 matrix keyed by [evaluatorLetter][subjectLetter]', () => {
    const headerOrder = ['k','j','c','f','e','h','i','g','d','b','a'] as const;
    const result = parseScoreMatrix(SAMPLE_MATRIX, headerOrder);
    expect(result.k.j).toBe(29);
    expect(result.b.j).toBe(28);
    expect(result.f.e).toBe(29);
  });
});

const SAMPLE_GUESSES = `### Full Guess Matrix

Each cell shows what the evaluator (row) guessed for that letter (column). Correct guesses in **bold**.

| Evaluator | a (GLM) | b (Grok) | c (DeepSeek) | d (Qwen) | e (Gem Pro) | f (Gem Flash) | g (GPT-5.4) | h (MiniMax) | i (Kimi) | j (Opus 4.7) | k (Opus 4.6) |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Opus 4.6 | GPT-4o | **Grok** | DeepSeek | Gemini | DeepSeek | Gem Flash | Claude | GPT-4o | o1/o3 | o3 | **Claude** |
| Opus 4.7 | DeepSeek | **Grok** | GPT-4o | Llama | DeepSeek | **Gemini** | **GPT-5** | Claude | GPT-4.5 | **Claude** | **Claude** |

---
`;

describe('parseGuessMatrix', () => {
  it('extracts guesses with correct flags', () => {
    const evaluatorOrder = ['k','j'] as const; // Opus 4.6 then Opus 4.7
    const subjectOrder = ['a','b','c','d','e','f','g','h','i','j','k'] as const;
    const result = parseGuessMatrix(SAMPLE_GUESSES, evaluatorOrder, subjectOrder);
    expect(result.k.b).toEqual({ text: 'Grok', correct: true });
    expect(result.k.a).toEqual({ text: 'GPT-4o', correct: false });
    expect(result.j.f).toEqual({ text: 'Gemini', correct: true });
  });
});
