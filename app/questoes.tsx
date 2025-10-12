import { Disciplina, QuestionsParams, questionsService } from '@/services/questionsApi';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function QuestoesScreen() {
  const { page, disciplina } = useLocalSearchParams<{
    page: string;
    disciplina: Disciplina;
  }>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<any>(null);
  const { user } = useAuth();

  const disciplinaNames = {
    [Disciplina.PORTUGUES]: 'Português',
    [Disciplina.MATEMATICA]: 'Matemática',
    [Disciplina.CIENCIAS]: 'Ciências'
  };

  useEffect(() => {
    const loadQuestions = async () => {
      if (!page || !disciplina || !user?.metadata?.ano) return;

      setIsLoading(true);
      try {
        const params: QuestionsParams = {
          page: parseInt(page),
          disciplina: disciplina,
          ano: user.metadata.ano
        };

        const response = await questionsService.getQuestions(params);

        if (!response.success) {
          Alert.alert('Erro', response.message || 'Erro ao carregar questões');
          return;
        } 
        setQuestions(response.data);
      } catch {
        Alert.alert('Erro', 'Erro de conexão com o servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [page, disciplina, user]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando questões...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {disciplinaNames[disciplina]} - Página {page}
      </Text>
      
      <Text style={styles.subtitle}>Usuário: {user?.email}</Text>
      <Text style={styles.subtitle}>Metadata: {JSON.stringify(user?.metadata)}</Text>

      <View style={styles.content}>
        <Text style={styles.placeholder}>
          Aqui virão as questões de {disciplinaNames[disciplina]}
        </Text>
        
        {questions && (
          <Text style={styles.debug}>
            {JSON.stringify(questions, null, 2)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
  },
  debug: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
    textAlign: 'left',
  },
});