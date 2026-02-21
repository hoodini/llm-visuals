export type ProviderSlug = 'anthropic' | 'openai' | 'gemini';

export interface ProviderConfig {
  slug: ProviderSlug;
  displayName: string;
  upstream: string;
  color: string;
}

export const PROVIDERS: Record<ProviderSlug, ProviderConfig> = {
  anthropic: {
    slug: 'anthropic',
    displayName: 'Anthropic',
    upstream: 'https://api.anthropic.com',
    color: '#F97316',
  },
  openai: {
    slug: 'openai',
    displayName: 'OpenAI',
    upstream: 'https://api.openai.com',
    color: '#22C55E',
  },
  gemini: {
    slug: 'gemini',
    displayName: 'Google Gemini',
    upstream: 'https://generativelanguage.googleapis.com',
    color: '#3B82F6',
  },
};
