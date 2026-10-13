import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { TRACE_COLORS } from "@/constants/trace";
import { useMemoryStore } from "@/hooks/use-memory-store";
import type { MemoryKind } from "@/lib/memory-model";
import { TraceButton, TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";

const kinds: MemoryKind[] = ["note", "event", "task", "decision", "voice", "attachment"];

export default function CaptureScreen() {
  const router = useRouter();
  const { saveMemory, collections, ready, error } = useMemoryStore();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<MemoryKind>("note");
  const [tags, setTags] = useState("");
  const [collectionId, setCollectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function submit() {
    if (!title.trim()) { setFormError("Give this memory a short title first."); return; }
    setSaving(true); setFormError(null);
    try { const memory = await saveMemory({ title, body, kind, tags: tags.split(","), collectionId }); router.replace((`/memory/${memory.id}`) as never); } catch (cause) { setFormError(cause instanceof Error ? cause.message : "Could not save this memory."); } finally { setSaving(false); }
  }

  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 38, gap: 18 }} keyboardShouldPersistTaps="handled"><TraceHeader eyebrow="Make a mark" title="Capture" subtitle="Save a memory locally. You can edit, pin, archive or move it to Trash later." /><TraceCard><TraceLabel>TYPE</TraceLabel><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{kinds.map((item) => <Pressable key={item} onPress={() => setKind(item)} accessibilityRole="button" style={{ backgroundColor: kind === item ? TRACE_COLORS.accentDim : TRACE_COLORS.graphite, borderColor: kind === item ? TRACE_COLORS.accent : TRACE_COLORS.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: kind === item ? TRACE_COLORS.accent : TRACE_COLORS.muted, fontSize: 12, fontWeight: "700" }}>{item}</Text></Pressable>)}</View><TextInput value={title} onChangeText={setTitle} placeholder="Title" placeholderTextColor={TRACE_COLORS.quiet} style={{ color: TRACE_COLORS.silver, backgroundColor: TRACE_COLORS.graphite, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 }} accessibilityLabel="Memory title" /><TextInput value={body} onChangeText={setBody} placeholder="What do you want to remember?" placeholderTextColor={TRACE_COLORS.quiet} multiline textAlignVertical="top" style={{ color: TRACE_COLORS.silver, backgroundColor: TRACE_COLORS.graphite, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, minHeight: 140, fontSize: 15, lineHeight: 21 }} accessibilityLabel="Memory body" /><TextInput value={tags} onChangeText={setTags} placeholder="Tags, separated by commas" placeholderTextColor={TRACE_COLORS.quiet} style={{ color: TRACE_COLORS.silver, backgroundColor: TRACE_COLORS.graphite, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14 }} accessibilityLabel="Memory tags" />{collections.length ? <><TraceLabel>COLLECTION</TraceLabel><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{collections.map((collection) => <Pressable key={collection.id} onPress={() => setCollectionId(collection.id === collectionId ? null : collection.id)} accessibilityRole="button" style={{ backgroundColor: collection.id === collectionId ? TRACE_COLORS.accentDim : TRACE_COLORS.graphite, borderColor: collection.id === collectionId ? TRACE_COLORS.accent : TRACE_COLORS.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: collection.id === collectionId ? TRACE_COLORS.accent : TRACE_COLORS.muted, fontSize: 12 }}>{collection.name}</Text></Pressable>)}</View></> : null}{formError || error ? <Text style={{ color: TRACE_COLORS.warning, fontSize: 13 }}>{formError ?? error}</Text> : null}<TraceButton disabled={!ready || saving} onPress={submit}>{saving ? "Saving…" : "Save memory locally"}</TraceButton></TraceCard></ScrollView></TraceScreen>;
}
