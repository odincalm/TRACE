import { Ionicons } from "@expo/vector-icons";
import { PropsWithChildren } from "react";
import { Pressable, PressableProps, StyleSheet, Text, TextProps, View, ViewProps } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";

export function TraceScreen({ children, ...props }: PropsWithChildren<ViewProps>) {
  return <View {...props} style={[styles.screen, props.style]}>{children}</View>;
}

export function TraceHeader({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return <View style={styles.header}>
    {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
  </View>;
}

export function TraceCard({ children, ...props }: PropsWithChildren<ViewProps>) {
  return <View {...props} style={[styles.card, props.style]}>{children}</View>;
}

export function TraceLabel({ children, ...props }: PropsWithChildren<TextProps>) {
  return <Text {...props} style={[styles.label, props.style]}>{children}</Text>;
}

export function TraceButton({ variant = "primary", children, ...props }: PressableProps & { variant?: "primary" | "secondary" | "ghost"; children: React.ReactNode }) {
  const label = props.accessibilityLabel ?? (typeof children === "string" ? children : undefined);
  return <Pressable {...props} accessible accessibilityLabel={label} accessibilityRole="button" style={({ pressed }) => [styles.button, styles[`button_${variant}`], pressed && styles.pressed, props.style as object]}>
    <Text style={[styles.buttonText, variant === "primary" ? styles.buttonTextPrimary : styles.buttonTextSecondary]}>{children}</Text>
  </Pressable>;
}

export function TraceIcon({ name, color = TRACE_COLORS.accent, size = 20 }: { name: keyof typeof Ionicons.glyphMap; color?: string; size?: number }) {
  return <Ionicons name={name} color={color} size={size} accessible={false} accessibilityElementsHidden />;
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: TRACE_COLORS.black, paddingHorizontal: 20, paddingTop: 18 },
  header: { gap: 7, marginBottom: 22 },
  eyebrow: { color: TRACE_COLORS.accent, fontSize: 11, fontWeight: "700", letterSpacing: 2.2, textTransform: "uppercase" },
  title: { color: TRACE_COLORS.silver, fontSize: 32, fontWeight: "700", letterSpacing: -0.8 },
  subtitle: { color: TRACE_COLORS.muted, fontSize: 15, lineHeight: 22, maxWidth: 440 },
  card: { backgroundColor: TRACE_COLORS.surface, borderColor: TRACE_COLORS.border, borderWidth: 1, borderRadius: 20, padding: 17, gap: 10 },
  label: { color: TRACE_COLORS.muted, fontSize: 13, lineHeight: 19 },
  button: { minHeight: 50, borderRadius: 15, paddingHorizontal: 18, alignItems: "center", justifyContent: "center" },
  button_primary: { backgroundColor: TRACE_COLORS.accent },
  button_secondary: { backgroundColor: TRACE_COLORS.surfaceRaised, borderColor: TRACE_COLORS.border, borderWidth: 1 },
  button_ghost: { backgroundColor: "transparent" },
  buttonText: { fontSize: 15, fontWeight: "700" },
  buttonTextPrimary: { color: TRACE_COLORS.black },
  buttonTextSecondary: { color: TRACE_COLORS.silver },
  pressed: { opacity: 0.78 },
});
