import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";
import { MemoryCard } from "@/components/trace/memory-card";
import { TraceButton, TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";
import { useMemoryStore } from "@/hooks/use-memory-store";

export default function TimelineScreen() {
  const { memories, ready, error, refresh } = useMemoryStore();
  const [query, setQuery] = useState("");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => { void refresh({ query, pinnedOnly, includeTrash: showTrash, includeArchived: showTrash, limit: page * 20 }); }, [page, pinnedOnly, query, refresh, showTrash]);

  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 38, gap: 16 }} keyboardShouldPersistTaps="handled"><TraceHeader eyebrow={showTrash ? "Recoverable trash" : "Chronological view"} title={showTrash ? "Trash" : "Timeline"} subtitle={showTrash ? "Deleted memories remain recoverable until you choose what to do next." : "Saved memories in the order you touched them."} /><TextInput value={query} onChangeText={(value) => { setQuery(value); setPage(1); }} placeholder="Search title, body or tags" placeholderTextColor={TRACE_COLORS.quiet} style={{ color: TRACE_COLORS.silver, backgroundColor: TRACE_COLORS.surface, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 14 }} accessibilityLabel="Search memories" /><View style={{ flexDirection: "row", gap: 8 }}><Pressable onPress={() => { setPinnedOnly(!pinnedOnly); setPage(1); }} accessibilityRole="button" style={{ backgroundColor: pinnedOnly ? TRACE_COLORS.accentDim : TRACE_COLORS.surface, borderColor: pinnedOnly ? TRACE_COLORS.accent : TRACE_COLORS.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: pinnedOnly ? TRACE_COLORS.accent : TRACE_COLORS.muted, fontSize: 12, fontWeight: "700" }}>Pinned</Text></Pressable><Pressable onPress={() => { setShowTrash(!showTrash); setPinnedOnly(false); setPage(1); }} accessibilityRole="button" style={{ backgroundColor: showTrash ? TRACE_COLORS.accentDim : TRACE_COLORS.surface, borderColor: showTrash ? TRACE_COLORS.accent : TRACE_COLORS.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: showTrash ? TRACE_COLORS.accent : TRACE_COLORS.muted, fontSize: 12, fontWeight: "700" }}>{showTrash ? "Back to timeline" : "Trash"}</Text></Pressable></View>{error ? <TraceCard><Text style={{ color: TRACE_COLORS.warning }}>{error}</Text></TraceCard> : null}{!ready ? <TraceCard><Text style={{ color: TRACE_COLORS.muted }}>Loading local memories…</Text></TraceCard> : memories.length ? <View style={{ gap: 10 }}>{memories.map((memory) => <MemoryCard key={memory.id} memory={memory} trash={showTrash} />)}</View> : <TraceCard><TraceLabel>{showTrash ? "TRASH IS EMPTY" : "NO MATCHES"}</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 18, fontWeight: "700" }}>{showTrash ? "Nothing needs recovering." : query ? "Try a different search." : "Your timeline starts with one honest entry."}</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>{query ? "Search is local to this device and never leaves TRACE." : "Use Capture to save your first memory."}</Text></TraceCard>}{memories.length >= page * 20 && !showTrash ? <TraceButton variant="secondary" onPress={() => setPage((value) => value + 1)}>Load more</TraceButton> : null}</ScrollView></TraceScreen>;
}
