import React, { useEffect, useState } from "react";
import { View, Dimensions, ActivityIndicator } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundColor: "#ffffff",
  backgroundGradientFrom: "#ffffff",
  backgroundGradientTo: "#ffffff",
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  style: { borderRadius: 16 },
};

export default function GraficaDuracion({ ledId }: { ledId: number }) {
  const [labels, setLabels] = useState<string[]>([]);
  const [duraciones, setDuraciones] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDuraciones = async () => {
      try {
        const res = await fetch(`http://192.168.100.217:3000/reportes?led_id=${ledId}`);
        const data = await res.json();
        const labelsLocal: string[] = [];
        const values: number[] = [];

        data.forEach((r: any, idx: number) => {
          labelsLocal.push(`#${idx + 1}`);
          values.push(r.duracion_segundos || 0);
        });

        setLabels(labelsLocal);
        setDuraciones(values);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDuraciones();
  }, [ledId]);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View>
      <LineChart
        data={{
          labels,
          datasets: [{ data: duraciones }],
        }}
        width={screenWidth - 20}
        height={220}
        chartConfig={chartConfig}
        style={{ marginVertical: 8, borderRadius: 16 }}
      />
    </View>
  );
}
