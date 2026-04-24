export interface Turn {
  user: string;
  reasoning: string | null;
  assistant: string;
}

export interface Transcript {
  turns: Turn[];
}

type Section = 'user' | 'reasoning' | 'assistant' | null;

export function parseTranscript(markdown: string): Transcript {
  const lines = markdown.split('\n');
  const turns: Turn[] = [];
  let current: Partial<Turn> | null = null;
  let section: Section = null;
  let buffer: string[] = [];
  let inFence = false;

  const flushSection = () => {
    if (!current || !section) return;
    const text = buffer.join('\n').trim();
    if (section === 'user') current.user = text;
    else if (section === 'reasoning') current.reasoning = text;
    else if (section === 'assistant') current.assistant = text;
    buffer = [];
  };

  const pushTurn = () => {
    if (!current || current.user === undefined) return;
    turns.push({
      user: current.user,
      reasoning: current.reasoning ?? null,
      assistant: current.assistant ?? '',
    });
    current = null;
  };

  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      buffer.push(line);
      continue;
    }

    if (!inFence) {
      const match = line.match(/^#\s*(user|assistant\s*\(reasoning\)|assistant)\s*$/);
      if (match) {
        flushSection();
        const heading = match[1].trim().toLowerCase();
        if (heading === 'user') {
          pushTurn();
          current = {};
          section = 'user';
        } else if (heading.startsWith('assistant (reasoning)')) {
          section = 'reasoning';
        } else if (heading === 'assistant') {
          section = 'assistant';
        }
        buffer = [];
        continue;
      }
    }

    buffer.push(line);
  }
  flushSection();
  pushTurn();

  return { turns };
}
