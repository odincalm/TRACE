import type { Attachment, Memory } from "@/lib/memory-model";

export type StorageData = { memories: Memory[]; attachments: Attachment[] };
export type StorageStats = { memories: number; tasks: number; events: number; attachments: number; attachmentBytes: number; databaseBytes: number };
export function calculateStorageStats(data: StorageData): StorageStats { return { memories: data.memories.length, tasks: data.memories.filter((item) => item.kind === "task").length, events: data.memories.filter((item) => item.kind === "event").length, attachments: data.attachments.length, attachmentBytes: data.attachments.reduce((total, item) => total + (item.size ?? 0), 0), databaseBytes: JSON.stringify(data).length }; }
export function findOrphanedAttachmentIds(data: StorageData): string[] { const referenced = new Set(data.memories.flatMap((memory) => memory.attachments.map((item) => item.id))); return data.attachments.filter((item) => !referenced.has(item.id)).map((item) => item.id); }
