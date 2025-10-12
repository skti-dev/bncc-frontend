import { BaseColors, DisciplineColors } from '@/constants/theme';
import { getDisciplineName } from '@/hooks/use-discipline-theme';
import { Question, questionsService } from '@/services/questionsApi';
import { ResultadoDetalhado, resultsService } from '@/services/resultsApi';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuestionModalData {
  questao: Question;
  resposta_dada: string;
  gabarito: string;
  acertou: boolean;
}

export default function ResultadoDetalhesScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [resultado, setResultado] = useState<ResultadoDetalhado | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionModalData | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const loadResultado = useCallback(async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await resultsService.getResultadoDetalhado(id);

      if (!response.success || !response.data) {
        Alert.alert('Erro', response.message || 'Erro ao carregar resultado');
        router.back();
        return;
      }

      setResultado(response.data);
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor');
      console.error('Erro ao carregar resultado:', error);
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadResultado();
    }
  }, [id, loadResultado]);

  const handleVerQuestao = async (questao_id: string, resposta_dada: string, gabarito: string, acertou: boolean) => {
    setLoadingQuestion(true);
    
    try {
      const response = await questionsService.getQuestionById(questao_id);

      if (!response.success || !response.data) {
        Alert.alert('Erro', response.message || 'Erro ao carregar questão');
        return;
      }

      setSelectedQuestion({
        questao: response.data,
        resposta_dada,
        gabarito,
        acertou
      });
      setModalVisible(true);
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor');
      console.error('Erro ao carregar questão:', error);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDisciplinaColor = (disciplina: string): string => {
    switch (disciplina) {
      case 'LP': return DisciplineColors.portugues.primary;
      case 'MA': return DisciplineColors.matematica.primary;
      case 'CI': return DisciplineColors.ciencias.primary;
      default: return BaseColors.gray[400];
    }
  };

  const processText = (text: string) => {
    return text.split('\\n').map((line, index) => (
      <Text key={index} style={styles.questionText}>
        {line}
        {index < text.split('\\n').length - 1 && '\n'}
      </Text>
    ));
  };

  const renderResposta = ({ item, index }: { item: any; index: number }) => {
    return (
      <View style={[
        styles.respostaCard,
        item.acertou ? styles.respostaCorreta : styles.respostaIncorreta
      ]}>
        <View style={styles.respostaHeader}>
          <View style={styles.respostaInfo}>
            <Text style={styles.respostaNumero}>#{index + 1}</Text>
            <Text style={styles.respostaCodigo}>{item.codigo}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            item.acertou ? styles.statusCorreto : styles.statusIncorreto
          ]}>
            <Text style={styles.statusText}>
              {item.acertou ? '✓ Correto' : '✗ Incorreto'}
            </Text>
          </View>
        </View>

        <View style={styles.respostaContent}>
          <View style={styles.respostaRow}>
            <Text style={styles.respostaLabel}>Sua resposta:</Text>
            <Text style={[
              styles.respostaValor,
              !item.acertou && styles.respostaErrada
            ]}>
              {item.resposta_dada}
            </Text>
          </View>
          
          <View style={styles.respostaRow}>
            <Text style={styles.respostaLabel}>Gabarito:</Text>
            <Text style={[styles.respostaValor, styles.gabarito]}>
              {item.gabarito}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.verQuestaoButton}
          onPress={() => handleVerQuestao(item.questao_id, item.resposta_dada, item.gabarito, item.acertou)}
          disabled={loadingQuestion}
        >
          {loadingQuestion ? (
            <ActivityIndicator size="small" color={BaseColors.white} />
          ) : (
            <Text style={styles.verQuestaoText}>Ver Questão Completa</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={BaseColors.info} />
        <Text style={styles.loadingText}>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!resultado) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Resultado não encontrado</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const disciplinaColor = getDisciplinaColor(resultado.disciplina);
  const disciplinaNome = getDisciplineName(resultado.disciplina as any);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: disciplinaColor }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.title}>📊 Detalhes do Resultado</Text>
          <Text style={styles.subtitle}>{disciplinaNome} - {resultado.ano}º ano</Text>
          <Text style={styles.dateText}>{formatDate(resultado.created_at)}</Text>
        </View>
      </View>

      {/* Estatísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {resultado.pontuacao}/{resultado.total_questoes}
          </Text>
          <Text style={styles.statLabel}>Pontuação</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={[
            styles.statValue,
            { color: resultado.percentual_acerto >= 70 ? BaseColors.success : resultado.percentual_acerto >= 50 ? BaseColors.warning : BaseColors.error }
          ]}>
            {resultado.percentual_acerto.toFixed(1)}%
          </Text>
          <Text style={styles.statLabel}>Acertos</Text>
        </View>
        
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {resultado.respostas.filter(r => r.acertou).length}
          </Text>
          <Text style={styles.statLabel}>Corretas</Text>
        </View>
      </View>

      {/* Lista de Respostas */}
      <FlatList
        data={resultado.respostas}
        renderItem={renderResposta}
        keyExtractor={(item, index) => `${item.questao_id}-${index}`}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Modal da Questão */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>✕ Fechar</Text>
            </TouchableOpacity>
          </View>

          {selectedQuestion && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.questionContainer}>
                <Text style={styles.questionTitle}>
                  {selectedQuestion.questao.codigo}
                </Text>
                
                {selectedQuestion.questao.questao.url && (
                  <View style={styles.imageContainer}>
                    <Image
                      source={{ uri: selectedQuestion.questao.questao.url }}
                      style={styles.questionImage}
                      resizeMode="contain"
                    />
                  </View>
                )}
                
                <View style={styles.questionTextContainer}>
                  {processText(selectedQuestion.questao.questao.enunciado)}
                </View>
              </View>

              <View style={styles.alternativesContainer}>
                {Object.entries(selectedQuestion.questao.questao.alternativas).map(([key, text]) => {
                  const isUserAnswer = key === selectedQuestion.resposta_dada;
                  const isCorrectAnswer = key === selectedQuestion.gabarito;
                  
                  return (
                    <View
                      key={key}
                      style={[
                        styles.alternativeButton,
                        isUserAnswer && !isCorrectAnswer && styles.wrongAnswer,
                        isCorrectAnswer && styles.correctAnswer,
                        isUserAnswer && isCorrectAnswer && styles.userCorrectAnswer
                      ]}
                    >
                      <Text style={[
                        styles.alternativeKey
                      ]}>
                        {key}
                      </Text>
                      <View style={styles.alternativeTextContainer}>
                        {processText(text)}
                      </View>
                      {isUserAnswer && (
                        <Text style={styles.answerLabel}>Sua resposta</Text>
                      )}
                      {isCorrectAnswer && (
                        <Text style={styles.correctLabel}>Gabarito</Text>
                      )}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BaseColors.gray[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  backButtonText: {
    color: BaseColors.white,
    fontSize: 16,
    fontWeight: '500',
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BaseColors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: BaseColors.white,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BaseColors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: BaseColors.gray[600],
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  respostaCard: {
    backgroundColor: BaseColors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  respostaCorreta: {
    borderLeftWidth: 4,
    borderLeftColor: BaseColors.success,
  },
  respostaIncorreta: {
    borderLeftWidth: 4,
    borderLeftColor: BaseColors.error,
  },
  respostaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  respostaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  respostaNumero: {
    fontSize: 14,
    fontWeight: 'bold',
    color: BaseColors.gray[600],
  },
  respostaCodigo: {
    fontSize: 14,
    fontWeight: '600',
    color: BaseColors.gray[900],
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusCorreto: {
    backgroundColor: BaseColors.success,
  },
  statusIncorreto: {
    backgroundColor: BaseColors.error,
  },
  statusText: {
    color: BaseColors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  respostaContent: {
    gap: 8,
    marginBottom: 10,
  },
  respostaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  respostaLabel: {
    fontSize: 14,
    color: BaseColors.gray[600],
  },
  respostaValor: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BaseColors.gray[900],
  },
  respostaErrada: {
    color: BaseColors.error,
  },
  gabarito: {
    color: BaseColors.success,
  },
  verQuestaoButton: {
    backgroundColor: BaseColors.info,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  verQuestaoText: {
    color: BaseColors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BaseColors.gray[50],
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: BaseColors.gray[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BaseColors.gray[50],
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: BaseColors.gray[600],
    marginBottom: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: BaseColors.gray[50],
  },
  modalHeader: {
    backgroundColor: BaseColors.info,
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: BaseColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: BaseColors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BaseColors.info,
    marginBottom: 15,
  },
  questionTextContainer: {
    marginTop: 10,
  },
  questionText: {
    fontSize: 16,
    color: BaseColors.gray[900],
    lineHeight: 24,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
    padding: 10,
    backgroundColor: BaseColors.gray[50],
    borderRadius: 8,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  alternativesContainer: {
    gap: 12,
  },
  alternativeButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: BaseColors.white,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BaseColors.gray[200],
    position: 'relative',
  },
  wrongAnswer: {
    borderColor: BaseColors.error,
    backgroundColor: '#ffebee',
  },
  correctAnswer: {
    borderColor: BaseColors.success,
    backgroundColor: '#e8f5e8',
  },
  userCorrectAnswer: {
    borderColor: BaseColors.success,
    backgroundColor: '#e8f5e8',
  },
  alternativeKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: BaseColors.gray[600],
    marginRight: 12,
    minWidth: 20,
  },
  alternativeTextContainer: {
    flex: 1,
  },
  answerLabel: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: BaseColors.info,
    color: BaseColors.white,
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  correctLabel: {
    position: 'absolute',
    top: -8,
    right: 8,
    backgroundColor: BaseColors.success,
    color: BaseColors.white,
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
});