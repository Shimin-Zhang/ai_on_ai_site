import { describe, it, expect } from 'vitest';
import { parseAnswerKey } from './answer-key.js';

describe('parseAnswerKey', () => {
  it('parses the full table from the source markdown', () => {
    const md = `# Answer Key

| Letter | Model |
|--------|-------|
| a | z-ai/glm-5.1 |
| b | x-ai/grok-4.20 |
| c | deepseek/deepseek-v3.2 |
| d | qwen/qwen3-max-thinking |
| e | google/gemini-3.1-pro-preview |
| f | google/gemini-2.5-flash |
| g | openai/gpt-5.4 |
| h | minimax/minimax-m2.7 |
| i | moonshotai/kimi-k2.5 |
| j | anthropic/claude-opus-4.7 |
| k | anthropic/claude-opus-4.6 |
`;
    const result = parseAnswerKey(md);
    expect(result.a).toEqual({ slug: 'z-ai/glm-5.1', provider: 'z-ai', displayName: 'GLM 5.1' });
    expect(result.j).toEqual({ slug: 'anthropic/claude-opus-4.7', provider: 'anthropic', displayName: 'Claude Opus 4.7' });
    expect(Object.keys(result)).toHaveLength(11);
  });

  it('throws when a letter is missing', () => {
    const md = `| Letter | Model |\n|--|--|\n| a | foo/bar |`;
    expect(() => parseAnswerKey(md)).toThrow(/expected 11 entries, got 1/);
  });
});
