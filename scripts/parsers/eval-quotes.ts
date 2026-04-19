import type { Letter } from '../../src/lib/types.js';

const LETTERS: Letter[] = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'];

// Each letter has a set of candidate "marker" patterns that can mark the start
// of a per-subject review. Multiple forms are tried because every evaluator
// formats the reviews differently. All matches from all markers are scored
// together and the best one wins.
function buildMarkers(letter: Letter): RegExp[] {
  const L = letter.toUpperCase();
  const l = letter;
  return [
    // `### \`a.md\`` or `## \`a.md\``
    new RegExp(`^#{1,6}\\s*\`${l}\\.md\`\\s*$`, 'gim'),
    // `### **a.md**`, `## **a.md**`, or bare `**a.md**` on its own line
    new RegExp(`^(?:#{1,6}\\s*)?\\*\\*${l}\\.md\\*\\*\\s*$`, 'gim'),
    // `### a.md` or `## a.md` (plain heading, no quotes)
    new RegExp(`^#{1,6}\\s+${l}\\.md\\s*$`, 'gim'),
    // `## Model A Analysis`, `### Model A (\`a.md\`)`, `## Model A Review`
    new RegExp(`^#{1,6}\\s*Model\\s+${L}\\b[^\\n]*$`, 'gim'),
    // `**Model A (\`a.md\`)**` bolded line
    new RegExp(`^\\*\\*Model\\s+${L}\\s*\\(\`${l}\\.md\`\\)\\*\\*\\s*$`, 'gim'),
    // `## Conversation: \`a.md\``
    new RegExp(`^#{1,6}\\s*Conversation:\\s*\`${l}\\.md\`\\s*$`, 'gim'),
    // Markdown table row beginning with `| **a** |` (qwen-style). Match to
    // the end of the line so the whole row is available to the extractor.
    new RegExp(`^\\|\\s*\\*\\*${l}\\*\\*\\s*\\|[^\\n]*`, 'gim'),
    // In-prose letter mentions (weak)
    new RegExp(`\\bletter\\s+${l}\\b`, 'gi'),
  ];
}

// Words strongly suggestive of a review/personality blurb.
const REVIEW_SIGNAL = /\b(review|personality|outlier|reads?|feels?|sounds?|tone|style|writes?|voice|sensibility|thinker|analyst|visionary|imaginative|pragmatic|philosophical|cynical|academic|dramatic|poetic|systematic|methodical|empathetic|sycophantic|moralistic|speculative|ornamental|architect|missionary|boosterish|confident|cautious|conservative|strategist|synthesizer|futurist|humanist|realist|provocateur|earnest|bold|vivid|punchy|literary|encyclopedic|baroque|theatrical|contrarian|concise|rigorous)\b/i;

// Lines we want to skip when looking for substantive prose after a marker:
// - rubric list items ("*   **Reasoning Ability:** 10/10")
// - score list items  ("- **Reasoning**: 9")
// - table lines       ("| x | 9 | 8 |", "|---|---|")
// - horizontal rules  ("---")
// - bold-key-value fragments with only numbers ("**Total**: 27")
function isSkippableLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('|')) return true;
  if (/^-+\|?$/.test(trimmed)) return true;
  if (/^---+$/.test(trimmed)) return true;
  // score bullet: "* **Reasoning**: 8/10" or "- **Reasoning**: 8/10"
  if (/^[*\-\u2022]\s+\*?\*?(?:Reasoning|Originality|Correctness|Total|Score|Reasoning Ability|Originality of Idea|Total Score)\b/i.test(trimmed)) {
    return true;
  }
  // "**Total**: 21/30"
  if (/^\*?\*?(?:Total|Score|Reasoning|Originality|Correctness)\*?\*?\s*(?:Score)?\*?\*?\s*[:=]\s*\d/i.test(trimmed)) {
    return true;
  }
  // Single-line inline score: "Reasoning: 8 | Originality: 8 | Correctness: 8 | Total: 24/30"
  if (/\b(?:Reasoning|Originality|Correctness|Total)\b[^|]*\|\s*\*?\*?(?:Reasoning|Originality|Correctness|Total)\b/i.test(trimmed)) {
    return true;
  }
  // Fenced-code fence lines.
  if (/^```/.test(trimmed)) return true;
  return false;
}

// Strip inline markdown formatting so regex scoring can see raw prose.
function stripInline(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1');
}

// Extract a review quote from a window of text after a marker.
function extractQuoteFromWindow(rawWindow: string): string | undefined {
  const lines = rawWindow.split('\n');
  // Walk line by line, collecting paragraphs of substantive prose.
  const paragraphs: string[] = [];
  let current: string[] = [];
  let tableRowSeen = false;
  for (const line of lines) {
    if (isSkippableLine(line)) {
      if (current.length) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      if (line.trim().startsWith('|')) tableRowSeen = true;
      continue;
    }
    // Stop if we hit a new heading — that's a new section.
    if (/^#{1,6}\s/.test(line.trim())) {
      if (current.length) {
        paragraphs.push(current.join(' '));
        current = [];
      }
      break;
    }
    current.push(line.trim());
  }
  if (current.length) paragraphs.push(current.join(' '));

  // For markdown tables (like qwen's table), try to pull the review-cell
  // from the first row by splitting on pipes.
  if (tableRowSeen) {
    // Find the first table row in the raw window that actually contains prose.
    const tableLineMatch = rawWindow.match(/^\|[^\n]+$/m);
    if (tableLineMatch) {
      const cells = tableLineMatch[0].split('|').map((s) => s.trim()).filter(Boolean);
      // Pick the longest cell that isn't a score/number and has sentence-like prose.
      const proseCells = cells
        .filter((c) => c.length >= 40 && /[a-zA-Z].*[a-zA-Z]/.test(c) && !/^\d+$/.test(c))
        .sort((a, b) => b.length - a.length);
      if (proseCells[0]) paragraphs.unshift(proseCells[0]);
    }
  }

  for (const para of paragraphs) {
    const stripped = stripInline(para)
      .replace(/^\s*(?:Review|Personality(?:\s+[Rr]eview)?|Overall)\s*:\s*/i, '')
      .trim();
    // Skip anything that still looks like a score dump.
    if (/\b\d+\s*\/\s*10\b/.test(stripped) && !REVIEW_SIGNAL.test(stripped)) continue;
    const sentences = stripped.match(/[^.!?\n]+[.!?]+/g) ?? [];
    const picked: string[] = [];
    for (const s of sentences) {
      const t = s.trim();
      if (t.length < 20) continue;
      picked.push(t);
      if (picked.length >= 3) break;
    }
    if (!picked.length) continue;
    const quote = picked.slice(0, 2).join(' ').trim();
    if (quote.length >= 30) return quote;
  }
  return undefined;
}

interface Candidate {
  quote: string;
  index: number;
  score: number;
}

function collectCandidates(markdown: string, marker: RegExp): Candidate[] {
  marker.lastIndex = 0;
  const candidates: Candidate[] = [];
  let match: RegExpExecArray | null;
  const isTableMarker = marker.source.startsWith('^\\|');
  while ((match = marker.exec(markdown)) !== null) {
    // For table-row markers, prepend the matched line to the window so the
    // extractor can pull the review cell from the same row. Otherwise start
    // just after the marker so the heading itself is skipped.
    const start = match.index + match[0].length;
    const windowRaw = isTableMarker
      ? match[0] + markdown.slice(start, start + 400)
      : markdown.slice(start, start + 1600);
    const quote = extractQuoteFromWindow(windowRaw);
    if (!quote) {
      if (match[0].length === 0) marker.lastIndex++;
      continue;
    }
    let score = Math.min(quote.length, 400);
    if (REVIEW_SIGNAL.test(quote)) score += 600;
    // Penalise late-looking "conversation transcript" content that has no
    // review-signal words.
    if (!REVIEW_SIGNAL.test(quote) && match.index < markdown.length * 0.5) {
      score -= 300;
    }
    // Reviews are overwhelmingly in the bottom third of the file.
    if (match.index > markdown.length * 0.75) score += 200;
    const digits = (quote.match(/\d/g) ?? []).length;
    if (digits > 10) score -= 300;
    candidates.push({ quote, index: match.index, score });
    if (match[0].length === 0) marker.lastIndex++;
  }
  return candidates;
}

export function extractQuotesFromEvalMarkdown(
  markdown: string,
): Partial<Record<Letter, string>> {
  const out: Partial<Record<Letter, string>> = {};
  for (const letter of LETTERS) {
    const markers = buildMarkers(letter);
    const all: Candidate[] = [];
    for (const marker of markers) {
      all.push(...collectCandidates(markdown, marker));
    }
    if (!all.length) continue;
    all.sort((a, b) => b.score - a.score);
    out[letter] = all[0].quote;
  }
  return out;
}
