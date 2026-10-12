import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";

import { TraceHeader, TraceCard, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";
import { DEVELOPER, TRACE_COLORS } from "@/constants/trace";

export default function AboutScreen() {
  const router = useRouter();
  return <TraceScreen><Stack.Screen options={{ headerShown: false }} /><ScrollView contentContainerStyle={{ paddingBottom: 36, gap: 18 }}><Pressable onPress={() => router.back()} accessibilityRole="button"><Text style={{ color: TRACE_COLORS.accent, fontWeight: "700" }}>‹ Settings</Text></Pressable><TraceHeader eyebrow="Clarity over claims" title="About TRACE" subtitle="A private memory workspace being built in thoughtful phases." /><TraceCard><TraceLabel>WHAT IS SHIPPED NOW</TraceLabel><Text style={{ color: TRACE_COLORS.muted, lineHeight: 21 }}>Phase 1 includes the app shell, welcome/support flow, local preference boundary, support destinations and honest asset validation. The memory engine, full local search, reminders, attachments, backup/restore and security controls are not yet shipped.</Text></TraceCard><TraceCard><TraceLabel>PRIVACY NOTE</TraceLabel><Text style={{ color: TRACE_COLORS.muted, lineHeight: 21 }}>TRACE does not add analytics, advertising, AI or a mandatory account. External support and social links open outside the app. This Phase 1 shell does not claim database encryption, payment verification or automatic refunds.</Text></TraceCard><TraceCard><TraceLabel>LEGAL & CREDIT</TraceLabel><Text style={{ color: TRACE_COLORS.muted, lineHeight: 21 }}>{DEVELOPER.credit}{"\n"}{DEVELOPER.copyright}{"\n\n"}Later phases will add complete privacy policy, terms, third-party notices and changelog pages that match the shipped behavior.</Text></TraceCard></ScrollView></TraceScreen>;
}
