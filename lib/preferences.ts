import AsyncStorage from "@react-native-async-storage/async-storage";

const WELCOME_PREFERENCE_KEY = "trace.welcome.dontShowAgain";

export async function readWelcomePreference(): Promise<boolean> {
  return (await AsyncStorage.getItem(WELCOME_PREFERENCE_KEY)) === "true";
}

export async function writeWelcomePreference(value: boolean): Promise<void> {
  await AsyncStorage.setItem(WELCOME_PREFERENCE_KEY, value ? "true" : "false");
}

export const preferenceKeys = { welcomeDontShowAgain: WELCOME_PREFERENCE_KEY } as const;
