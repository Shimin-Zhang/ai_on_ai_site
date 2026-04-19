import { describe, it, expect } from 'vitest';
import { extractQuotesFromEvalMarkdown } from './eval-quotes.js';

const SAMPLE_EVAL = `# user
fully read each of the following...

## Conversation: \`a.md\`

Some setup.

### Review of letter a

The model writes with vivid sci-fi energy, prioritizes drama over rigor.

Score: 23/30.

## Conversation: \`b.md\`

### Review of letter b

Boosterish and sycophantic, name-drops xAI.
`;

describe('extractQuotesFromEvalMarkdown', () => {
  it('returns a quote per subject letter when present', () => {
    const quotes = extractQuotesFromEvalMarkdown(SAMPLE_EVAL);
    expect(quotes.a).toMatch(/vivid sci-fi/);
    expect(quotes.b).toMatch(/Boosterish/);
    expect(quotes.c).toBeUndefined();
  });

  it('returns empty object on parse failure rather than throwing', () => {
    expect(extractQuotesFromEvalMarkdown('nothing here')).toEqual({});
  });
});
