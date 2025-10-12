import { BaseColors } from '@/constants/theme';
import { Question } from '@/services/questionsApi';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuestionCardProps {
  theme: any;
  question: Question;
  selectedAnswer: string;
  onAnswerSelect: (answer: string) => void;
}

export function QuestionCard({ theme, question, selectedAnswer, onAnswerSelect }: QuestionCardProps) {
  const styles = createStyles(theme);

  const processText = (text: string) => {
    return text.split('\\n').map((line, index) => (
      <Text key={index} style={styles.questionText}>
        {line}
        {index < text.split('\\n').length - 1 && '\n'}
      </Text>
    ));
  };

  const processAlternativeText = (text: string, isSelected: boolean) => {
    return text.split('\\n').map((line, index) => (
      <Text 
        key={index} 
        style={[
          styles.alternativeText,
          isSelected && styles.selectedText
        ]}
      >
        {line}
        {index < text.split('\\n').length - 1 && '\n'}
      </Text>
    ));
  };

  return (
    <ScrollView style={styles.content}>
      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>
          {question.codigo}
        </Text>
        
        {question.questao.url && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: question.questao.url }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          </View>
        )}
        
        <View style={styles.questionTextContainer}>
          {processText(question.questao.enunciado)}
        </View>
      </View>

      <View style={styles.alternativesContainer}>
        {Object.entries(question.questao.alternativas).map(([key, text]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.alternativeButton,
              selectedAnswer === key && styles.selectedAlternative
            ]}
            onPress={() => onAnswerSelect(key)}
          >
            <Text style={[
              styles.alternativeKey,
              selectedAnswer === key && styles.selectedText
            ]}>
              {key}
            </Text>
            <View style={styles.alternativeTextContainer}>
              {processAlternativeText(text, selectedAnswer === key)}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
  questionTextContainer: {
    marginTop: 10,
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
  alternativeTextContainer: {
    flex: 1,
  },
});