import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

export type ReminderResult = { ok: boolean; permission: Notifications.PermissionStatus; reminderId: string | null; message: string };

export async function requestReminderPermission(): Promise<Notifications.PermissionStatus> {
  if (Platform.OS === "web") return Notifications.PermissionStatus.DENIED;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted || current.status === Notifications.PermissionStatus.DENIED) return current.status;
  const requested = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: true } });
  return requested.status;
}

export async function scheduleReminder(title: string, body: string, dueAt: number | null): Promise<ReminderResult> {
  const permission = await requestReminderPermission();
  if (Platform.OS === "web") return { ok: false, permission, reminderId: null, message: "Reminders require an iOS or Android build; web preview cannot schedule local notifications." };
  if (permission !== Notifications.PermissionStatus.GRANTED || !dueAt || dueAt <= Date.now()) return { ok: false, permission, reminderId: null, message: permission === Notifications.PermissionStatus.GRANTED ? "Choose a future due date for the reminder." : "Notification permission was denied. You can enable it later in system settings." };
  const reminderId = await Notifications.scheduleNotificationAsync({ content: { title, body, data: { source: "trace" } }, trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: new Date(dueAt) } });
  return { ok: true, permission, reminderId, message: "Reminder scheduled on this device." };
}

export async function cancelReminder(reminderId: string | null): Promise<void> {
  if (Platform.OS !== "web" && reminderId) await Notifications.cancelScheduledNotificationAsync(reminderId);
}

export function configureReminderHandler(): void {
  if (Platform.OS !== "web") Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
}
