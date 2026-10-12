import { ScrollView, Text, View } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";
import { TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";

export default function TimelineScreen() {
  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 18 }}><TraceHeader eyebrow="Chronological view" title="Timeline" subtitle="Browse the shape of your days once your first memories are captured." /><TraceCard><View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: TRACE_COLORS.accentDim, alignItems: "center", justifyContent: "center" }}><Text style={{ color: TRACE_COLORS.accent, fontSize: 20 }}>◎</Text></View><TraceLabel>EMPTY FOR NOW</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 18, fontWeight: "700" }}>Your timeline starts with one honest entry.</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>Filters and date browsing will stay close at hand as your library grows.</Text></TraceCard></ScrollView></TraceScreen>;
}
