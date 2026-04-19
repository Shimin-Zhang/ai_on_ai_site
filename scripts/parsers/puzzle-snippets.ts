// scripts/parsers/puzzle-snippets.ts
import type { Letter, PuzzleSnippet } from '../../src/lib/types.js';

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getAssistantBody(markdown: string): string {
  // Match `# assistant` (without "(reasoning)") through end-of-file or next `# user` / `# assistant (reasoning)`.
  // Note: we don't stop at arbitrary `# ` lines because the assistant response body often contains
  // its own level-1 markdown headings (see results/g.md, h.md, j.md, k.md).
  const match = markdown.match(/^#\s*assistant\s*$\n([\s\S]+?)(?=^#\s*user\s*$|^#\s*assistant\s*\(reasoning\)|(?![\s\S]))/m);
  if (!match) throw new Error('No # assistant section found');
  return match[1].trim();
}

function normalizeForSplit(body: string): string {
  // Convert markdown prose + bullet lists into a flat stream of sentence-like units.
  // Skip headings and horizontal rules; strip bullet markers; terminate lines that don't
  // already end in punctuation. Preserves inline formatting (bold, italic).
  return body
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (/^#{1,6}\s/.test(trimmed)) return ''; // headings
      if (/^-{3,}$/.test(trimmed)) return '';    // hr rules
      const stripped = trimmed.replace(/^\s*[-*+]\s+/, '').replace(/^\s*\d+\.\s+/, '');
      if (!stripped) return '';
      return /[.!?]$/.test(stripped) ? stripped : stripped + '.';
    })
    .filter(Boolean)
    .join(' ');
}

function splitSentences(text: string): string[] {
  const normalized = normalizeForSplit(text);
  const sentences = normalized.match(/[^.!?\n]+[.!?]+(?:\s|$)/g) ?? [];
  return sentences.map((s) => s.trim()).filter((s) => s.split(/\s+/).length >= 3);
}

export function sampleSnippets(letter: Letter, markdown: string, seed: number): PuzzleSnippet[] {
  const body = getAssistantBody(markdown);
  const sentences = splitSentences(body);
  const totalWords = sentences.reduce((acc, s) => acc + s.split(/\s+/).length, 0);
  if (totalWords < 500) throw new Error(`Body for letter ${letter} is too short (${totalWords} words)`);

  const wordOffsets: number[] = [0];
  for (const s of sentences) wordOffsets.push(wordOffsets[wordOffsets.length - 1] + s.split(/\s+/).length);

  const rng = mulberry32(seed);
  const out: PuzzleSnippet[] = [];
  let attempts = 0;
  const usedStarts = new Set<number>();

  while (out.length < 3 && attempts < 100) {
    attempts++;
    const startSentenceIdx = Math.floor(rng() * (sentences.length - 5)) + 1; // skip first sentence
    if (usedStarts.has(startSentenceIdx)) continue;
    let endIdx = startSentenceIdx;
    while (endIdx < sentences.length && wordOffsets[endIdx] - wordOffsets[startSentenceIdx] < 250) endIdx++;
    const wordCount = wordOffsets[endIdx] - wordOffsets[startSentenceIdx];
    if (wordCount < 200 || wordCount > 400) continue;
    usedStarts.add(startSentenceIdx);
    const text = sentences.slice(startSentenceIdx, endIdx).join(' ').trim();
    out.push({ letter, text, wordCount, startOffset: wordOffsets[startSentenceIdx] });
  }

  if (out.length < 3) throw new Error(`Could not sample 3 snippets for letter ${letter} after ${attempts} attempts`);
  return out;
}
