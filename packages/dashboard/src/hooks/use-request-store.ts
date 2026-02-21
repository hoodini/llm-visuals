import { create } from 'zustand';
import type { RequestRecord, MetricsSnapshot } from '@/lib/types';

interface Filters {
  provider: string | null;
  model: string | null;
  search: string;
}

interface RequestStore {
  requests: Map<string, RequestRecord>;
  orderedIds: string[];
  streamingChunks: Map<string, string>;
  metrics: MetricsSnapshot | null;
  filters: Filters;
  selectedId: string | null;
  wsStatus: 'connecting' | 'connected' | 'disconnected';

  // Actions
  setHistory: (records: RequestRecord[]) => void;
  addRequest: (record: Partial<RequestRecord>) => void;
  updateRequest: (record: RequestRecord) => void;
  addStreamChunk: (requestId: string, text: string) => void;
  setMetrics: (metrics: MetricsSnapshot) => void;
  setFilters: (filters: Partial<Filters>) => void;
  setSelectedId: (id: string | null) => void;
  setWsStatus: (status: 'connecting' | 'connected' | 'disconnected') => void;

  // Derived
  getFilteredRequests: () => RequestRecord[];
  getSelectedRequest: () => RequestRecord | undefined;
}

export const useRequestStore = create<RequestStore>((set, get) => ({
  requests: new Map(),
  orderedIds: [],
  streamingChunks: new Map(),
  metrics: null,
  filters: { provider: null, model: null, search: '' },
  selectedId: null,
  wsStatus: 'connecting',

  setHistory: (records) =>
    set(() => {
      const requests = new Map<string, RequestRecord>();
      const orderedIds: string[] = [];
      for (const r of records) {
        requests.set(r.id, r);
        orderedIds.push(r.id);
      }
      return { requests, orderedIds };
    }),

  addRequest: (record) =>
    set((state) => {
      if (!record.id) return state;
      const requests = new Map(state.requests);
      requests.set(record.id, record as RequestRecord);
      return {
        requests,
        orderedIds: [record.id, ...state.orderedIds.filter((id) => id !== record.id)],
      };
    }),

  updateRequest: (record) =>
    set((state) => {
      const requests = new Map(state.requests);
      requests.set(record.id, record);
      // Remove from streaming chunks when complete
      const streamingChunks = new Map(state.streamingChunks);
      streamingChunks.delete(record.id);
      return { requests, streamingChunks };
    }),

  addStreamChunk: (requestId, text) =>
    set((state) => {
      const streamingChunks = new Map(state.streamingChunks);
      const existing = streamingChunks.get(requestId) || '';
      streamingChunks.set(requestId, existing + text);
      return { streamingChunks };
    }),

  setMetrics: (metrics) => set({ metrics }),
  setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
  setSelectedId: (id) => set({ selectedId: id }),
  setWsStatus: (status) => set({ wsStatus: status }),

  getFilteredRequests: () => {
    const { requests, orderedIds, filters } = get();
    return orderedIds
      .map((id) => requests.get(id)!)
      .filter((r) => {
        if (!r) return false;
        if (filters.provider && r.provider !== filters.provider) return false;
        if (filters.model && r.model !== filters.model) return false;
        if (filters.search) {
          const s = filters.search.toLowerCase();
          return (
            r.model.toLowerCase().includes(s) ||
            r.path.toLowerCase().includes(s) ||
            r.systemPrompt?.toLowerCase().includes(s) ||
            r.fullResponseText.toLowerCase().includes(s)
          );
        }
        return true;
      });
  },

  getSelectedRequest: () => {
    const { requests, selectedId } = get();
    return selectedId ? requests.get(selectedId) : undefined;
  },
}));
