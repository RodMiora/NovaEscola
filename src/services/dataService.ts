import { createClient } from '@vercel/kv';
import { Aluno, Video, VideosLiberados } from '../hooks/types';

// Variável para armazenar a instância do cliente KV
let kvClient: ReturnType<typeof createClient> | null = null;

// Função para inicializar o cliente KV de forma lazy
function getKVClient(): ReturnType<typeof createClient> {
  if (!kvClient) {
    // Fallback para desenvolvimento/teste
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.warn('⚠️ Variáveis KV não encontradas, usando cliente mock');
      // Retornar um cliente mock ou usar localStorage/arquivo
      throw new Error('KV não configurado - verifique as variáveis de ambiente no Vercel');
    }
    
    kvClient = createClient({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
  }
  return kvClient;
}

// Chaves para o KV store
const KEYS = {
  ALUNOS: 'escola:alunos',
  VIDEOS: 'escola:videos',
  VIDEOS_LIBERADOS: 'escola:videos_liberados',
  LAST_UPDATED: 'escola:last_updated'
} as const;

export class DataService {
  // ========== ALUNOS ==========
  static async getAlunos(): Promise<Aluno[]> {
    try {
      const kv = getKVClient();
      const alunos = await kv.get<Aluno[]>(KEYS.ALUNOS);
      // Garantir que sempre retorna um array válido
      return Array.isArray(alunos) ? alunos : [];
    } catch (error) {
      console.error('Erro ao buscar alunos:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  static async saveAlunos(alunos: Aluno[]): Promise<void> {
    try {
      // Validar que é um array antes de salvar
      if (!Array.isArray(alunos)) {
        throw new Error('Dados de alunos devem ser um array');
      }
      const kv = getKVClient();
      await kv.set(KEYS.ALUNOS, alunos);
      await kv.set(KEYS.LAST_UPDATED, Date.now());
    } catch (error) {
      console.error('Erro ao salvar alunos:', error);
      throw error;
    }
  }

  static async adicionarAluno(novoAluno: Omit<Aluno, 'id'>): Promise<Aluno> {
    try {
      const alunos = await this.getAlunos();
      
      // Gerar ID único
      const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
      
      const alunoCompleto: Aluno = {
        ...novoAluno,
        id
      };
      
      alunos.push(alunoCompleto);
      await this.saveAlunos(alunos);
      
      return alunoCompleto;
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      throw error;
    }
  }

  static async atualizarAluno(id: string, dadosAtualizados: Partial<Aluno>): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const index = alunos.findIndex(aluno => aluno.id === id);
      
      if (index === -1) {
        throw new Error(`Aluno com ID ${id} não encontrado`);
      }
      
      alunos[index] = { ...alunos[index], ...dadosAtualizados };
      await this.saveAlunos(alunos);
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  }

  static async removerAluno(id: string): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const alunosFiltrados = alunos.filter(aluno => aluno.id !== id);
      
      if (alunosFiltrados.length === alunos.length) {
        throw new Error(`Aluno com ID ${id} não encontrado`);
      }
      
      await this.saveAlunos(alunosFiltrados);
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      throw error;
    }
  }

  // ========== VÍDEOS ==========
  static async getVideos(): Promise<Video[]> {
    try {
      const kv = getKVClient();
      const videos = await kv.get<Video[]>(KEYS.VIDEOS);
      return Array.isArray(videos) ? videos : [];
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      return [];
    }
  }

  static async saveVideos(videos: Video[]): Promise<void> {
    try {
      if (!Array.isArray(videos)) {
        throw new Error('Dados de vídeos devem ser um array');
      }
      const kv = getKVClient();
      await kv.set(KEYS.VIDEOS, videos);
      await kv.set(KEYS.LAST_UPDATED, Date.now());
    } catch (error) {
      console.error('Erro ao salvar vídeos:', error);
      throw error;
    }
  }

  static async adicionarVideo(novoVideo: Video): Promise<void> {
    try {
      const videos = await this.getVideos();
      videos.push(novoVideo);
      await this.saveVideos(videos);
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      throw error;
    }
  }

  static async atualizarVideo(id: number, videoAtualizado: Video): Promise<void> {
    try {
      const videos = await this.getVideos();
      const index = videos.findIndex(video => video.id === id);
      
      if (index === -1) {
        throw new Error(`Vídeo com ID ${id} não encontrado`);
      }
      
      videos[index] = videoAtualizado;
      await this.saveVideos(videos);
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  static async removerVideo(id: number): Promise<void> {
    try {
      const videos = await this.getVideos();
      const videosFiltrados = videos.filter(video => video.id !== id);
      
      if (videosFiltrados.length === videos.length) {
        throw new Error(`Vídeo com ID ${id} não encontrado`);
      }
      
      await this.saveVideos(videosFiltrados);
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      throw error;
    }
  }

  // ========== VÍDEOS LIBERADOS ==========
  static async getVideosLiberados(): Promise<VideosLiberados> {
    try {
      const kv = getKVClient();
      const videosLiberados = await kv.get<VideosLiberados>(KEYS.VIDEOS_LIBERADOS);
      return videosLiberados || {};
    } catch (error) {
      console.error('Erro ao buscar vídeos liberados:', error);
      return {};
    }
  }

  static async saveVideosLiberados(videosLiberados: VideosLiberados): Promise<void> {
    try {
      const kv = getKVClient();
      await kv.set(KEYS.VIDEOS_LIBERADOS, videosLiberados);
      await kv.set(KEYS.LAST_UPDATED, Date.now());
    } catch (error) {
      console.error('Erro ao salvar vídeos liberados:', error);
      throw error;
    }
  }

  static async setPermissoesVideosAluno(alunoId: string, videoIds: number[]): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      videosLiberados[alunoId] = videoIds;
      await this.saveVideosLiberados(videosLiberados);
    } catch (error) {
      console.error('Erro ao definir permissões de vídeos:', error);
      throw error;
    }
  }

  static async liberarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      
      if (!videosLiberados[alunoId]) {
        videosLiberados[alunoId] = [];
      }
      
      if (!videosLiberados[alunoId].includes(videoId)) {
        videosLiberados[alunoId].push(videoId);
        await this.saveVideosLiberados(videosLiberados);
      }
    } catch (error) {
      console.error('Erro ao liberar vídeo para aluno:', error);
      throw error;
    }
  }

  static async revogarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      
      if (videosLiberados[alunoId]) {
        videosLiberados[alunoId] = videosLiberados[alunoId].filter(id => id !== videoId);
        await this.saveVideosLiberados(videosLiberados);
      }
    } catch (error) {
      console.error('Erro ao revogar vídeo para aluno:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========
  static async getLastUpdated(): Promise<number> {
    try {
      const kv = getKVClient();
      const lastUpdated = await kv.get<number>(KEYS.LAST_UPDATED);
      return lastUpdated || 0;
    } catch (error) {
      console.error('Erro ao buscar última atualização:', error);
      return 0;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const kv = getKVClient();
      await Promise.all([
        kv.del(KEYS.ALUNOS),
        kv.del(KEYS.VIDEOS),
        kv.del(KEYS.VIDEOS_LIBERADOS),
        kv.del(KEYS.LAST_UPDATED)
      ]);
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
      throw error;
    }
  }
}