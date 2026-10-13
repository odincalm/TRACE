import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TRACE_COLORS } from "@/constants/trace";
import { HapticTab } from "@/components/haptic-tab";

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: "home-outline",
  timeline: "time-outline",
  capture: "add-circle-outline",
  collections: "layers-outline",
  settings: "settings-outline",
};

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  return <Tabs screenOptions={({ route }) => ({
    headerShown: false,
    tabBarActiveTintColor: TRACE_COLORS.accent,
    tabBarInactiveTintColor: TRACE_COLORS.quiet,
    tabBarButton: HapticTab,
    tabBarStyle: { paddingTop: 8, paddingBottom: bottomPadding, height: 58 + bottomPadding, backgroundColor: TRACE_COLORS.graphite, borderTopColor: TRACE_COLORS.border, borderTopWidth: 1 },
    tabBarLabelStyle: { fontSize: 10, fontWeight: "700" },
    tabBarIcon: ({ color, size }) => <Ionicons name={icons[route.name] ?? "ellipse-outline"} color={color} size={size} />,
  })}>
    <Tabs.Screen name="index" options={{ title: "Home" }} />
    <Tabs.Screen name="timeline" options={{ title: "Timeline" }} />
    <Tabs.Screen name="capture" options={{ title: "Capture" }} />
    <Tabs.Screen name="collections" options={{ title: "Collections" }} />
    <Tabs.Screen name="settings" options={{ title: "Settings" }} />
  </Tabs>;
}
