// scripts/build-data.ts
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import type {
  Letter, Model, ScoreMatrix, GuessMatrix, EvalQuotes, Findings, PuzzleSnippets, Evaluator,
} from '../src/lib/types.js';
import { parseAnswerKey } from './parsers/answer-key.js';
import {
  parseLeaderboard, parseScoreMatrix, parseGuessMatrix,
  parseEvaluatorAccuracy, parseFindings, parseModelReflections,
} from './parsers/benchmark.js';
import { extractQuotesFromEvalMarkdown } from './parsers/eval-quotes.js';
import { sampleSnippets } from './parsers/puzzle-snippets.js';
import { splitOutput } from './parsers/raw-outputs.js';

const ROOT = process.cwd();
const EVAL_DIR = join(ROOT, 'eval');
const RESULTS_DIR = join(ROOT, 'results');
const OUT_DIR = join(ROOT, 'src', 'data');
const OUTPUTS_DIR = join(OUT_DIR, 'outputs');

function write(name: string, data: unknown) {
  writeFileSync(join(OUT_DIR, name), JSON.stringify(data, null, 2));
}

function slugToFile(slug: string): string {
  return slug.replace('/', '__') + '.md';
}

function main() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
  if (!existsSync(OUTPUTS_DIR)) mkdirSync(OUTPUTS_DIR, { recursive: true });

  const answerKey = parseAnswerKey(readFileSync(join(EVAL_DIR, 'answer_key.md'), 'utf-8'));
  const benchmark = readFileSync(join(EVAL_DIR, 'benchmark_results.md'), 'utf-8');
  const leaderboard = parseLeaderboard(benchmark);
  const reflections = parseModelReflections(benchmark);
  const accuracyRows = parseEvaluatorAccuracy(benchmark);
  const findings = parseFindings(benchmark);

  // Header order for matrices is the same in both source tables; derive from the matrix headers.
  // Source order: Opus 4.6, Opus 4.7, DeepSeek, Gem Flash, Gem Pro, MiniMax, Kimi, GPT-5.4, Qwen3, Grok, GLM
  const evaluatorOrder: readonly Letter[] = ['k','j','c','f','e','h','i','g','d','b','a'];
  const subjectOrder: readonly Letter[] = ['a','b','c','d','e','f','g','h','i','j','k'];
  const scores: ScoreMatrix = parseScoreMatrix(benchmark, evaluatorOrder);
  const guesses: GuessMatrix = parseGuessMatrix(benchmark, evaluatorOrder, subjectOrder);

  // Build models.json by joining all sources keyed by letter.
  const models: Model[] = (subjectOrder).map((letter) => {
    const ak = answerKey[letter];
    const lb = leaderboard[letter];
    const rf = reflections[letter];
    const recognized = recognitionFor(ak.slug);
    return {
      letter,
      slug: ak.slug,
      provider: ak.provider,
      displayName: ak.displayName,
      rank: lb.rank,
      avgScore: lb.avgScore,
      reasoning: lb.reasoning,
      originality: lb.originality,
      correctness: lb.correctness,
      selfScore: rf.selfScore,
      peerAverage: rf.peerAverage,
      gap: Math.round((rf.selfScore - rf.peerAverage) * 10) / 10,
      selfDescription: rf.selfDescription,
      peerSummary: rf.peerSummary,
      signatureQuotes: [], // optional — leave empty for now; can backfill
      recognizedSelf: recognized,
      timesCorrectlyIdentified: 0, // populated below
    };
  });

  // Backfill timesCorrectlyIdentified by counting guesses[evaluator][subject].correct
  for (const model of models) {
    let count = 0;
    for (const ev of evaluatorOrder) {
      if (guesses[ev]?.[model.letter]?.correct) count++;
    }
    model.timesCorrectlyIdentified = count;
  }

  const evaluators: Evaluator[] = accuracyRows.map((row) => {
    const letterEntry = Object.entries(answerKey).find(([, v]) => v.slug === row.slug);
    if (!letterEntry) throw new Error(`No letter for evaluator slug ${row.slug}`);
    const [letter, ak] = letterEntry as [Letter, typeof answerKey['a']];
    const evRow = scores[letter];
    const values = Object.values(evRow);
    return {
      letter,
      slug: row.slug,
      displayName: ak.displayName,
      correctIds: row.correctIds,
      accuracyPct: row.accuracyPct,
      scoreRange: [Math.min(...values), Math.max(...values)],
      sharpnessRank: row.sharpnessRank,
      characterization: '', // populated by hand if desired; out of scope for v1
    };
  });

  const evalQuotes: EvalQuotes = {} as EvalQuotes;
  for (const letter of evaluatorOrder) {
    const file = join(EVAL_DIR, slugToFile(answerKey[letter].slug));
    if (!existsSync(file)) {
      console.warn(`Missing eval file for ${letter}: ${file}`);
      evalQuotes[letter] = {};
      continue;
    }
    evalQuotes[letter] = extractQuotesFromEvalMarkdown(readFileSync(file, 'utf-8'));
  }

  // Raw outputs — split + copy
  const puzzleSnippets: PuzzleSnippets = {} as PuzzleSnippets;
  let snippetSeed = 42;
  for (const letter of subjectOrder) {
    const src = join(RESULTS_DIR, `${letter}.md`);
    if (!existsSync(src)) {
      console.warn(`Missing raw output for ${letter}`);
      continue;
    }
    const md = readFileSync(src, 'utf-8');
    const split = splitOutput(md);
    writeFileSync(join(OUTPUTS_DIR, `${letter}.json`), JSON.stringify(split, null, 2));
    puzzleSnippets[letter] = sampleSnippets(letter, md, snippetSeed++);
  }

  write('models.json', models);
  write('scores.json', scores);
  write('guesses.json', guesses);
  write('evaluators.json', evaluators);
  write('findings.json', findings);
  write('eval-quotes.json', evalQuotes);
  write('puzzle-snippets.json', puzzleSnippets);

  console.log('build-data: wrote 7 JSON files + 11 raw outputs');
}

function recognitionFor(slug: string): Model['recognizedSelf'] {
  // Hard-coded based on benchmark_results.md "Self-Recognition" table.
  const map: Record<string, Model['recognizedSelf']> = {
    'anthropic/claude-opus-4.6': 'yes',
    'anthropic/claude-opus-4.7': 'yes',
    'openai/gpt-5.4': 'family',
    'x-ai/grok-4.20': 'brand-leak',
    'google/gemini-2.5-flash': 'family',
    'deepseek/deepseek-v3.2': 'no',
    'google/gemini-3.1-pro-preview': 'no',
    'qwen/qwen3-max-thinking': 'no',
    'minimax/minimax-m2.7': 'no',
    'moonshotai/kimi-k2.5': 'no',
    'z-ai/glm-5.1': 'no',
  };
  return map[slug] ?? 'no';
}

main();
