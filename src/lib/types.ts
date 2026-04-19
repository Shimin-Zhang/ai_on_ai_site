export type Letter = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h' | 'i' | 'j' | 'k';

export interface Model {
  letter: Letter;
  slug: string;          // 'anthropic/claude-opus-4.7'
  provider: string;      // 'anthropic'
  displayName: string;   // 'Claude Opus 4.7'
  rank: number;
  avgScore: number;
  reasoning: number;
  originality: number;
  correctness: number;
  selfScore: number;
  peerAverage: number;
  gap: number;           // selfScore - peerAverage
  selfDescription: string;
  peerSummary: string;
  signatureQuotes: string[];
  recognizedSelf: 'yes' | 'family' | 'brand-leak' | 'no';
  timesCorrectlyIdentified: number;
  selfAwareness: {
    level: 'low' | 'medium' | 'high' | 'highest';
    note: string;
  };
}

export type ScoreMatrix = Record<Letter, Record<Letter, number>>;
// scores[evaluatorLetter][subjectLetter] = total score 0..30

export interface Guess {
  text: string;          // what the evaluator wrote (e.g., 'Grok', 'GPT-4o')
  correct: boolean;
}

export type GuessMatrix = Record<Letter, Record<Letter, Guess>>;

export interface Evaluator {
  letter: Letter;
  slug: string;
  displayName: string;
  correctIds: number;
  accuracyPct: number;
  scoreRange: [number, number];
  sharpnessRank: number;
  characterization: string;
}

export interface Findings {
  verdict: string[];        // markdown blocks for the verdict section
  keyFindings: string[];    // bullet points for key findings
}

export type EvalQuotes = Record<Letter, Partial<Record<Letter, string>>>;
// quotes[evaluatorLetter][subjectLetter] = quote text

export interface PuzzleSnippet {
  letter: Letter;
  text: string;
  wordCount: number;
  startOffset: number;
}
export type PuzzleSnippets = Record<Letter, PuzzleSnippet[]>; // 3 per model
