import { Link } from "expo-router";
import { ScrollView, Text, View } from "react-native";

import { TRACE_COLORS, DEVELOPER } from "@/constants/trace";
import { TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";

const rows = [
  ["Support the Developer", "Voluntary support for nursing studies and continued development", "/support"],
  ["Notifications", "Reminders and daily review preferences", null],
  ["Privacy & Security", "App lock and notification preview controls", null],
  ["Backup & Restore", "Export and restore your local library", null],
  ["Storage", "Review attachments and local usage", null],
  ["Help & Feedback", "Answers, feedback and permission explanations", null],
  ["About TRACE", "Version, changelog, legal and notices", "/about"],
] as const;

export default function SettingsScreen() {
  return <TraceScreen><ScrollView contentContainerStyle={{ paddingBottom: 32, gap: 18 }}><TraceHeader eyebrow="Make it yours" title="Settings" subtitle="TRACE is designed to be useful without an account, a network connection or a noisy setup." /><TraceCard style={{ gap: 6 }}><TraceLabel>LOCAL PREFERENCE</TraceLabel><Text style={{ color: TRACE_COLORS.silver, fontSize: 16, fontWeight: "700" }}>Welcome prompt</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>You can choose whether the developer welcome prompt appears on the next fresh launch.</Text></TraceCard><View style={{ gap: 8 }}>{rows.map(([title, detail, href]) => href ? <Link key={title} href={href} asChild><TraceCard style={{ paddingVertical: 15 }}><View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}><View style={{ flex: 1, gap: 4 }}><Text style={{ color: TRACE_COLORS.silver, fontSize: 15, fontWeight: "700" }}>{title}</Text><Text style={{ color: TRACE_COLORS.muted, fontSize: 12, lineHeight: 18 }}>{detail}</Text></View><Text style={{ color: TRACE_COLORS.accent, fontSize: 18 }}>›</Text></View></TraceCard></Link> : <TraceCard key={title} style={{ paddingVertical: 15, opacity: 0.62 }}><View style={{ gap: 4 }}><Text style={{ color: TRACE_COLORS.silver, fontSize: 15, fontWeight: "700" }}>{title}</Text><Text style={{ color: TRACE_COLORS.muted, fontSize: 12, lineHeight: 18 }}>{detail} · Later phase</Text></View></TraceCard>)}</View><Text style={{ color: TRACE_COLORS.quiet, fontSize: 12, lineHeight: 18, marginTop: 6 }}>{DEVELOPER.credit} · {DEVELOPER.copyright}</Text></ScrollView></TraceScreen>;
}
