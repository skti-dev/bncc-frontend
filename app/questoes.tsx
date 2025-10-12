import { BaseColors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { getDisciplineEmoji, getDisciplineName, useDisciplineTheme } from '@/hooks/use-discipline-theme';
import { AnswersService, UserAnswer } from '@/services/answersService';
import { Disciplina, Question, questionsService } from '@/services/questionsApi';
import { QuestionResult, ResultData, resultsService } from '@/services/resultsApi';
import { useNavigation } from '@react-navigation/native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuestoesScreen() {
  const { disciplina } = useLocalSearchParams<{
    disciplina: Disciplina;
  }>();
  
  const navigation = useNavigation();
  const theme = useDisciplineTheme(disciplina);
  const styles = createStyles(theme);
  
  const [isLoading, setIsLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [sessionKey, setSessionKey] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [sessionAnswers, setSessionAnswers] = useState<{[key: string]: UserAnswer}>({});
  const [tempAnswers, setTempAnswers] = useState<{[key: number]: string}>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canNavigateBack, setCanNavigateBack] = useState(false);
  
  const { user } = useAuth();

  const disciplinaName = disciplina ? getDisciplineName(disciplina) : 'Disciplina';

  useEffect(() => {
    navigation.setOptions({
      title: `Questionário ${disciplinaName}`,
    });
  }, [navigation, disciplinaName]);

  const handleBackPress = useCallback(() => {
    if (showSummary || canNavigateBack) {
      return false;
    }
    
    Alert.alert(
      'Sair do Questionário',
      'Tem certeza que deseja sair? Todo o progresso será perdido.',
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: () => {
            if (sessionKey) {
              AnswersService.clearSession(sessionKey);
            }
            router.push('/(tabs)');
          }
        }
      ]
    );
    return true;
  }, [sessionKey, showSummary, canNavigateBack]);

  useFocusEffect(
    useCallback(() => {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
      
      return () => {
        backHandler.remove();
      };
    }, [handleBackPress])
  );

  useEffect(() => {
    navigation.setOptions({
      title: `Questionário ${disciplinaName}`,
      headerLeft: () => (
        <TouchableOpacity 
          onPress={handleBackPress}
          style={{ marginLeft: 10, padding: 8 }}
        >
          <Text style={{ color: '#007AFF', fontSize: 16 }}>← Voltar</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, disciplinaName, handleBackPress]);

  const disciplinaEmoji = disciplina ? getDisciplineEmoji(disciplina) : '📖';

  useEffect(() => {
    const loadQuestions = async () => {
      if (!disciplina || !user?.metadata?.ano || !user?.email) return;

      setIsLoading(true);
      try {
        const response = await questionsService.getQuestions({
          page: 1,
          disciplina: disciplina,
          ano: user.metadata.ano
        });

        if (!response.success || !response.data?.data) {
          Alert.alert('Erro', response.message || 'Erro ao carregar questões');
          return;
        }

        setQuestions(response.data.data);
        
        const newSessionKey = AnswersService.generateNewSessionKey(
          disciplina,
          user.metadata.ano.toString(),
          user.email
        );
        setSessionKey(newSessionKey);

      } catch {
        Alert.alert('Erro', 'Erro de conexão com o servidor');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, [disciplina, user]);

  useEffect(() => {
    setSelectedAnswer(tempAnswers[currentQuestionIndex] || '');
  }, [currentQuestionIndex, tempAnswers]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setTempAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: answer
    }));
  };

  const handleNext = async () => {
    if (!selectedAnswer) {
      Alert.alert('Atenção', 'Selecione uma resposta antes de continuar');
      return;
    }

    if (currentQuestionIndex === questions.length - 1) {
      setShowConfirmation(true);
      return;
    }

    setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleConfirmFinish = async () => {
    for (let i = 0; i < questions.length; i++) {
      const answer = tempAnswers[i];
      if (answer) {
        const userAnswer: UserAnswer = {
          enunciado: questions[i].questao.enunciado,
          gabarito: questions[i].questao.gabarito,
          resposta_dada: answer
        };
        await AnswersService.saveAnswer(sessionKey, i, userAnswer);
      }
    }

    const questionResults: QuestionResult[] = questions.map((question, index) => {
      const userAnswer = tempAnswers[index] || '';
      return {
        questao_id: question.id,
        codigo: question.codigo,
        resposta_dada: userAnswer,
        gabarito: question.questao.gabarito,
        acertou: userAnswer === question.questao.gabarito
      };
    });

    const correctAnswers = questionResults.filter(result => result.acertou).length;
    const resultData: ResultData = {
      disciplina: disciplina,
      ano: user?.metadata?.ano || 0,
      email: user?.email || '',
      respostas: questionResults,
      pontuacao: correctAnswers,
      total_questoes: questions.length
    };

    setIsSubmitting(true);
    try {
      const response = await resultsService.submitResults(resultData);
      
      if (!response.success) {
        Alert.alert('Erro', response.message || 'Erro ao enviar resultados. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      const allAnswers = await AnswersService.getSessionAnswers(sessionKey);
      setSessionAnswers(allAnswers);
      setShowConfirmation(false);
      setShowSummary(true);
      setCanNavigateBack(true);
    } catch (error) {
      Alert.alert('Erro', 'Erro de conexão com o servidor. Tente novamente.');
      console.error('Erro ao enviar resultados:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    await AnswersService.clearSession(sessionKey);
    router.replace('/(tabs)');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Carregando questões...</Text>
      </View>
    );
  }

  if (showConfirmation) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Finalizar Questionário</Text>
        </View>
        
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationTitle}>Deseja finalizar o questionário?</Text>

          <View style={styles.confirmationButtons}>
            <TouchableOpacity 
              style={[
                styles.confirmButton, 
                styles.cancelButton,
                isSubmitting && styles.disabledButton
              ]} 
              onPress={() => setShowConfirmation(false)}
              disabled={isSubmitting}
            >
              <Text style={[
                styles.cancelButtonText,
                isSubmitting && styles.disabledText
              ]}>
                Voltar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.confirmButton, 
                styles.finishConfirmButton,
                isSubmitting && styles.disabledButton
              ]} 
              onPress={handleConfirmFinish}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <View style={styles.buttonLoadingContainer}>
                  <ActivityIndicator size="small" color="white" />
                  <Text style={styles.buttonLoadingText}>Enviando...</Text>
                </View>
              ) : (
                <Text style={styles.finishConfirmButtonText}>Finalizar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (showSummary) {
    const correctAnswers = Object.values(sessionAnswers).filter(
      answer => answer.gabarito === answer.resposta_dada
    ).length;

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Resumo - {disciplinaName}</Text>
        </View>
        
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryScore}>
            {correctAnswers} de {questions.length} questões corretas
          </Text>
          <Text style={styles.summaryPercentage}>
            {Math.round((correctAnswers / questions.length) * 100)}% de acertos
          </Text>
        </View>

        <View style={styles.tableContainer}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Questão</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Resposta</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Gabarito</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Resultado</Text>
          </View>

          <ScrollView style={styles.tableScroll}>
            {Object.entries(sessionAnswers).map(([questionKey, answer], index) => {
              const isCorrect = answer.gabarito === answer.resposta_dada;
              return (
                <View key={questionKey} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{index + 1}</Text>
                  <Text style={styles.tableCell}>{answer.resposta_dada}</Text>
                  <Text style={styles.tableCell}>{answer.gabarito}</Text>
                  <Text style={[
                    styles.tableCell,
                    styles.resultCell,
                    isCorrect ? styles.correct : styles.incorrect
                  ]}>
                    {isCorrect ? '✓' : '✗'}
                  </Text>
                </View>
              );
            })}
          </ScrollView>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <Text style={styles.finishButtonText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Nenhuma questão encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title]}>{disciplinaEmoji} {disciplinaName}</Text>
        <Text style={styles.counter}>
          Questão {currentQuestionIndex + 1} de {questions.length}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionTitle}>
            {currentQuestion.codigo}
          </Text>
          <Text style={styles.questionText}>
            {currentQuestion.questao.enunciado}
          </Text>
        </View>

        <View style={styles.alternativesContainer}>
          {Object.entries(currentQuestion.questao.alternativas).map(([key, text]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.alternativeButton,
                selectedAnswer === key && styles.selectedAlternative
              ]}
              onPress={() => handleAnswerSelect(key)}
            >
              <Text style={[
                styles.alternativeKey,
                selectedAnswer === key && styles.selectedText
              ]}>
                {key}
              </Text>
              <Text style={[
                styles.alternativeText,
                selectedAnswer === key && styles.selectedText
              ]}>
                {text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton, 
            styles.prevButton,
            currentQuestionIndex === 0 && styles.disabledButton
          ]}
          onPress={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={[
            styles.navButtonText,
            styles.prevButtonText,
            currentQuestionIndex === 0 && styles.disabledText
          ]}>
            Anterior
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={[styles.navButtonText, styles.nextButtonText]}>
            {currentQuestionIndex === questions.length - 1 ? 'Finalizar' : 'Próxima'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: theme.textSecondary,
  },
  header: {
    backgroundColor: theme.primary,
    padding: 20,
    paddingTop: 50,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: BaseColors.white,
    textAlign: 'center',
  },
  counter: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  questionContainer: {
    backgroundColor: theme.surface,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderLeftWidth: 4,
    borderLeftColor: theme.primary,
  },
  questionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 16,
    color: theme.text,
    lineHeight: 24,
  },
  alternativesContainer: {
    gap: 12,
  },
  alternativeButton: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BaseColors.gray[200],
    alignItems: 'flex-start',
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedAlternative: {
    borderColor: theme.primary,
    backgroundColor: theme.light,
    shadowOpacity: 0.15,
    elevation: 4,
  },
  alternativeKey: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginRight: 10,
    width: 20,
  },
  alternativeText: {
    fontSize: 16,
    color: theme.text,
    flex: 1,
    lineHeight: 22,
  },
  selectedText: {
    color: theme.primary,
    fontWeight: '600',
  },
  navigationContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: BaseColors.gray[200],
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  navButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prevButton: {
    backgroundColor: BaseColors.gray[600],
    borderWidth: 2,
    borderColor: BaseColors.gray[600],
  },
  nextButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.primary,
  },
  disabledButton: {
    backgroundColor: BaseColors.gray[300],
    borderColor: BaseColors.gray[300],
    opacity: 0.6,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  prevButtonText: {
    color: BaseColors.white,
  },
  nextButtonText: {
    color: theme.primary,
  },
  disabledText: {
    color: BaseColors.gray[500],
  },
  // Estilos do resumo
  summaryContainer: {
    backgroundColor: theme.surface,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
    borderTopWidth: 4,
    borderTopColor: theme.primary,
  },
  summaryScore: {
    fontSize: 18,
    color: theme.primary,
    fontWeight: '600',
    marginBottom: 5,
  },
  summaryPercentage: {
    fontSize: 16,
    color: theme.textSecondary,
  },
  // Estilos da tabela
  tableContainer: {
    flex: 1,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tableHeader: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    flex: 1,
    padding: 15,
    textAlign: 'center',
    fontSize: 16,
    color: '#333',
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
  tableScroll: {
    maxHeight: 300,
  },
  resultCell: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  correct: {
    color: '#34C759',
    fontWeight: 'bold',
  },
  incorrect: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.primary,
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  finishButtonText: {
    color: theme.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  // Estilos da tela de confirmação
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  confirmationText: {
    fontSize: 16,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: BaseColors.warning,
    textAlign: 'center',
    marginBottom: 30,
    fontWeight: '500',
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: BaseColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cancelButton: {
    backgroundColor: BaseColors.gray[200],
    borderWidth: 1,
    borderColor: BaseColors.gray[300],
  },
  cancelButtonText: {
    color: BaseColors.gray[700],
    fontSize: 16,
    fontWeight: '600',
  },
  finishConfirmButton: {
    backgroundColor: theme.primary,
    borderWidth: 2,
    borderColor: theme.primary,
  },
  finishConfirmButtonText: {
    color: BaseColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Estilo para loading no botão de finalizar
  buttonLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonLoadingText: {
    color: BaseColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});