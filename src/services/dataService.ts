import { createClient } from 'redis';
import { Aluno, Video, VideosLiberados } from '../hooks/types';

// Variável para armazenar a instância do cliente Redis
let redisClient: ReturnType<typeof createClient> | null = null;

// Função para inicializar o cliente Redis de forma lazy
function getRedisClient(): ReturnType<typeof createClient> {
  if (!redisClient) {
    console.log('🔍 Verificando variáveis de ambiente Redis:');
    console.log('KV_REST_API_URL:', process.env.KV_REST_API_URL ? 'Definida' : 'Não definida');
    console.log('KV_REST_API_TOKEN:', process.env.KV_REST_API_TOKEN ? 'Definida' : 'Não definida');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      throw new Error('❌ Variáveis KV_REST_API_URL e KV_REST_API_TOKEN são obrigatórias');
    }
    
    // Configurar cliente Redis para Redis Cloud com TLS habilitado
    redisClient = createClient({
      url: process.env.KV_REST_API_URL.replace('redis://', 'rediss://'),
      password: process.env.KV_REST_API_TOKEN
    });
    
    // Conectar ao Redis
    redisClient.connect().catch(console.error);
    
    console.log('✅ Cliente Redis inicializado com sucesso');
  }
  
  return redisClient;
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
      const redis = getRedisClient();
      const alunosStr = await redis.get(KEYS.ALUNOS);
      const alunos = alunosStr ? JSON.parse(alunosStr) : [];
      // Garantir que sempre retorna um array válido
      return Array.isArray(alunos) ? alunos : [];
    } catch (error) {
      console.error('❌ Erro ao buscar alunos:', error);
      // Retornar array vazio em caso de erro
      return [];
    }
  }

  static async saveAlunos(alunos: Aluno[]): Promise<void> {
    if (!Array.isArray(alunos)) {
      throw new Error('❌ Dados inválidos: esperado array de alunos');
    }

    try {
      const redis = getRedisClient();
      await redis.set(KEYS.ALUNOS, JSON.stringify(alunos));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ Alunos salvos com sucesso no Redis');
    } catch (error) {
      console.error('❌ Erro ao salvar alunos:', error);
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
      const redis = getRedisClient();
      const videosStr = await redis.get(KEYS.VIDEOS);
      const videos = videosStr ? JSON.parse(videosStr) : [];
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
      const redis = getRedisClient();
      await redis.set(KEYS.VIDEOS, JSON.stringify(videos));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
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
      const redis = getRedisClient();
      const videosLiberadosStr = await redis.get(KEYS.VIDEOS_LIBERADOS);
      const videosLiberados = videosLiberadosStr ? JSON.parse(videosLiberadosStr) : {};
      return videosLiberados || {};
    } catch (error) {
      console.error('Erro ao buscar vídeos liberados:', error);
      return {};
    }
  }

  static async saveVideosLiberados(videosLiberados: VideosLiberados): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.set(KEYS.VIDEOS_LIBERADOS, JSON.stringify(videosLiberados));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
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
  static async getLastUpdated(): Promise<string> {
    try {
      const redis = getRedisClient();
      const lastUpdated = await redis.get(KEYS.LAST_UPDATED);
      return lastUpdated || new Date().toISOString();
    } catch (error) {
      console.error('Erro ao buscar última atualização:', error);
      return new Date().toISOString();
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const redis = getRedisClient();
      await Promise.all([
        redis.del(KEYS.ALUNOS),
        redis.del(KEYS.VIDEOS),
        redis.del(KEYS.VIDEOS_LIBERADOS),
        redis.del(KEYS.LAST_UPDATED)
      ]);
      console.log('✅ Todos os dados foram limpos');
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      throw error;
    }
  }
}