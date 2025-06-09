
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Alert,
  RefreshControl,
} from "react-native";

const API_URL = "http://192.168.1.22:3000"; // Cambia IP/puerto si es necesario

type LedInfo = {
  id: number;
  on: boolean;
  loading: boolean;
};

export default function App() {
  const [leds, setLeds] = useState<LedInfo[]>([
    { id: 1, on: false, loading: true },
    { id: 2, on: false, loading: true },
    { id: 3, on: false, loading: true },
  ]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLedStatus = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/historial?led_id=${id}`);
      const data = await res.json();
      if (data.length > 0) {
        const last = data[0];
        return last.estado === "ENCENDIDO";
      }
      return false;
    } catch (err) {
      console.error(`Error obteniendo estado LED ${id}:`, err);
      return false;
    }
  };

  const loadAllStatuses = async () => {
    setRefreshing(true);
    const updated = await Promise.all(
      leds.map(async (led) => {
        const on = await fetchLedStatus(led.id);
        return { ...led, on, loading: false };
      })
    );
    setLeds(updated);
    setRefreshing(false);
  };

  const toggleLed = async (id: number, currentState: boolean) => {
    try {
      await fetch(`${API_URL}/led/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: !currentState }),
      });
      setLeds((prev) =>
        prev.map((led) =>
          led.id === id ? { ...led, on: !currentState } : led
        )
      );
    } catch (err) {
      console.error(`Error al cambiar el estado del LED ${id}:`, err);
      Alert.alert("Error", "No se pudo cambiar el estado del LED.");
    }
  };

  const showHistorial = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/historial?led_id=${id}`);
      const data = await res.json();
      const texto =
        data.length === 0
          ? "Sin eventos."
          : data
              .map(
                (e: any) =>
                  `${e.timestamp} → ${e.estado === "ENCENDIDO" ? "ON" : "OFF"}`
              )
              .join("\n");
      Alert.alert(`Historial LED ${id}`, texto);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo obtener el historial.");
    }
  };

  const showReporte = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/reportes?led_id=${id}`);
      const data = await res.json();
      const texto =
        data.length === 0
          ? "Sin reportes."
          : data
              .map(
                (r: any) =>
                  `${r.inicio} ⟶ ${r.fin} | ${r.duracion_formato}`
              )
              .join("\n");
      Alert.alert(`Reporte LED ${id}`, texto);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo obtener el reporte.");
    }
  };

  useEffect(() => {
    loadAllStatuses();
  }, []);

  const renderLed = ({ item }: { item: LedInfo }) => (
    <View style={styles.card}>
      {item.loading ? (
        <ActivityIndicator size="small" />
      ) : (
        <>
          <Text style={styles.title}>LED {item.id}</Text>
          <Text style={styles.status}>
            Estado: {item.on ? "Encendido" : "Apagado"}
          </Text>
          <View style={styles.row}>
            <Button
              title={item.on ? "Apagar" : "Encender"}
              onPress={() => toggleLed(item.id, item.on)}
            />
            <Button
              title="Historial"
              onPress={() => showHistorial(item.id)}
              color="#6a5acd"
            />
            <Button
              title="Reporte"
              onPress={() => showReporte(item.id)}
              color="#20b2aa"
            />
          </View>
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leds}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLed}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadAllStatuses} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, backgroundColor: "#f5f5f5" },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 6 },
  status: { fontSize: 18, marginBottom: 12 },
  row: { flexDirection: "row", justifyContent: "space-between" },
});
