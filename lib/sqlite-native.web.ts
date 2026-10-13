export async function openNativeDatabase(): Promise<never> {
  throw new Error("Native SQLite is unavailable in the browser; use the local AsyncStorage repository fallback.");
}
