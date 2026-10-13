import * as SecureStore from "expo-secure-store";
import * as LocalAuthentication from "expo-local-authentication";
import { AppState, Platform } from "react-native";
import { useCallback, useEffect, useState } from "react";
import { canUseBiometric, shouldRelockOnBackground } from "@/lib/app-lock-policy";

const LOCK_KEY = "trace.appLock.biometric.v1";

export function useAppLock() {
  const [enabled, setEnabled] = useState(false); const [locked, setLocked] = useState(false); const [ready, setReady] = useState(false); const [message, setMessage] = useState<string | null>(null);
  const authenticate = useCallback(async () => { if (Platform.OS === "web") return false; const result = await LocalAuthentication.authenticateAsync({ promptMessage: "Unlock TRACE", cancelLabel: "Not now", disableDeviceFallback: false }); if (result.success) { setLocked(false); setMessage(null); return true; } setMessage(result.error === "user_cancel" ? "Unlock cancelled." : "TRACE could not verify this device."); return false; }, []);
  useEffect(() => { let active = true; SecureStore.getItemAsync(LOCK_KEY).then((value) => { if (!active) return; const next = value === "enabled"; setEnabled(next); setLocked(next); setReady(true); }).catch(() => setReady(true)); const subscription = AppState.addEventListener("change", (state) => { if (shouldRelockOnBackground(enabled, state)) setLocked(true); if (state === "active" && enabled) void authenticate(); }); return () => { active = false; subscription.remove(); }; }, [authenticate, enabled]);
  const enable = useCallback(async () => { if (Platform.OS === "web") { setMessage("Biometric app lock is unavailable in web preview."); return false; } const hasHardware = await LocalAuthentication.hasHardwareAsync(); const enrolled = await LocalAuthentication.isEnrolledAsync(); if (!canUseBiometric(Platform.OS, hasHardware, enrolled)) { setMessage("This device has no enrolled biometric authentication. TRACE does not invent a PIN fallback."); return false; } if (!(await authenticate())) return false; await SecureStore.setItemAsync(LOCK_KEY, "enabled"); setEnabled(true); return true; }, [authenticate]);
  const disable = useCallback(async () => { if (!(await authenticate())) return false; await SecureStore.deleteItemAsync(LOCK_KEY); setEnabled(false); setLocked(false); return true; }, [authenticate]);
  return { enabled, locked: ready && locked, ready, message, enable, disable, unlock: authenticate };
}
