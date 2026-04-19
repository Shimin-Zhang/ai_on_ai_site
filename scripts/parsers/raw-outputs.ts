export interface SplitOutput {
  reasoning: string | null;
  answer: string;
}

export function splitOutput(markdown: string): SplitOutput {
  const reasoningMatch = markdown.match(/^#\s*assistant\s*\(reasoning\)\s*$([\s\S]*?)(?=^#\s*assistant\s*$|(?![\s\S]))/m);
  const answerMatch = markdown.match(/^#\s*assistant\s*$([\s\S]*?)(?![\s\S])/m);
  return {
    reasoning: reasoningMatch ? reasoningMatch[1].trim() : null,
    answer: answerMatch ? answerMatch[1].trim() : markdown.trim(),
  };
}
