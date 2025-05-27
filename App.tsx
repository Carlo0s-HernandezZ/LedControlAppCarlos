import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ActivityIndicator } from "react-native";

const API_URL = "http://192.168.1.14:3000/led"; 

export default function App() {
  const [LedOn, setLedOn] = useState(false);
  const [loading, setLoading] = useState(true);

  // función para obtener el estado del led
const fetchLedStatus = async () => {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    console.log("JSON recibido del backend:", data); // <--- AGREGA ESTO

    setLedOn(data.estado === 1);
  } catch (error) {
    console.error("Error al obtener el estado del LED:", error);
  } finally {
    setLoading(false);
  }
};

  // función para cambiar el estado del led
  const toggleLed = async () => {
    const newState = LedOn ? 0 : 1;
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ estado: newState }),
      });
      setLedOn(!LedOn);
    } catch (error) {
      console.error("Error al cambiar el estado del led", error);
    }
  };

  useEffect(() => {
    fetchLedStatus();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
          Estado del LED: {LedOn ? "Encendido" : "Apagado"} ({String(LedOn)})
      </Text>
      <Button title={LedOn ? "Apagar" : "Encender"} onPress={toggleLed} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
});