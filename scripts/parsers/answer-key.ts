import type { Letter } from '../../src/lib/types.js';

export interface AnswerKeyEntry {
  slug: string;
  provider: string;
  displayName: string;
}

const LETTERS: Letter[] = ['a','b','c','d','e','f','g','h','i','j','k'];

function toDisplayName(slug: string): string {
  const after = slug.split('/')[1] ?? slug;
  return after
    .split('-')
    .map((segment) => {
      // capitalize words; preserve number parts
      if (/^\d/.test(segment)) return segment;
      if (segment === 'glm' || segment === 'gpt') return segment.toUpperCase();
      return segment.charAt(0).toUpperCase() + segment.slice(1);
    })
    .join(' ');
}

export function parseAnswerKey(markdown: string): Record<Letter, AnswerKeyEntry> {
  const rowRegex = /^\|\s*([a-k])\s*\|\s*([^\s|]+\/[^\s|]+)\s*\|/gm;
  const entries: Partial<Record<Letter, AnswerKeyEntry>> = {};
  let match: RegExpExecArray | null;
  while ((match = rowRegex.exec(markdown)) !== null) {
    const letter = match[1] as Letter;
    const slug = match[2];
    entries[letter] = {
      slug,
      provider: slug.split('/')[0],
      displayName: toDisplayName(slug),
    };
  }
  if (Object.keys(entries).length !== 11) {
    throw new Error(`Answer key parser: expected 11 entries, got ${Object.keys(entries).length}`);
  }
  for (const letter of LETTERS) {
    if (!entries[letter]) throw new Error(`Answer key parser: missing letter ${letter}`);
  }
  return entries as Record<Letter, AnswerKeyEntry>;
}
