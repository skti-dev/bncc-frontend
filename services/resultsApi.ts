import api from './api';

export interface ResultData {
  disciplina: string;
  ano: number;
  email: string;
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

export interface MeuResultado {
  id: string;
  email: string;
  disciplina: string;
  ano: number;
  respostas: QuestionResult[];
  pontuacao: number;
  total_questoes: number;
  percentual_acerto: number;
  created_at: string;
  updated_at: string;
}

export interface MeusResultadosData {
  total: number;
  totalPages: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
  data: MeuResultado[];
}

export interface MeusResultadosResponse {
  success: boolean;
  data?: MeusResultadosData;
  message?: string;
}

export interface GetMeusResultadosParams {
  page: number;
  email: string;
}

export interface ResultsResponse {
  success: boolean;
  data?: any;
  message?: string;
}

export interface ResultadoDetalhado {
  id: string;
  disciplina: string;
  ano: number;
  respostas: QuestionResult[];
  pontuacao: number;
  total_questoes: number;
  percentual_acerto: number;
  created_at: string;
  updated_at: string;
}

export interface ResultadoDetalhadoResponse {
  success: boolean;
  data?: ResultadoDetalhado;
  message?: string;
}

export const resultsService = {
  submitResults: async (resultData: ResultData): Promise<ResultsResponse> => {
    try {
      const response = await api.put('/resultados', resultData);

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
  },

  getMeusResultados: async (params: GetMeusResultadosParams): Promise<MeusResultadosResponse> => {
    try {
      const response = await api.get('/resultados', {
        params: {
          page: params.page,
          email: params.email,
        },
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.log('[RESULTS] Erro ao buscar meus resultados: ', error.message);
      console.log('[RESULTS] Código do erro:', error.code);
      
      return {
        success: false,
        message: error.response?.data?.message || `Erro de conexão: ${error.message}`,
      };
    }
  },

  getResultadoDetalhado: async (id: string): Promise<ResultadoDetalhadoResponse> => {
    try {
      const response = await api.get(`/resultados/${id}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error: any) {
      console.log('[RESULTS] Erro ao buscar resultado detalhado: ', error.message);
      console.log('[RESULTS] Código do erro:', error.code);
      
      return {
        success: false,
        message: error.response?.data?.message || `Erro de conexão: ${error.message}`,
      };
    }
  }
};

export default resultsService;