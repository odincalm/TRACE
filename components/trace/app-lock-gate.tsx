import { Modal, Pressable, Text, View } from "react-native";
import { TRACE_COLORS } from "@/constants/trace";
import { useAppLock } from "@/hooks/use-app-lock";

export function AppLockGate({ children }: { children: React.ReactNode }) {
  const { locked, ready, message, unlock } = useAppLock();
  return <>{children}<Modal visible={ready && locked} transparent animationType="fade" onRequestClose={() => void unlock()}><View style={{ flex: 1, backgroundColor: "rgba(5,6,6,0.96)", alignItems: "center", justifyContent: "center", padding: 24 }}><View style={{ width: "100%", maxWidth: 420, backgroundColor: TRACE_COLORS.surface, borderWidth: 1, borderColor: TRACE_COLORS.border, borderRadius: 24, padding: 22, gap: 14 }}><Text style={{ color: TRACE_COLORS.accent, fontSize: 11, fontWeight: "800", letterSpacing: 2 }}>PRIVATE SPACE</Text><Text accessibilityRole="header" style={{ color: TRACE_COLORS.silver, fontSize: 28, fontWeight: "800" }}>Unlock TRACE</Text><Text style={{ color: TRACE_COLORS.muted, lineHeight: 21 }}>Your local library is behind the device biometric prompt. This protects access to TRACE; it does not encrypt the SQLite database.</Text>{message ? <Text style={{ color: TRACE_COLORS.warning }}>{message}</Text> : null}<Pressable onPress={() => void unlock()} style={{ minHeight: 50, borderRadius: 15, backgroundColor: TRACE_COLORS.accent, alignItems: "center", justifyContent: "center" }}><Text style={{ color: TRACE_COLORS.black, fontWeight: "800" }}>Unlock with biometrics</Text></Pressable></View></View></Modal></>;
}
