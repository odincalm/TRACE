import { createId } from "./memory-model";

type P3Priority = "low" | "normal" | "high" | "urgent";
type P3Frequency = "daily" | "weekly" | "monthly";
type P3Rule = { frequency: P3Frequency; interval: number; until: number | null };
type MemoryLike = { id: string; kind: string; dueAt: number | null; completed: boolean; completedAt: number | null; recurrenceRule: P3Rule | null; createdAt: number; updatedAt: number; deletedAt: number | null };

export function normalizePriority(value: unknown): P3Priority { return value === "low" || value === "high" || value === "urgent" ? value : "normal"; }
export function parseRecurrence(value: unknown): P3Rule | null { if (!value || typeof value !== "object") return null; const rule = value as Partial<P3Rule>; if (rule.frequency !== "daily" && rule.frequency !== "weekly" && rule.frequency !== "monthly") return null; return { frequency: rule.frequency, interval: Math.max(1, Number(rule.interval) || 1), until: rule.until ? Number(rule.until) : null }; }
export function nextOccurrence(at: number, rule: P3Rule): number { const date = new Date(at); if (rule.frequency === "daily") date.setDate(date.getDate() + rule.interval); if (rule.frequency === "weekly") date.setDate(date.getDate() + rule.interval * 7); if (rule.frequency === "monthly") date.setMonth(date.getMonth() + rule.interval); return date.getTime(); }
export function completeTask<T extends MemoryLike>(memory: T, now = Date.now()): T { if (memory.kind !== "task") return memory; return { ...memory, completed: true, completedAt: now, updatedAt: now }; }
export function reopenTask<T extends MemoryLike>(memory: T, now = Date.now()): T { if (memory.kind !== "task") return memory; return { ...memory, completed: false, completedAt: null, updatedAt: now }; }
export function recurringTask<T extends MemoryLike>(memory: T, now = Date.now()): T | null { if (memory.kind !== "task" || !memory.completed || !memory.recurrenceRule || !memory.dueAt) return null; const nextDue = nextOccurrence(memory.dueAt, memory.recurrenceRule); if (memory.recurrenceRule.until && nextDue > memory.recurrenceRule.until) return null; return { ...memory, id: createId("memory"), dueAt: nextDue, completed: false, completedAt: null, createdAt: now, updatedAt: now, deletedAt: null }; }
export function reminderIsDue(dueAt: number | null, now = Date.now()): boolean { return Boolean(dueAt && dueAt <= now); }
