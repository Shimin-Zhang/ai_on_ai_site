import type { Letter } from '../../src/lib/types.js';

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
