export function canUseBiometric(platform: string, hasHardware: boolean, enrolled: boolean): boolean { return platform !== "web" && hasHardware && enrolled; }
export function shouldRelockOnBackground(enabled: boolean, appState: string): boolean { return enabled && appState !== "active"; }
export function lockStateAfterAuthentication(success: boolean, currentEnabled: boolean): { enabled: boolean; locked: boolean } { return success ? { enabled: currentEnabled, locked: false } : { enabled: currentEnabled, locked: currentEnabled }; }
