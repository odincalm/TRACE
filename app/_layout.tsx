import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Linking, Modal, Platform, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaFrameContext, SafeAreaInsetsContext, SafeAreaProvider, initialWindowMetrics } from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { TRACE_COLORS, DEVELOPER } from "@/constants/trace";
import { useWelcomePreference } from "@/hooks/use-welcome-preference";
import { MemoryProvider } from "@/hooks/use-memory-store";
import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { ThemeProvider } from "@/lib/theme-provider";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

export const unstable_settings = { anchor: "(tabs)" };

function WelcomeGate() {
  const router = useRouter();
  const { ready, dontShowAgain, setDontShowAgain, dismiss, shouldShow } = useWelcomePreference();

  const continueToTrace = useCallback(() => dismiss(), [dismiss]);
  const openSupport = useCallback(async () => {
    dismiss();
    await Linking.openURL(DEVELOPER.website);
  }, [dismiss]);

  if (!ready || !shouldShow) return null;

  return <Modal animationType="fade" transparent visible onRequestClose={continueToTrace}>
    <View style={styles.modalBackdrop}>
      <View style={styles.welcomeCard}>
        <View style={styles.mark}><Text style={styles.markText}>T</Text></View>
        <Text style={styles.welcomeEyebrow}>A quiet place to return to</Text>
        <Text accessibilityRole="header" style={styles.welcomeTitle}>TRACE</Text>
        <Text style={styles.welcomeBody}>Capture the fragments, decisions and small signals you want to keep close — privately, locally and without the noise.</Text>
        <View style={styles.profilePlaceholder} accessibilityLabel="Developer profile photo pending verification">
          <Text style={styles.profileInitial}>N</Text>
        </View>
        <Text style={styles.credit}>{DEVELOPER.credit}</Text>
        <Text style={styles.welcomeBodySmall}>{DEVELOPER.bio}</Text>
        <Pressable onPress={openSupport} accessibilityRole="button" style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Support My Studies & Development</Text>
        </Pressable>
        <Pressable onPress={continueToTrace} accessibilityRole="button" style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
          <Text style={styles.secondaryButtonText}>Continue to TRACE</Text>
        </Pressable>
        <Pressable onPress={() => router.push("/support")} style={styles.supportLink} accessibilityRole="button">
          <Text style={styles.supportLinkText}>See how support helps →</Text>
        </Pressable>
        <View style={styles.preferenceRow}>
          <Text style={styles.preferenceText}>Don&apos;t show again</Text>
          <Switch value={dontShowAgain} onValueChange={setDontShowAgain} trackColor={{ false: TRACE_COLORS.border, true: TRACE_COLORS.accentDim }} thumbColor={dontShowAgain ? TRACE_COLORS.accent : TRACE_COLORS.muted} accessibilityLabel="Don't show welcome prompt again" />
        </View>
      </View>
    </View>
  </Modal>;
}

export default function RootLayout() {
  const initialInsets = initialWindowMetrics?.insets ?? DEFAULT_WEB_INSETS;
  const initialFrame = initialWindowMetrics?.frame ?? DEFAULT_WEB_FRAME;
  const [insets, setInsets] = useState<EdgeInsets>(initialInsets);
  const [frame, setFrame] = useState<Rect>(initialFrame);
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } }));
  const [trpcClient] = useState(() => createTRPCClient());

  useEffect(() => { initManusRuntime(); }, []);
  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => { setInsets(metrics.insets); setFrame(metrics.frame); }, []);
  useEffect(() => {
    if (Platform.OS !== "web") return;
    return subscribeSafeAreaInsets(handleSafeAreaUpdate);
  }, [handleSafeAreaUpdate]);

  const providerInitialMetrics = useMemo(() => ({
    ...(initialWindowMetrics ?? { insets: initialInsets, frame: initialFrame }),
    insets: { ...initialInsets, top: Math.max(initialInsets.top, 16), bottom: Math.max(initialInsets.bottom, 12) },
  }), [initialInsets, initialFrame]);

  const content = <GestureHandlerRootView style={{ flex: 1 }}>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="support" />
          <Stack.Screen name="about" />
          <Stack.Screen name="memory/[id]" />
          <Stack.Screen name="oauth/callback" />
        </Stack>
        <WelcomeGate />
        <StatusBar style="light" />
      </QueryClientProvider>
    </trpc.Provider>
  </GestureHandlerRootView>;

  return <ThemeProvider><SafeAreaProvider initialMetrics={providerInitialMetrics}><MemoryProvider>
    {Platform.OS === "web" ? <SafeAreaFrameContext.Provider value={frame}><SafeAreaInsetsContext.Provider value={insets}>{content}</SafeAreaInsetsContext.Provider></SafeAreaFrameContext.Provider> : content}
  </MemoryProvider></SafeAreaProvider></ThemeProvider>;
}

const styles = StyleSheet.create({
  modalBackdrop: { flex: 1, backgroundColor: "rgba(5,6,6,0.88)", padding: 20, justifyContent: "center" },
  welcomeCard: { backgroundColor: TRACE_COLORS.surface, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 28, padding: 24, maxWidth: 520, width: "100%", alignSelf: "center", gap: 13 },
  mark: { width: 40, height: 40, borderRadius: 12, backgroundColor: TRACE_COLORS.accent, alignItems: "center", justifyContent: "center" },
  markText: { fontSize: 24, fontWeight: "800", color: TRACE_COLORS.black },
  welcomeEyebrow: { color: TRACE_COLORS.accent, fontSize: 11, letterSpacing: 2, fontWeight: "700", textTransform: "uppercase" },
  welcomeTitle: { color: TRACE_COLORS.silver, fontSize: 40, fontWeight: "800", letterSpacing: 6 },
  welcomeBody: { color: TRACE_COLORS.muted, fontSize: 15, lineHeight: 22 },
  welcomeBodySmall: { color: TRACE_COLORS.muted, fontSize: 13, lineHeight: 19, textAlign: "center" },
  profilePlaceholder: { width: 72, height: 72, borderRadius: 36, borderWidth: 1, borderColor: TRACE_COLORS.accent, backgroundColor: TRACE_COLORS.graphite, alignSelf: "center", alignItems: "center", justifyContent: "center" },
  profileInitial: { color: TRACE_COLORS.accent, fontSize: 26, fontWeight: "700" },
  credit: { color: TRACE_COLORS.silver, fontSize: 14, fontWeight: "700", textAlign: "center" },
  primaryButton: { minHeight: 50, borderRadius: 15, backgroundColor: TRACE_COLORS.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  primaryButtonText: { color: TRACE_COLORS.black, fontWeight: "800", fontSize: 14 },
  secondaryButton: { minHeight: 50, borderRadius: 15, backgroundColor: TRACE_COLORS.surfaceRaised, borderColor: TRACE_COLORS.border, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  secondaryButtonText: { color: TRACE_COLORS.silver, fontWeight: "700", fontSize: 14 },
  supportLink: { paddingVertical: 5, alignItems: "center" },
  supportLinkText: { color: TRACE_COLORS.accent, fontSize: 13, fontWeight: "700" },
  preferenceRow: { borderTopColor: TRACE_COLORS.border, borderTopWidth: 1, paddingTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  preferenceText: { color: TRACE_COLORS.muted, fontSize: 13 },
  pressed: { opacity: 0.76 },
});
