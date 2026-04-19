import type { Letter, ScoreMatrix, GuessMatrix, Guess, Findings } from '../../src/lib/types.js';

export interface LeaderboardEntry {
  letter: Letter;
  rank: number;
  avgScore: number;
  reasoning: number;
  originality: number;
  correctness: number;
}

export function parseLeaderboard(markdown: string): Record<Letter, LeaderboardEntry> {
  const sectionMatch = markdown.match(/## 1\. Model Score Rankings[\s\S]*?(?=^### |\n## )/m);
  if (!sectionMatch) throw new Error('Leaderboard section not found');
  const section = sectionMatch[0];

  const rowRegex = /^\|\s*(\d+)\s*\|\s*([^\s|][^|]*?)\s*\|\s*([a-k])\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|\s*([\d.]+)\s*\|/gm;
  const result: Partial<Record<Letter, LeaderboardEntry>> = {};
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(section)) !== null) {
    const letter = match[3] as Letter;
    result[letter] = {
      letter,
      rank: Number(match[1]),
      avgScore: Number(match[4]),
      reasoning: Number(match[5]),
      originality: Number(match[6]),
      correctness: Number(match[7]),
    };
  }
  if (Object.keys(result).length !== 11) {
    throw new Error(`Leaderboard parser: expected 11 rows, got ${Object.keys(result).length}`);
  }
  return result as Record<Letter, LeaderboardEntry>;
}

export function parseScoreMatrix(markdown: string, evaluatorOrder: readonly Letter[]): ScoreMatrix {
  if (evaluatorOrder.length !== 11) throw new Error('evaluatorOrder must have 11 letters');
  const sectionMatch = markdown.match(/### Score Distribution by Evaluator[\s\S]*?(?=^---|^## )/m);
  if (!sectionMatch) throw new Error('Score distribution section not found');

  const result: Partial<Record<Letter, Record<Letter, number>>> = {};
  for (const letter of evaluatorOrder) result[letter] = {} as Record<Letter, number>;

  // Match rows: | **model-name (X)** | n | n | ... |
  const rowRegex = /^\|\s*\*\*[^|]*\(([a-k])\)\*\*\s*\|((?:\s*\d+\s*\|){11})/gm;
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(sectionMatch[0])) !== null) {
    const subject = match[1] as Letter;
    const cells = match[2].split('|').map((s) => s.trim()).filter(Boolean).map(Number);
    if (cells.length !== 11) throw new Error(`Row for subject ${subject} has ${cells.length} cells, expected 11`);
    for (let i = 0; i < 11; i++) {
      const evaluator = evaluatorOrder[i];
      result[evaluator]![subject] = cells[i];
    }
  }
  return result as ScoreMatrix;
}

export function parseGuessMatrix(
  markdown: string,
  evaluatorOrder: readonly Letter[],
  subjectOrder: readonly Letter[],
): GuessMatrix {
  const sectionMatch = markdown.match(/### Full Guess Matrix[\s\S]*?(?=^---|^## )/m);
  if (!sectionMatch) throw new Error('Guess matrix section not found');

  const result: Partial<Record<Letter, Record<Letter, Guess>>> = {};
  for (const letter of evaluatorOrder) result[letter] = {} as Record<Letter, Guess>;

  const dataRowRegex = /^\|\s*([^|]+?)\s*\|((?:[^|\n]*\|){11})/gm;
  // Skip the header row by tracking which evaluator we're on.
  let evaluatorIdx = 0;
  let match: RegExpExecArray | null;
  while ((match = dataRowRegex.exec(sectionMatch[0])) !== null) {
    const firstCell = match[1].trim();
    if (firstCell.toLowerCase() === 'evaluator' || firstCell.startsWith('---')) continue;
    if (evaluatorIdx >= evaluatorOrder.length) break;
    const evaluator = evaluatorOrder[evaluatorIdx];
    const cellTexts = match[2].split('|').slice(0, 11).map((s) => s.trim());
    for (let i = 0; i < 11; i++) {
      const subject = subjectOrder[i];
      const raw = cellTexts[i];
      const correct = raw.startsWith('**') && raw.endsWith('**');
      const text = correct ? raw.slice(2, -2).trim() : raw;
      result[evaluator]![subject] = { text, correct };
    }
    evaluatorIdx++;
  }
  return result as GuessMatrix;
}

export interface EvaluatorAccuracyRow {
  slug: string;
  correctIds: number;
  accuracyPct: number;
  sharpnessRank: number;
}

export function parseEvaluatorAccuracy(markdown: string): EvaluatorAccuracyRow[] {
  const sectionMatch = markdown.match(/### Identification Accuracy \(as evaluator\)[\s\S]*?(?=^### |^## |\n---|(?![\s\S]))/m);
  if (!sectionMatch) throw new Error('Evaluator accuracy section not found');
  const rowRegex = /^\|\s*(\d+)\s*\|\s*([^\s|]+\/[^\s|]+)\s*\|\s*(\d+)\s*\|\s*(\d+)%\s*\|/gm;
  const out: EvaluatorAccuracyRow[] = [];
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(sectionMatch[0])) !== null) {
    out.push({
      sharpnessRank: Number(match[1]),
      slug: match[2],
      correctIds: Number(match[3]),
      accuracyPct: Number(match[4]),
    });
  }
  return out;
}

export function parseFindings(markdown: string): Findings {
  const sectionMatch = markdown.match(/## 3\. Verdict[\s\S]*?(?=^## 4\.|\n---|(?![\s\S]))/m);
  if (!sectionMatch) throw new Error('Verdict section not found');
  const section = sectionMatch[0];
  const subsections = section
    .split(/^### .+$/m)
    .slice(1) // first chunk is the heading line
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    verdict: subsections,
    keyFindings: [], // populated separately if needed
  };
}

export interface ReflectionEntry {
  selfScore: number;
  peerAverage: number;
  selfDescription: string;
  peerSummary: string;
}

export function parseModelReflections(markdown: string): Record<Letter, ReflectionEntry> {
  const sectionMatch = markdown.match(/## 4\. Model Reflections[\s\S]*?(?=^### Reflection Summary)/m);
  if (!sectionMatch) throw new Error('Reflections section not found');
  const blocks = sectionMatch[0].split(/^### [^\n]*\(letter ([a-k])\)/gm);
  // blocks[0] is preamble; then [letter, body, letter, body, ...]
  const out: Partial<Record<Letter, ReflectionEntry>> = {};
  for (let i = 1; i < blocks.length; i += 2) {
    const letter = blocks[i] as Letter;
    const body = blocks[i + 1] ?? '';
    const scoreMatch = body.match(/\*\*Self-score:\*\*\s*(\d+)\/30\s*\|\s*\*\*Peer average:\*\*\s*([\d.]+)\/30/);
    const selfDescMatch = body.match(/\*\*Self-description:\*\*\s*\n>\s*"([^"]+)"/);
    const peerMatch = body.match(/\*\*How peers see it:\*\*\s*\n([\s\S]+?)(?=\n\n\*\*Gap:|\n---)/);
    out[letter] = {
      selfScore: scoreMatch ? Number(scoreMatch[1]) : 0,
      peerAverage: scoreMatch ? Number(scoreMatch[2]) : 0,
      selfDescription: selfDescMatch ? selfDescMatch[1].trim() : '',
      peerSummary: peerMatch ? peerMatch[1].trim() : '',
    };
  }
  return out as Record<Letter, ReflectionEntry>;
}
