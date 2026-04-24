import { describe, test, expect } from 'vitest';
import { parseTranscript } from './raw-outputs.js';

describe('parseTranscript', () => {
  test('three-turn happy path with no fences', () => {
    const md = [
      '# user', 'q1', '# assistant', 'a1',
      '# user', 'q2', '# assistant', 'a2',
      '# user', 'q3', '# assistant', 'a3', '',
    ].join('\n');
    const { turns } = parseTranscript(md);
    expect(turns.length).toBe(3);
    expect(turns[0]).toEqual({ user: 'q1', reasoning: null, assistant: 'a1' });
    expect(turns[1]).toEqual({ user: 'q2', reasoning: null, assistant: 'a2' });
    expect(turns[2]).toEqual({ user: 'q3', reasoning: null, assistant: 'a3' });
  });

  test('reasoning block is captured separately from assistant', () => {
    const md = [
      '# user', 'q1',
      '# assistant (reasoning)', 'thinking...',
      '# assistant', 'answer', '',
    ].join('\n');
    const { turns } = parseTranscript(md);
    expect(turns.length).toBe(1);
    expect(turns[0]).toEqual({ user: 'q1', reasoning: 'thinking...', assistant: 'answer' });
  });

  test('headings inside fenced code blocks are treated as content, not turn boundaries', () => {
    const md = [
      '# user',
      'outer prompt with embedded fence:',
      '```',
      '# user',
      'inner-user',
      '# assistant',
      'inner-assistant',
      '```',
      'back outside the fence',
      '# assistant',
      'outer response',
      '',
    ].join('\n');
    const { turns } = parseTranscript(md);
    expect(turns.length).toBe(1);
    expect(turns[0].user).toContain('outer prompt');
    expect(turns[0].user).toContain('# user');
    expect(turns[0].user).toContain('inner-user');
    expect(turns[0].user).toContain('inner-assistant');
    expect(turns[0].user).toContain('back outside the fence');
    expect(turns[0].assistant).toBe('outer response');
    expect(turns[0].reasoning).toBeNull();
  });

  test('eval-file shape: single turn, multiple embedded fenced conversations', () => {
    const md = [
      '# user',
      'grade the following conversations:',
      '## Conversation: `a.md`',
      '```',
      '# user', 'prompt-a', '# assistant', 'response-a',
      '```',
      '## Conversation: `b.md`',
      '```',
      '# user', 'prompt-b', '# assistant', 'response-b',
      '```',
      '# assistant',
      'Grading output:',
      '- a: 7/10',
      '- b: 8/10',
      '',
    ].join('\n');
    const { turns } = parseTranscript(md);
    expect(turns.length).toBe(1);
    expect(turns[0].assistant).toContain('Grading output:');
    expect(turns[0].assistant).toContain('a: 7/10');
    expect(turns[0].user).toContain('Conversation: `a.md`');
    expect(turns[0].user).toContain('Conversation: `b.md`');
    expect(turns[0].user).toContain('prompt-a');
    expect(turns[0].user).toContain('response-b');
  });
});
