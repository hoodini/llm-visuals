'use client';

import { useState, useCallback } from 'react';

export function useCopyToClipboard(timeout = 2000) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), timeout);
  }, [timeout]);

  return { copiedId, copy };
}
