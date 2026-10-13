import { useState } from "react";
import { Pressable, ScrollView, Text } from "react-native";
import { Stack, useRouter } from "expo-router";
import { TRACE_COLORS } from "@/constants/trace";
import { TraceButton, TraceCard, TraceHeader, TraceScreen } from "@/components/trace/trace-ui";
import { useAppLock } from "@/hooks/use-app-lock";

export default function PrivacyScreen() {
  const router = useRouter(); const { enabled, message, enable, disable } = useAppLock(); const [busy, setBusy] = useState(false); const [status, setStatus] = useState<string | null>(null);
  async function toggle() { setBusy(true); setStatus(null); const ok = enabled ? await disable() : await enable(); if (ok) setStatus(enabled ? "Biometric app lock disabled." : "Biometric app lock enabled."); setBusy(false); }
  return <TraceScreen><Stack.Screen options={{ headerShown: false }} /><ScrollView contentContainerStyle={{ paddingBottom: 38, gap: 16 }}><Pressable onPress={() => router.back()}><Text style={{ color: TRACE_COLORS.accent, fontWeight: "700" }}>‹ Settings</Text></Pressable><TraceHeader eyebrow="Privacy & security" title="App Lock" subtitle="Protect access to TRACE with the biometrics already enrolled on this device." /><TraceCard><Text style={{ color: TRACE_COLORS.silver, fontSize: 18, fontWeight: "700" }}>{enabled ? "Biometric lock is on" : "Biometric lock is off"}</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>TRACE uses the operating system biometric prompt and stores only the enabled setting in SecureStore. There is no invented PIN, reversible passcode or cloud recovery. This lock protects app access; it does not encrypt SQLite, securely delete files or replace OS device security.</Text><TraceButton disabled={busy} onPress={() => void toggle()}>{busy ? "Checking device…" : enabled ? "Disable biometric lock" : "Enable biometric lock"}</TraceButton>{message ? <Text style={{ color: TRACE_COLORS.warning, lineHeight: 20 }}>{message}</Text> : null}{status ? <Text style={{ color: TRACE_COLORS.accent }}>{status}</Text> : null}</TraceCard><TraceCard><Text style={{ color: TRACE_COLORS.muted, lineHeight: 20 }}>Web preview and devices without enrolled biometrics remain unlocked. If biometric authentication is cancelled, TRACE leaves the existing lock state unchanged.</Text></TraceCard></ScrollView></TraceScreen>;
}
