import api from './api';

export enum Disciplina {
  PORTUGUES = 'LP',
  MATEMATICA = 'MA',
  CIENCIAS = 'CI'
}

export interface QuestionsParams {
  page: number;
  disciplina: Disciplina;
  ano: number;
}

export interface QuestionsResponse {
  success: boolean;
  data?: {
    total: number;
    totalPages: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
    data: Question[];
  };
  message?: string;
}

export interface Question {
  disciplina: string;
  ano: string;
  codigo: string;
  questao: {
    enunciado: string;
    alternativas: {
      A: string;
      B: string;
      C: string;
      D: string;
    };
    gabarito: string;
    url?: string;
  };
  id: string;
  created_at?: string;
  updated_at?: string;
}

export const questionsService = {
  getQuestions: async (params: QuestionsParams): Promise<QuestionsResponse> => {
    
    try {
      const response = await api.get('/questoes', {
        params: {
          page: params.page,
          disciplina: params.disciplina,
          ano: params.ano,
          shuffle: true
        }
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.log('[QUESTIONS] Erro ao buscar questões: ', error.message);
      
      return {
        success: false,
        message: error.response?.data?.message || `Erro de conexão: ${error.message}`,
      };
    }
  }
};

export default questionsService;