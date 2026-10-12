import { ScrollView, Text, View } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";
import { TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";

export default function CollectionsScreen() {
  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 18 }}><TraceHeader eyebrow="Context, gathered" title="Collections" subtitle="Keep related memories close: projects, tags, templates and linked entries." /><TraceCard><TraceLabel>COLLECTIONS</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 18, fontWeight: "700" }}>No collections yet.</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>A collection can be a project, a season of study or a question you are carrying.</Text></TraceCard><TraceCard style={{ backgroundColor: TRACE_COLORS.graphite }}><TraceLabel>STARTER TEMPLATES</TraceLabel><View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>{["Daily review", "Study session", "Meeting", "Decision"].map((item) => <View key={item} style={{ borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 12, paddingHorizontal: 11, paddingVertical: 9 }}><Text style={{ color: TRACE_COLORS.muted, fontSize: 12 }}>{item}</Text></View>)}</View></TraceCard></ScrollView></TraceScreen>;
}
