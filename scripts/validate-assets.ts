import { getAssetValidation } from "../lib/asset-validation";

const result = getAssetValidation();
console.log(JSON.stringify(result, null, 2));
if (!result.passed) {
  process.exitCode = 1;
}
