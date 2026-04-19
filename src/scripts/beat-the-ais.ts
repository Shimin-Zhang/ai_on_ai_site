// src/scripts/beat-the-ais.ts
import type { Letter, PuzzleSnippet } from '../lib/types';

type SnippetMap = Record<Letter, PuzzleSnippet[]>;

export interface PuzzleRound {
  snippet: PuzzleSnippet;
  chosen?: Letter;
  correct?: boolean;
}

export interface PuzzleState {
  rounds: PuzzleRound[];
  currentRound: number;
  score: number;
  complete: boolean;
  seed: number;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

const ALL_LETTERS: Letter[] = ['a','b','c','d','e','f','g','h','i','j','k'];

export function newPuzzle(snippets: SnippetMap, seed: number): PuzzleState {
  const rng = mulberry32(seed);
  const chosenLetters = shuffle(ALL_LETTERS, rng).slice(0, 5);
  const rounds: PuzzleRound[] = chosenLetters.map((letter) => {
    const candidates = snippets[letter];
    const idx = Math.floor(rng() * candidates.length);
    return { snippet: candidates[idx] };
  });
  return { rounds, currentRound: 0, score: 0, complete: false, seed };
}

export function submitAnswer(state: PuzzleState, chosen: Letter): PuzzleState {
  if (state.complete) return state;
  const round = state.rounds[state.currentRound];
  if (round.chosen) return state; // already answered
  const correct = chosen === round.snippet.letter;
  const newRounds = state.rounds.slice();
  newRounds[state.currentRound] = { ...round, chosen, correct };
  const isFinalRound = state.currentRound >= state.rounds.length - 1;
  return {
    ...state,
    rounds: newRounds,
    score: state.score + (correct ? 1 : 0),
    complete: state.complete || isFinalRound,
  };
}

export function advanceRound(state: PuzzleState): PuzzleState {
  if (state.currentRound >= state.rounds.length - 1) {
    return { ...state, complete: true };
  }
  return { ...state, currentRound: state.currentRound + 1 };
}
