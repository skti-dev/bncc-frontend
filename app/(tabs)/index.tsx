import { useAuth } from "@/contexts/AuthContext";
import { Disciplina } from "@/services/questionsApi";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDisciplineSelect = (disciplina: Disciplina) => {
    router.push(`/questoes?disciplina=${disciplina}`);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>BNCC App</Text>
        <TouchableOpacity 
          style={[
            styles.logoutButton,
            isLoggingOut && styles.disabledButton
          ]} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.logoutButtonText}>Sair</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.question}>O que vamos estudar hoje?</Text>

        <View style={styles.disciplinesContainer}>
          <TouchableOpacity
            style={[styles.disciplineButton, styles.portuguesButton]}
            onPress={() => handleDisciplineSelect(Disciplina.PORTUGUES)}
          >
            <Text style={styles.disciplineButtonText}>Português</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.disciplineButton, styles.matematicaButton]}
            onPress={() => handleDisciplineSelect(Disciplina.MATEMATICA)}
          >
            <Text style={styles.disciplineButtonText}>Matemática</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.disciplineButton, styles.cienciasButton]}
            onPress={() => handleDisciplineSelect(Disciplina.CIENCIAS)}
          >
            <Text style={styles.disciplineButtonText}>Ciências</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#000000ff",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: "#999",
    opacity: 0.6,
  },
  logoutButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 40,
  },
  disciplinesContainer: {
    width: "100%",
    gap: 20,
  },
  disciplineButton: {
    paddingVertical: 20,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  portuguesButton: {
    backgroundColor: "#d62222ff",
  },
  matematicaButton: {
    backgroundColor: "#007AFF",
  },
  cienciasButton: {
    backgroundColor: "#34C759",
  },
  disciplineButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});
