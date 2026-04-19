// src/scripts/beat-the-ais.test.ts
import { describe, it, expect } from 'vitest';
import { newPuzzle, submitAnswer, advanceRound, type PuzzleState } from './beat-the-ais.js';

const sampleSnippets = {
  a: [{ letter: 'a' as const, text: 'glm sample', wordCount: 200, startOffset: 0 }],
  b: [{ letter: 'b' as const, text: 'grok sample', wordCount: 200, startOffset: 0 }],
  c: [{ letter: 'c' as const, text: 'ds sample', wordCount: 200, startOffset: 0 }],
  d: [{ letter: 'd' as const, text: 'qwen sample', wordCount: 200, startOffset: 0 }],
  e: [{ letter: 'e' as const, text: 'gpro sample', wordCount: 200, startOffset: 0 }],
  f: [{ letter: 'f' as const, text: 'gflash sample', wordCount: 200, startOffset: 0 }],
  g: [{ letter: 'g' as const, text: 'gpt sample', wordCount: 200, startOffset: 0 }],
  h: [{ letter: 'h' as const, text: 'mm sample', wordCount: 200, startOffset: 0 }],
  i: [{ letter: 'i' as const, text: 'kimi sample', wordCount: 200, startOffset: 0 }],
  j: [{ letter: 'j' as const, text: 'op47 sample', wordCount: 200, startOffset: 0 }],
  k: [{ letter: 'k' as const, text: 'op46 sample', wordCount: 200, startOffset: 0 }],
};

describe('beat-the-ais state machine', () => {
  it('initializes with 5 distinct rounds and round 0 active', () => {
    const state = newPuzzle(sampleSnippets, 12345);
    expect(state.rounds).toHaveLength(5);
    const letters = new Set(state.rounds.map((r) => r.snippet.letter));
    expect(letters.size).toBe(5);
    expect(state.currentRound).toBe(0);
    expect(state.score).toBe(0);
  });

  it('scores correctly when answer matches snippet letter', () => {
    let state = newPuzzle(sampleSnippets, 1);
    const targetLetter = state.rounds[0].snippet.letter;
    state = submitAnswer(state, targetLetter);
    expect(state.rounds[0].chosen).toBe(targetLetter);
    expect(state.rounds[0].correct).toBe(true);
    expect(state.score).toBe(1);
  });

  it('does not increment score on wrong answer', () => {
    let state = newPuzzle(sampleSnippets, 2);
    const target = state.rounds[0].snippet.letter;
    const wrong = (target === 'a' ? 'b' : 'a') as 'a' | 'b';
    state = submitAnswer(state, wrong);
    expect(state.rounds[0].correct).toBe(false);
    expect(state.score).toBe(0);
  });

  it('advances rounds and marks complete after round 5', () => {
    let state = newPuzzle(sampleSnippets, 3);
    for (let i = 0; i < 5; i++) {
      state = submitAnswer(state, state.rounds[i].snippet.letter);
      if (i < 4) state = advanceRound(state);
    }
    expect(state.score).toBe(5);
    expect(state.complete).toBe(true);
  });
});
