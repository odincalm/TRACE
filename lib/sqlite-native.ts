import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";

export async function openNativeDatabase(): Promise<SQLiteDatabase> {
  return openDatabaseAsync("trace.db");
}
