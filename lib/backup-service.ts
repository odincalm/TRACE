import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { memoryRepository } from "@/lib/memory-repository";
import { createBackup, previewBackup, validateBackup, type BackupDocument, type RestoreMode } from "@/lib/backup";

const MAX_BACKUP_BYTES = 25 * 1024 * 1024;

export async function exportTraceBackup(): Promise<{ uri: string; summary: string }> {
  if (Platform.OS === "web") throw new Error("Backup export needs an iOS or Android build so TRACE can write a local file through the system share surface.");
  const data = await memoryRepository.exportData(); const document = await createBackup(data, "1.0.0", 3); const uri = `${FileSystem.cacheDirectory}trace-backup-${Date.now()}.json`; const encoded = JSON.stringify(document);
  await FileSystem.writeAsStringAsync(uri, encoded, { encoding: FileSystem.EncodingType.UTF8 }); const info = await FileSystem.getInfoAsync(uri); if (!info.exists || (info.size ?? 0) !== encoded.length) throw new Error("TRACE could not verify the exported backup file.");
  if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType: "application/json", dialogTitle: "Export TRACE backup" });
  return { uri, summary: `${previewBackup(document)} Backup written locally and verified.` };
}

export async function pickAndValidateBackup(): Promise<{ document: BackupDocument; summary: string }> {
  const result = await DocumentPicker.getDocumentAsync({ type: "application/json", copyToCacheDirectory: true }); if (result.canceled) throw new Error("Restore cancelled."); const asset = result.assets[0]; if (!asset?.uri) throw new Error("The selected backup has no readable file URI."); if (asset.size && asset.size > MAX_BACKUP_BYTES) throw new Error("This backup exceeds TRACE's 25 MB safety limit.");
  const raw = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.UTF8 }); if (raw.length > MAX_BACKUP_BYTES) throw new Error("This backup exceeds TRACE's 25 MB safety limit."); let parsed: unknown; try { parsed = JSON.parse(raw); } catch { throw new Error("The selected file is not valid JSON."); }
  const errors = await validateBackup(parsed as BackupDocument); if (errors.length) throw new Error(errors.join(" ")); return { document: parsed as BackupDocument, summary: previewBackup(parsed as BackupDocument) };
}

export async function restoreTraceBackup(document: BackupDocument, mode: RestoreMode): Promise<string> { const result = await memoryRepository.restoreData(document.data, mode); return `Restored ${result.memories} memories, ${result.collections} collections, ${result.attachments} attachment references and ${result.relationships} relationships. ${result.remindersCleared ? `${result.remindersCleared} reminder IDs were cleared so restore cannot flood notifications.` : "No reminders were rescheduled."}`; }
