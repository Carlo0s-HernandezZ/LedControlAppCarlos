
import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";

const screenWidth = Dimensions.get("window").width;
const API_URL = "http://192.168.222.156:3000"; // Dirección API

type Props = {
  ledId: number;
};

export default function GraficaLineas({ ledId }: Props) {
  const [datos, setDatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar historial del LED desde la API
  useEffect(() => {
    fetch(`${API_URL}/estadisticas/linea?led_id=${ledId}`)
      .then((res) => res.json())
      .then((data) => {
        setDatos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error al cargar datos de línea", err);
        setLoading(false);
      });
  }, [ledId]);

  // Preparar datos para el gráfico
  const labels = datos.map((d) =>
    new Date(d.timestamp).toLocaleTimeString("es-MX", { hour12: false })
  );
  const valores = datos.map((d) => (d.estado === 1 ? 1 : 0)); // 1 = ON, 0 = OFF

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View>
      <Text style={styles.titulo}>Cambios de Estado LED {ledId}</Text>
      <LineChart
        data={{
          labels,
          datasets: [{ data: valores }],
        }}
        width={screenWidth - 32}
        height={220}
        yAxisLabel=""
        yLabelsOffset={10}
        yAxisInterval={1}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
          labelColor: () => "#333",
        }}
        bezier
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
