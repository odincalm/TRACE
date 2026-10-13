import { Pressable, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { TRACE_COLORS } from "@/constants/trace";
import type { Memory } from "@/lib/memory-model";
import { useMemoryStore } from "@/hooks/use-memory-store";
import { TraceCard, TraceLabel } from "@/components/trace/trace-ui";

export function MemoryCard({ memory, trash = false }: { memory: Memory; trash?: boolean }) {
  const router = useRouter();
  const { updateFlags, deleteMemory, undoDelete } = useMemoryStore();
  return <TraceCard style={{ gap: 9 }}>
    <Pressable onPress={() => router.push((`/memory/${memory.id}`) as never)} accessibilityRole="button" accessibilityLabel={`Edit memory ${memory.title}`}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}><View style={{ flex: 1, gap: 5 }}><TraceLabel>{memory.kind.toUpperCase()} {memory.pinned ? "· PINNED" : ""}</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 17, fontWeight: "700" }}>{memory.title}</Text></View><Text style={{ color: TRACE_COLORS.quiet, fontSize: 12 }}>{new Date(memory.updatedAt).toLocaleDateString()}</Text></View>
      {memory.body ? <Text numberOfLines={3} style={{ color: TRACE_COLORS.muted, lineHeight: 20, marginTop: 7 }}>{memory.body}</Text> : null}
      {memory.tags.length ? <Text style={{ color: TRACE_COLORS.accent, fontSize: 12, marginTop: 8 }}>{memory.tags.map((tag) => `#${tag}`).join("  ")}</Text> : null}
    </Pressable>
    <View style={{ flexDirection: "row", gap: 8, borderTopColor: TRACE_COLORS.border, borderTopWidth: 1, paddingTop: 9 }}>
      {trash ? <Pressable onPress={() => undoDelete(memory.id)} accessibilityRole="button" style={{ paddingVertical: 5 }}><Text style={{ color: TRACE_COLORS.accent, fontSize: 12, fontWeight: "700" }}>Undo delete</Text></Pressable> : <><Pressable onPress={() => updateFlags(memory.id, { pinned: !memory.pinned })} accessibilityRole="button" style={{ paddingVertical: 5 }}><Text style={{ color: TRACE_COLORS.accent, fontSize: 12, fontWeight: "700" }}>{memory.pinned ? "Unpin" : "Pin"}</Text></Pressable><Pressable onPress={() => updateFlags(memory.id, { archived: !memory.archived })} accessibilityRole="button" style={{ paddingVertical: 5 }}><Text style={{ color: TRACE_COLORS.muted, fontSize: 12, fontWeight: "700" }}>{memory.archived ? "Unarchive" : "Archive"}</Text></Pressable><Pressable onPress={() => deleteMemory(memory.id)} accessibilityRole="button" style={{ paddingVertical: 5 }}><Text style={{ color: TRACE_COLORS.warning, fontSize: 12, fontWeight: "700" }}>Trash</Text></Pressable></>}
    </View>
  </TraceCard>;
}
