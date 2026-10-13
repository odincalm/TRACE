import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";
import type { Attachment } from "@/lib/memory-model";
export { isAttachmentReferenceUsable } from "@/lib/attachment-safety";

export type PickedAttachment = Omit<Attachment, "id" | "memoryId" | "createdAt">;


export async function pickMedia(): Promise<PickedAttachment[]> {
  if (Platform.OS === "web") return [];
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error("Photo library permission was denied. You can enable it in system settings.");
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsMultipleSelection: true, quality: 0.8, selectionLimit: 12 });
  if (result.canceled) return [];
  return result.assets.map((asset) => ({ name: asset.fileName ?? `media-${Date.now()}`, mimeType: asset.mimeType ?? "application/octet-stream", uri: asset.uri, size: asset.fileSize ?? null }));
}

export async function pickDocuments(): Promise<PickedAttachment[]> {
  const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: true, copyToCacheDirectory: true });
  if (result.canceled) return [];
  return result.assets.map((asset) => ({ name: asset.name, mimeType: asset.mimeType ?? "application/octet-stream", uri: asset.uri, size: asset.size ?? null }));
}
