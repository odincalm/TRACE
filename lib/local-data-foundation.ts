/**
 * Phase 1 boundary for the future local memory engine.
 *
 * The fixed Expo starter does not ship Room (Android-only). The later native data
 * phase should add a tested SQLite/Room-compatible repository behind this interface,
 * with migrations, FTS5 indexing and transactional writes. Keeping this boundary
 * explicit prevents Phase 1 from pretending that memory persistence already exists.
 */
export type LocalRecordKind = "note" | "event" | "task" | "decision" | "voice" | "attachment";

export type LocalRecord = {
  id: string;
  kind: LocalRecordKind;
  title: string;
  body: string;
  createdAt: number;
  updatedAt: number;
};

export interface LocalRecordRepository {
  listRecent(): Promise<LocalRecord[]>;
  create(record: LocalRecord): Promise<void>;
}
