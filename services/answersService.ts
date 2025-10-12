import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserAnswer {
  enunciado: string;
  gabarito: string;
  resposta_dada: string;
}

export interface SessionAnswers {
  [questionKey: string]: UserAnswer;
}

export class AnswersService {
  private static generateSessionKey(disciplina: string, ano: string, email: string): string {
    const timestamp = Date.now();
    return `${disciplina}_${ano}_${email}_${timestamp}`;
  }

  static async saveAnswer(
    sessionKey: string,
    questionIndex: number,
    answer: UserAnswer
  ): Promise<void> {
    try {
      const existingAnswers = await this.getSessionAnswers(sessionKey);
      const questionKey = `questao_${questionIndex + 1}`;
      
      const updatedAnswers = {
        ...existingAnswers,
        [questionKey]: answer
      };

      await AsyncStorage.setItem(sessionKey, JSON.stringify(updatedAnswers));
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
    }
  }

  static async getSessionAnswers(sessionKey: string): Promise<SessionAnswers> {
    try {
      const answers = await AsyncStorage.getItem(sessionKey);
      return answers ? JSON.parse(answers) : {};
    } catch (error) {
      console.error('Erro ao recuperar respostas:', error);
      return {};
    }
  }

  static async clearSession(sessionKey: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(sessionKey);
    } catch (error) {
      console.error('Erro ao limpar sessão:', error);
    }
  }

  static generateNewSessionKey(disciplina: string, ano: string, email: string): string {
    return this.generateSessionKey(disciplina, ano, email);
  }
}