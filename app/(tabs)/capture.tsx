import { ScrollView, Text, View } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";
import { TraceButton, TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";

const types = [
  ["Note", "A thought worth keeping"], ["Event", "A moment with a place in time"], ["Task", "Something you intend to do"], ["Decision", "The why behind a choice"], ["Voice", "A spoken fragment"], ["Attachment", "A file that belongs with a memory"],
] as const;

export default function CaptureScreen() {
  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 18 }}><TraceHeader eyebrow="Make a mark" title="Capture" subtitle="Choose the shape that fits. Creation and persistence arrive in the next memory-engine phase." /><View style={{ gap: 10 }}>{types.map(([title, detail]) => <TraceCard key={title} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 }}><View style={{ flex: 1, gap: 4 }}><TraceLabel>{title.toUpperCase()}</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 15, fontWeight: "700" }}>{detail}</Text></View><TraceButton variant="secondary" disabled>Later</TraceButton></TraceCard>)}</View></ScrollView></TraceScreen>;
}
