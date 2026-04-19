// scripts/parsers/puzzle-snippets.test.ts
import { describe, it, expect } from 'vitest';
import { sampleSnippets } from './puzzle-snippets.js';

const longText = '# user\nprompt body\n\n# assistant (reasoning)\n\nthinking trace here\n\n# assistant\n\n' +
  Array.from({ length: 30 }, (_, i) => `Sentence number ${i} contains thirty fully-written words about agents transforming industries through autonomous behavior, governance, and orchestration.`).join(' ');

describe('sampleSnippets', () => {
  it('returns 3 snippets in the 200–400 word range', () => {
    const result = sampleSnippets('a', longText, 12345);
    expect(result).toHaveLength(3);
    for (const s of result) {
      expect(s.wordCount).toBeGreaterThanOrEqual(200);
      expect(s.wordCount).toBeLessThanOrEqual(400);
      expect(s.text).not.toContain('thinking trace');
      expect(s.text).not.toMatch(/^\s*#\s*user/);
      expect(/[.!?]\s*$/.test(s.text)).toBe(true);
      expect(s.letter).toBe('a');
    }
  });

  it('skips when the assistant body is too short', () => {
    const tiny = '# assistant\n\nshort answer.';
    expect(() => sampleSnippets('a', tiny, 1)).toThrow(/too short/);
  });
});
