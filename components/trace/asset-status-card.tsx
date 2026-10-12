import { Text, View } from "react-native";

import { TRACE_COLORS } from "@/constants/trace";
import { getAssetValidation } from "@/lib/asset-validation";
import { TraceCard, TraceLabel } from "@/components/trace/trace-ui";

export function AssetStatusCard({ label }: { label: string }) {
  const result = getAssetValidation();
  return <TraceCard style={{ backgroundColor: TRACE_COLORS.graphite }}>
    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
      <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: TRACE_COLORS.warning }} />
      <TraceLabel>{label}</TraceLabel>
    </View>
    <Text style={{ color: TRACE_COLORS.warning, fontSize: 13, lineHeight: 19 }}>Asset pending verification</Text>
    <Text style={{ color: TRACE_COLORS.quiet, fontSize: 12, lineHeight: 17 }}>{result.message} No replacement or generated QR is used.</Text>
  </TraceCard>;
}
