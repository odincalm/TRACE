import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";

import { TRACE_COLORS } from "@/constants/trace";
import { TraceButton, TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";
import { useMemoryStore } from "@/hooks/use-memory-store";
import type { Memory } from "@/lib/memory-model";

export default function MemoryEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getMemory, saveMemory, deleteMemory, updateFlags } = useMemoryStore();
  const [memory, setMemory] = useState<Memory | null>(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { if (!id) return; getMemory(id).then((result) => { setMemory(result); setTitle(result?.title ?? ""); setBody(result?.body ?? ""); }); }, [getMemory, id]);
  async function save() { if (!memory || !title.trim()) { setError("A title is required."); return; } setSaving(true); try { const saved = await saveMemory({ ...memory, title, body, tags: memory.tags }); setMemory(saved); setError(null); } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save changes."); } finally { setSaving(false); } }
  if (!memory) return <TraceScreen><Stack.Screen options={{ headerShown: false }} /><TraceCard><Text style={{ color: TRACE_COLORS.muted }}>Memory not found or still loading.</Text><TraceButton variant="secondary" onPress={() => router.back()}>Go back</TraceButton></TraceCard></TraceScreen>;
  return <TraceScreen><Stack.Screen options={{ headerShown: false }} /><ScrollView contentContainerStyle={{ paddingBottom: 38, gap: 16 }}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={{ color: TRACE_COLORS.accent, fontWeight: "700" }}>‹ Timeline</Text></Pressable><TraceHeader eyebrow={`${memory.kind} · ${memory.pinned ? "pinned" : "local"}`} title="Edit memory" subtitle="Changes save to the local database and remain available after restart." /><TraceCard><TraceLabel>TITLE</TraceLabel><TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={TRACE_COLORS.quiet} style={{ color: TRACE_COLORS.silver, backgroundColor: TRACE_COLORS.graphite, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 }} /><TraceLabel>BODY</TraceLabel><TextInput value={body} onChangeText={setBody} placeholder="Body" placeholderTextColor={TRACE_COLORS.quiet} multiline textAlignVertical="top" style={{ color: TRACE_COLORS.silver, backgroundColor: TRACE_COLORS.graphite, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, minHeight: 180, lineHeight: 21 }} />{error ? <Text style={{ color: TRACE_COLORS.warning }}>{error}</Text> : null}<TraceButton disabled={saving} onPress={save}>{saving ? "Saving…" : "Save changes"}</TraceButton><View style={{ flexDirection: "row", gap: 10 }}><TraceButton variant="secondary" onPress={() => updateFlags(memory.id, { pinned: !memory.pinned }).then(() => setMemory({ ...memory, pinned: !memory.pinned }))}>{memory.pinned ? "Unpin" : "Pin"}</TraceButton><TraceButton variant="secondary" onPress={() => updateFlags(memory.id, { archived: !memory.archived }).then(() => setMemory({ ...memory, archived: !memory.archived }))}>{memory.archived ? "Unarchive" : "Archive"}</TraceButton></View><Pressable onPress={() => deleteMemory(memory.id).then(() => router.back())} accessibilityRole="button" style={{ alignItems: "center", padding: 10 }}><Text style={{ color: TRACE_COLORS.warning, fontWeight: "700" }}>Move to Trash</Text></Pressable></TraceCard></ScrollView></TraceScreen>;
}
