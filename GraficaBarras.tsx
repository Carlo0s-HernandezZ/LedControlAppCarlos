import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const API_URL = "http://192.168.1.22:3000"; // Cambia a tu IP real si es necesario

export default function GraficaBarras() {
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/estadisticas/tiempos`)
      .then((res) => res.json())
      .then((data) => {
        setDatos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos de barras", err);
        setLoading(false);
      });
  }, []);

  // Extraer IDs de LEDs únicos
  const leds = [...new Set(datos.map((d) => d.led_id))];

  // Obtener horas encendido por LED
  const encendidos = leds.map(
    (id) =>
      datos.find((d) => d.led_id === id && d.estado === "ENCENDIDO")?.total_horas || 0
  );

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View>
<BarChart
  data={{
    labels: leds.map((id) => `LED ${id}`),
    datasets: [{ data: encendidos }],
  }}
  width={screenWidth - 32}
  height={220}
  yAxisLabel="" //obligatorio aunque esté vacío
  yAxisSuffix="h"
  fromZero
  chartConfig={{
    backgroundGradientFrom: "#fff",
    backgroundGradientTo: "#fff",
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
    labelColor: () => "#333",
  }}
  verticalLabelRotation={0}
/>
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 12,
  },
});