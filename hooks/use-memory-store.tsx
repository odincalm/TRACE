import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { memoryRepository } from "@/lib/memory-repository";
import { PAGE_SIZE, type Collection, type Memory, type MemoryDraft, type MemoryFilter } from "@/lib/memory-model";

type MemoryContextValue = {
  ready: boolean;
  error: string | null;
  memories: Memory[];
  collections: Collection[];
  refresh: (filter?: MemoryFilter) => Promise<void>;
  getMemory: (id: string) => Promise<Memory | null>;
  saveMemory: (draft: MemoryDraft) => Promise<Memory>;
  deleteMemory: (id: string) => Promise<void>;
  undoDelete: (id: string) => Promise<void>;
  updateFlags: (id: string, flags: { pinned?: boolean; archived?: boolean }) => Promise<void>;
  saveCollection: (name: string, description?: string) => Promise<Collection>;
};

const MemoryContext = createContext<MemoryContextValue | null>(null);

export function MemoryProvider({ children }: PropsWithChildren) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  const refresh = useCallback(async (filter: MemoryFilter = {}) => {
    try { setError(null); const [nextMemories, nextCollections] = await Promise.all([memoryRepository.listMemories({ limit: PAGE_SIZE, ...filter }), memoryRepository.listCollections()]); setMemories(nextMemories); setCollections(nextCollections); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load local memories."); }
  }, []);

  useEffect(() => { memoryRepository.initialize().then(() => refresh()).then(() => setReady(true)).catch((cause) => { setError(cause instanceof Error ? cause.message : "Could not initialize local memory storage."); setReady(true); }); }, [refresh]);

  const runAndRefresh = useCallback(async (work: () => Promise<void>) => { await work(); await refresh(); }, [refresh]);
  const value = useMemo<MemoryContextValue>(() => ({ ready, error, memories, collections, refresh, getMemory: (id) => memoryRepository.getMemory(id), saveMemory: async (draft) => { const result = await memoryRepository.saveMemory(draft); await refresh(); return result; }, deleteMemory: (id) => runAndRefresh(() => memoryRepository.deleteMemory(id)), undoDelete: (id) => runAndRefresh(() => memoryRepository.undoDelete(id)), updateFlags: (id, flags) => runAndRefresh(() => memoryRepository.updateFlags(id, flags)), saveCollection: async (name, description) => { const result = await memoryRepository.saveCollection(name, description); await refresh(); return result; } }), [collections, error, memories, ready, refresh, runAndRefresh]);
  return <MemoryContext.Provider value={value}>{children}</MemoryContext.Provider>;
}

export function useMemoryStore(): MemoryContextValue {
  const value = useContext(MemoryContext);
  if (!value) throw new Error("useMemoryStore must be used inside MemoryProvider");
  return value;
}
