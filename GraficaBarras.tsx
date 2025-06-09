import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { BarChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const API_URL = "http://192.168.1.22:3000";

export default function GraficaBarras() {
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/estadisticas/tiempos`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDatos(data);
        } else {
          console.error("Respuesta inesperada:", data);
          setDatos([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos de barras", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  if (!Array.isArray(datos) || datos.length === 0) {
    return <Text style={styles.titulo}>No hay datos para mostrar.</Text>;
  }

  const leds = [...new Set(datos.map((d) => d.led_id))];
  const encendidos = leds.map(
    (id) =>
      datos.find((d) => d.led_id === id && d.estado === "ENCENDIDO")?.total_horas || 0
  );

  return (
    <View>
      <Text style={styles.titulo}>Horas Encendido por LED</Text>
      <BarChart
        data={{
          labels: leds.map((id) => `LED ${id}`),
          datasets: [{ data: encendidos }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
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
