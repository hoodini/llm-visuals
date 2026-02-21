import { ANTHROPIC_COSTS } from './anthropic.js';
import { OPENAI_COSTS } from './openai.js';
import { GEMINI_COSTS } from './gemini.js';
import type { ProviderSlug } from '../types/provider.js';

const COST_TABLES: Record<string, Record<string, { input: number; output: number }>> = {
  anthropic: ANTHROPIC_COSTS,
  openai: OPENAI_COSTS,
  gemini: GEMINI_COSTS,
};

function findBestMatch(
  table: Record<string, { input: number; output: number }>,
  model: string
): { input: number; output: number } | null {
  if (table[model]) return table[model];
  // Prefix match (e.g., "claude-opus-4-6-20260220" matches "claude-opus-4-6")
  for (const [key, value] of Object.entries(table)) {
    if (model.startsWith(key)) return value;
  }
  return null;
}

export function calculateCost(
  provider: ProviderSlug,
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const table = COST_TABLES[provider];
  if (!table) return 0;

  const entry = findBestMatch(table, model);
  if (!entry) return 0;

  return (
    (inputTokens / 1_000_000) * entry.input +
    (outputTokens / 1_000_000) * entry.output
  );
}
