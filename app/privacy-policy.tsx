import { Stack, useRouter } from "expo-router";
import { Pressable, ScrollView, Text } from "react-native";
import { TraceCard, TraceHeader, TraceLabel, TraceScreen } from "@/components/trace/trace-ui";
import { TRACE_COLORS } from "@/constants/trace";

const sections = [
  ["Last updated", "13 October 2026. This policy describes the current Phase 1–4 implementation and may change as TRACE changes."],
  ["What TRACE stores", "TRACE is an offline-first personal memory and productivity tool. Memories, tasks, events, tags, collections, relationships, reminder identifiers and attachment metadata are stored on the device through Expo SQLite on native platforms or a versioned AsyncStorage fallback in web preview."],
  ["What leaves the device", "TRACE does not add analytics, advertising, AI, cloud memory sync or a mandatory account. Nothing is silently uploaded. If you choose to open a support, social, payment, email, backup-share or external link, that action is handled by the operating system or the selected third-party service."],
  ["Backups", "A user-initiated backup is a local JSON file with a manifest and SHA-256 integrity check. It includes supported memory data and attachment metadata/local references, but not attachment file bytes because the current attachment implementation does not provide portable file copying. Sharing a backup is your choice; TRACE does not receive a copy."],
  ["Permissions", "Microphone access is requested only for voice-note recording. Notifications are requested only when scheduling local reminders. Photo/video and document access uses system pickers. Biometric authentication is requested only when enabling or using the optional app lock. TRACE does not request broad storage access, access to other apps' notifications, or unrestricted battery-optimization exemptions."],
  ["App lock and security limits", "The optional biometric app lock controls access to the TRACE UI and stores its enabled setting in SecureStore. It is not database encryption, does not promise secure deletion, and does not replace the device's own security controls. Devices without enrolled biometrics and web preview remain unlocked."],
  ["Logs and support", "TRACE's Phase 4 paths are designed not to log memory content, backup payloads, biometric secrets or local file paths. If you email feedback, the email is sent only when you choose to send it and is handled by your email provider."],
  ["Limitations", "Native SQLite behavior, notification delivery, picker behavior, biometric prompts and file-system behavior still require device validation. TRACE is not a medical device, emergency service or source of clinical guidance."],
];

export default function PrivacyPolicyScreen() { const router = useRouter(); return <TraceScreen><Stack.Screen options={{ headerShown: false }} /><ScrollView contentContainerStyle={{ paddingBottom: 38, gap: 14 }}><Pressable onPress={() => router.back()}><Text style={{ color: TRACE_COLORS.accent, fontWeight: "700" }}>‹ Settings</Text></Pressable><TraceHeader eyebrow="Clear limits" title="Privacy Policy" subtitle="A plain-language description of how the current TRACE build handles local data and permissions." />{sections.map(([label, body]) => <TraceCard key={label}><TraceLabel>{label}</TraceLabel><Text style={{ color: TRACE_COLORS.muted, lineHeight: 21 }}>{body}</Text></TraceCard>)}</ScrollView></TraceScreen>; }
