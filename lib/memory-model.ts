export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type RecurrenceFrequency = "daily" | "weekly" | "monthly";
export type RecurrenceRule = { frequency: RecurrenceFrequency; interval: number; until: number | null };

export type MemoryKind = "note" | "event" | "task" | "decision" | "voice" | "attachment";
export type Attachment = { id: string; memoryId: string; name: string; mimeType: string; uri: string; size: number | null; createdAt: number };
export type Memory = { id: string; title: string; body: string; kind: MemoryKind; createdAt: number; updatedAt: number; pinned: boolean; archived: boolean; deletedAt: number | null; collectionId: string | null; tags: string[]; dueAt: number | null; eventAt: number | null; priority: TaskPriority; completed: boolean; completedAt: number | null; recurrenceRule: RecurrenceRule | null; reminderId: string | null; attachments: Attachment[] };
export type Collection = { id: string; name: string; description: string; createdAt: number; updatedAt: number };
export type Relationship = { sourceId: string; targetId: string; type: string };
export type MemoryDraft = Partial<Pick<Memory, "id" | "title" | "body" | "kind" | "pinned" | "archived" | "collectionId" | "tags" | "dueAt" | "eventAt" | "priority" | "completed" | "completedAt" | "recurrenceRule" | "reminderId">> & { title: string; body: string };
export type MemoryFilter = { query?: string; collectionId?: string | null; includeArchived?: boolean; includeTrash?: boolean; kind?: MemoryKind; pinnedOnly?: boolean; offset?: number; limit?: number };
export const PAGE_SIZE = 20;
export function createId(prefix: string): string { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`; }
export function normalizeTags(tags: string[] = []): string[] { return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))].slice(0, 24); }
export function normalizeSearchQuery(query: string): string { return query.trim().replace(/\s+/g, " "); }
