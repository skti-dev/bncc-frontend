import api from './api';

export interface ResultData {
  disciplina: string;
  ano: number;
  respostas: QuestionResult[];
  pontuacao: number;
  total_questoes: number;
}

export interface QuestionResult {
  questao_id: string;
  codigo: string;
  resposta_dada: string;
  gabarito: string;
  acertou: boolean;
}

export interface ResultsResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export const resultsService = {
  submitResults: async (resultData: ResultData): Promise<ResultsResponse> => {
    try {

      console.log('[RESULTS] Enviando resultados: ', resultData);

      const response = await api.put('/resultados', resultData);

      console.log('[RESULTS] Resposta recebida: ', response.data);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.log('[RESULTS] Erro ao enviar resultados: ', error.message);
      console.log('[RESULTS] Código do erro:', error.code);
      
      return {
        success: false,
        message: error.response?.data?.message || `Erro de conexão: ${error.message}`,
      };
    }
  }
};

export default resultsService;