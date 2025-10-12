import { ConfirmationScreen, LoadingScreen, NavigationButtons, QuestionCard, QuestionHeader, SummaryScreen } from '@/components/questoes';
import { useAuth } from '@/contexts/AuthContext';
import { getDisciplineEmoji, getDisciplineName, useDisciplineTheme } from '@/hooks/use-discipline-theme';
import { AnswersService, UserAnswer } from '@/services/answersService';
import { Disciplina, Question, questionsService } from '@/services/questionsApi';
import { QuestionResult, ResultData, resultsService } from '@/services/resultsApi';
import { useNavigation } from '@react-navigation/native';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function QuestoesScreen() {
  const { disciplina } = useLocalSearchParams<{
    disciplina: Disciplina;
  }>();
  
  const navigation = useNavigation();
  const theme = useDisciplineTheme(disciplina);
  
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
  const disciplinaEmoji = disciplina ? getDisciplineEmoji(disciplina) : '📖';

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
        questao_id: question.id || question._id || '',
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

  // Renderizações condicionais usando os componentes
  if (isLoading) {
    return <LoadingScreen theme={theme} />;
  }

  if (showConfirmation) {
    return (
      <ConfirmationScreen
        theme={theme}
        disciplinaName={disciplinaName}
        isSubmitting={isSubmitting}
        onCancel={() => setShowConfirmation(false)}
        onConfirm={handleConfirmFinish}
      />
    );
  }

  if (showSummary) {
    return (
      <SummaryScreen
        theme={theme}
        disciplinaName={disciplinaName}
        sessionAnswers={sessionAnswers}
        totalQuestions={questions.length}
        onFinish={handleFinish}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.title, { color: theme.text }]}>Nenhuma questão encontrada</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <QuestionHeader
        theme={theme}
        disciplinaEmoji={disciplinaEmoji}
        disciplinaName={disciplinaName}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
      />

      <QuestionCard
        theme={theme}
        question={currentQuestion}
        selectedAnswer={selectedAnswer}
        onAnswerSelect={handleAnswerSelect}
      />

      <NavigationButtons
        theme={theme}
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={questions.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 20,
  },
});