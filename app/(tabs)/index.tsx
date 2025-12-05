import { BaseColors, DisciplineColors } from "@/constants/theme";
import { useWebLayout } from "@/constants/WebConfig";
import { useAuth } from "@/contexts/AuthContext";
import { Disciplina } from "@/services/questionsApi";
import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { isWeb, horizontalPadding } = useWebLayout();
  const [buttonScales] = useState({
    portugues: new Animated.Value(1),
    matematica: new Animated.Value(1),
    ciencias: new Animated.Value(1),
  });

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

  const handleDisciplinePress = (disciplina: Disciplina, key: keyof typeof buttonScales) => {
    Animated.sequence([
      Animated.timing(buttonScales[key], {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScales[key], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      router.push(`/questoes?disciplina=${disciplina}`);
    }, 200);
  };

  return (
    <View style={[styles.container, { paddingHorizontal: isWeb ? 0 : horizontalPadding }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>🎯 BNCC App</Text>
          <Text style={styles.headerSubtitle}>Sua jornada de aprendizado</Text>
        </View>
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
        <View style={styles.welcomeSection}>
          <Text style={styles.question}>O que vamos estudar hoje?</Text>
          <Text style={styles.subtitle}>🚀 Escolha sua aventura de aprendizado!</Text>
        </View>

        <View style={styles.disciplinesContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScales.portugues }] }}>
            <TouchableOpacity
              style={[styles.disciplineButton, styles.portuguesButton]}
              onPress={() => handleDisciplinePress(Disciplina.PORTUGUES, 'portugues')}
              activeOpacity={0.8}
            >
              <View style={styles.disciplineIconContainer}>
                <Text style={styles.disciplineIcon}>📚</Text>
              </View>
              <Text style={styles.disciplineButtonText}>Português</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScales.matematica }] }}>
            <TouchableOpacity
              style={[styles.disciplineButton, styles.matematicaButton]}
              onPress={() => handleDisciplinePress(Disciplina.MATEMATICA, 'matematica')}
              activeOpacity={0.8}
            >
              <View style={styles.disciplineIconContainer}>
                <Text style={styles.disciplineIcon}>🔢</Text>
              </View>
              <Text style={styles.disciplineButtonText}>Matemática</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={{ transform: [{ scale: buttonScales.ciencias }] }}>
            <TouchableOpacity
              style={[styles.disciplineButton, styles.cienciasButton]}
              onPress={() => handleDisciplinePress(Disciplina.CIENCIAS, 'ciencias')}
              activeOpacity={0.8}
            >
              <View style={styles.disciplineIconContainer}>
                <Text style={styles.disciplineIcon}>🔬</Text>
              </View>
              <Text style={styles.disciplineButtonText}>Ciências</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BaseColors.gray[50],
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BaseColors.gray[900],
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: 50,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: BaseColors.white,
  },
  headerSubtitle: {
    fontSize: 12,
    color: BaseColors.gray[400],
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: BaseColors.error,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabledButton: {
    backgroundColor: BaseColors.gray[400],
    opacity: 0.6,
  },
  logoutButtonText: {
    color: BaseColors.white,
    fontSize: 14,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  question: {
    fontSize: 26,
    fontWeight: "bold",
    color: BaseColors.gray[800],
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: BaseColors.gray[600],
    textAlign: "center",
  },
  disciplinesContainer: {
    width: "100%",
    gap: 20,
  },
  disciplineButton: {
    paddingVertical: 24,
    paddingHorizontal: 30,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    transform: [{ scale: 1 }],
  },
  disciplineIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  disciplineIcon: {
    fontSize: 28,
  },
  portuguesButton: {
    backgroundColor: DisciplineColors.portugues.primary,
  },
  matematicaButton: {
    backgroundColor: DisciplineColors.matematica.primary,
  },
  cienciasButton: {
    backgroundColor: DisciplineColors.ciencias.primary,
  },
  disciplineButtonText: {
    color: BaseColors.white,
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
});
