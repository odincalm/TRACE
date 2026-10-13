import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";
import { MemoryCard } from "@/components/trace/memory-card";
import { TraceButton, TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";
import { useMemoryStore } from "@/hooks/use-memory-store";

export default function HomeScreen() {
  const { memories, ready, error } = useMemoryStore();
  const pinnedCount = memories.filter((memory) => memory.pinned).length;
  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 18 }} showsVerticalScrollIndicator={false}>
    <TraceHeader eyebrow="Personal memory workspace" title="Keep the thread." subtitle="A calm, local-first place for notes, decisions, tasks and the small details worth returning to." />
    <View style={{ flexDirection: "row", gap: 10 }}><View style={{ flex: 1, backgroundColor: TRACE_COLORS.accentDim, borderRadius: 14, padding: 13 }}><TraceLabel style={{ color: TRACE_COLORS.accent }}>{memories.length}</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 12, marginTop: 4 }}>recent memories</Text></View><View style={{ flex: 1, backgroundColor: TRACE_COLORS.surface, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: TRACE_COLORS.border }}><TraceLabel>{pinnedCount}</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 12, marginTop: 4 }}>pinned</Text></View></View>
    {error ? <TraceCard><Text style={{ color: TRACE_COLORS.warning }}>{error}</Text></TraceCard> : null}
    {!ready ? <TraceCard><Text style={{ color: TRACE_COLORS.muted }}>Opening your local memory store…</Text></TraceCard> : memories.length ? <View style={{ gap: 10 }}>{memories.slice(0, 3).map((memory) => <MemoryCard key={memory.id} memory={memory} />)}</View> : <TraceCard><TraceLabel>RECENT MEMORIES</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 18, fontWeight: "700" }}>Nothing here yet.</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>Start with a note, a decision or a task. Your library stays on this device.</Text><Link href="/capture" asChild><TraceButton>Capture your first memory</TraceButton></Link></TraceCard>}
    <TraceCard style={{ backgroundColor: TRACE_COLORS.graphite }}><TraceLabel>LOCAL BY DESIGN</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 16, fontWeight: "700" }}>Your memories belong to this device.</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>Phase 2 stores memories locally, uses native SQLite with FTS5 where available, and keeps the web preview on a local AsyncStorage fallback.</Text></TraceCard>
  </ScrollView></TraceScreen>;
}
