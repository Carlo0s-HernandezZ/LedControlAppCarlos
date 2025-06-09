
// Importaciones necesarias para componentes de React Native
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
  ScrollView,
} from "react-native";
import GraficaBarras from "./GraficaBarras"; // Componente de gráfico de barras
import GraficaLineas from "./GraficaLineas"; // Componente de gráfico de líneas

const API_URL = "http://192.168.1.22:3000"; // Dirección base de la API

// Tipo para representar un LED
type LedInfo = {
  id: number;
  on: boolean;
  loading: boolean;
};

export default function App() {
  // Estados para LEDs, carga, y qué gráfico mostrar
  const [leds, setLeds] = useState<LedInfo[]>([
    { id: 1, on: false, loading: true },
    { id: 2, on: false, loading: true },
    { id: 3, on: false, loading: true },
  ]);
  const [refreshing, setRefreshing] = useState(false);
  const [mostrarBarras, setMostrarBarras] = useState(false);
  const [mostrarLineas, setMostrarLineas] = useState(false);
  const [ledSeleccionado, setLedSeleccionado] = useState<number | null>(null);

  // Consulta el estado más reciente de un LED
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

  // Actualiza el estado de todos los LEDs al inicio o al refrescar
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

  // Cambia el estado de encendido de un LED y guarda el cambio
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

  // Muestra el historial de eventos de un LED
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

  // Efecto que se ejecuta al iniciar la app
  useEffect(() => {
    loadAllStatuses();
  }, []);

  // Renderiza un card por LED
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
              title="Ver Gráfico Línea"
              onPress={() => {
                setLedSeleccionado(item.id);
                setMostrarLineas(true);
                setMostrarBarras(false);
              }}
              color="#ff8c00"
            />
          </View>
        </>
      )}
    </View>
  );

  // UI principal
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <FlatList
        data={leds}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderLed}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadAllStatuses} />
        }
        scrollEnabled={false}
      />

      {/* Botón para gráfico de barras */}
      <View style={{ margin: 20 }}>
        <Button
          title="Ver Gráfico de Barras (Tiempo encendido/apagado)"
          onPress={() => {
            setMostrarBarras(true);
            setMostrarLineas(false);
          }}
        />
      </View>

      {/* Condicional para mostrar gráficas */}
      {mostrarBarras && <GraficaBarras />}
      {mostrarLineas && ledSeleccionado !== null && (
        <GraficaLineas ledId={ledSeleccionado} />
      )}
    </ScrollView>
  );
}

// Estilos de la interfaz
const styles = StyleSheet.create({
  container: { paddingTop: 60, paddingBottom: 40, backgroundColor: "#f5f5f5" },
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
