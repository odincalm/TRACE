import { REQUIRED_ASSETS } from "@/constants/trace";

export function getAssetValidation() {
  const assets = Object.values(REQUIRED_ASSETS);
  const missing = assets.filter((asset) => asset.status !== "verified");
  return {
    passed: missing.length === 0,
    missing,
    message: missing.length === 0 ? "All required local assets are verified." : `Release blocked: ${missing.map((asset) => asset.label).join(", ")} remain placeholder assets.`,
  };
}

export function assertReleaseAssets(): void {
  const result = getAssetValidation();
  if (!result.passed) throw new Error(result.message);
}
