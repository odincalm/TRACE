import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";
import { TraceButton, TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";

export default function HomeScreen() {
  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 18 }} showsVerticalScrollIndicator={false}>
    <TraceHeader eyebrow="Personal memory workspace" title="Keep the thread." subtitle="A calm, local-first place for notes, decisions, tasks and the small details worth returning to." />
    <View style={{ flexDirection: "row", gap: 10 }}>
      <View style={{ flex: 1, backgroundColor: TRACE_COLORS.accentDim, borderRadius: 14, padding: 13 }}><TraceLabel style={{ color: TRACE_COLORS.accent }}>0</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 12, marginTop: 4 }}>memories</Text></View>
      <View style={{ flex: 1, backgroundColor: TRACE_COLORS.surface, borderRadius: 14, padding: 13, borderWidth: 1, borderColor: TRACE_COLORS.border }}><TraceLabel>OFFLINE</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 12, marginTop: 4 }}>by default</Text></View>
    </View>
    <TraceCard><TraceLabel>RECENT MEMORIES</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 18, fontWeight: "700" }}>Nothing here yet.</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>Start with a note, a decision or a task. Your library stays on this device.</Text><Link href="/capture" asChild><TraceButton>Capture your first memory</TraceButton></Link></TraceCard>
    <TraceCard style={{ backgroundColor: TRACE_COLORS.graphite }}><TraceLabel>UP NEXT</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 16, fontWeight: "700" }}>Your future is still unwritten.</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>Timeline, search and reminders will grow here in the next phases.</Text></TraceCard>
  </ScrollView></TraceScreen>;
}
