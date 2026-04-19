export interface Turn {
  user: string;
  reasoning: string | null;
  assistant: string;
}

export interface Transcript {
  turns: Turn[];
}

export function parseTranscript(markdown: string): Transcript {
  const headingRegex = /^#\s*(user|assistant\s*\(reasoning\)|assistant)\s*$/gm;
  const matches = [...markdown.matchAll(headingRegex)];
  const turns: Turn[] = [];
  let current: Partial<Turn> = {};

  const flush = () => {
    if (current.user !== undefined) {
      turns.push({
        user: current.user,
        reasoning: current.reasoning ?? null,
        assistant: current.assistant ?? '',
      });
    }
  };

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextStart = matches[i + 1]?.index ?? markdown.length;
    const body = markdown.slice(match.index! + match[0].length, nextStart).trim();
    const heading = match[1].trim().toLowerCase();

    if (heading === 'user') {
      flush();
      current = { user: body };
    } else if (heading.startsWith('assistant (reasoning)')) {
      current.reasoning = body;
    } else if (heading === 'assistant') {
      current.assistant = body;
    }
  }
  flush();

  return { turns };
}
