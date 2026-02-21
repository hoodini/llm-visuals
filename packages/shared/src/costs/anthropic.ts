// Prices in USD per million tokens
export const ANTHROPIC_COSTS: Record<string, { input: number; output: number }> = {
  'claude-opus-4-6': { input: 5.0, output: 25.0 },
  'claude-opus-4-5': { input: 5.0, output: 25.0 },
  'claude-opus-4-1': { input: 15.0, output: 75.0 },
  'claude-opus-4': { input: 15.0, output: 75.0 },
  'claude-sonnet-4-6': { input: 3.0, output: 15.0 },
  'claude-sonnet-4-5': { input: 3.0, output: 15.0 },
  'claude-sonnet-4': { input: 3.0, output: 15.0 },
  'claude-haiku-4-5': { input: 1.0, output: 5.0 },
  'claude-haiku-3-5': { input: 0.8, output: 4.0 },
  'claude-3-haiku': { input: 0.25, output: 1.25 },
};
