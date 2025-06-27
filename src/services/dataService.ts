import { createClient } from '@vercel/kv';
import { Aluno, Video, VideosLiberados } from '../hooks/types';

// Debug temporário - remover após resolver
console.log('Variáveis KV disponíveis:', {
  KV_REST_API_URL: !!process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
  KVRESTAPIURL: !!process.env.KVRESTAPIURL,
  KVRESTAPITOKEN: !!process.env.KVRESTAPITOKEN,
  NODE_ENV: process.env.NODE_ENV,
});

// Configuração manual do cliente KV
const kv = createClient({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

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
      
      // Gera o próximo ID sequencial
      const proximoId = alunos.length > 0 ? 
        (Math.max(...alunos.map(a => parseInt(a.id) || 0)) + 1) : 1;
      const novoId = proximoId.toString().padStart(2, '0');
      
      const alunoCompleto: Aluno = {
        ...novoAluno,
        id: novoId
      };
      
      const alunosAtualizados = [...alunos, alunoCompleto];
      await this.saveAlunos(alunosAtualizados);
      
      return alunoCompleto;
    } catch (error) {
      console.error('Erro ao adicionar aluno:', error);
      throw error;
    }
  }

  static async atualizarAluno(alunoId: string, novosDados: Partial<Aluno>): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const indiceAluno = alunos.findIndex(aluno => aluno.id === alunoId);
      
      if (indiceAluno === -1) {
        throw new Error(`Aluno com ID ${alunoId} não encontrado`);
      }
      
      alunos[indiceAluno] = { ...alunos[indiceAluno], ...novosDados };
      await this.saveAlunos(alunos);
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error;
    }
  }

  static async removerAluno(alunoId: string): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const alunosAtualizados = alunos.filter(aluno => aluno.id !== alunoId);
      await this.saveAlunos(alunosAtualizados);
    } catch (error) {
      console.error('Erro ao remover aluno:', error);
      throw error;
    }
  }

  // ========== VÍDEOS ==========
  static async getVideos(): Promise<Video[]> {
    try {
      const videos = await kv.get<Video[]>(KEYS.VIDEOS);
      // Garantir que sempre retorna um array válido
      return Array.isArray(videos) ? videos : [];
    } catch (error) {
      console.error('Erro ao buscar vídeos:', error);
      return [];
    }
  }

  static async saveVideos(videos: Video[]): Promise<void> {
    try {
      // Validar que é um array antes de salvar
      if (!Array.isArray(videos)) {
        throw new Error('Dados de vídeos devem ser um array');
      }
      await kv.set(KEYS.VIDEOS, videos);
      await kv.set(KEYS.LAST_UPDATED, Date.now());
    } catch (error) {
      console.error('Erro ao salvar vídeos:', error);
      throw error;
    }
  }

  static async adicionarVideo(novoVideo: Omit<Video, 'id'>): Promise<Video> {
    try {
      const videos = await this.getVideos();
      
      // Gera o próximo ID sequencial
      const proximoId = videos.length > 0 ? 
        (Math.max(...videos.map(v => v.id)) + 1) : 1;
      
      const videoCompleto: Video = {
        ...novoVideo,
        id: proximoId
      };
      
      const videosAtualizados = [...videos, videoCompleto];
      await this.saveVideos(videosAtualizados);
      
      return videoCompleto;
    } catch (error) {
      console.error('Erro ao adicionar vídeo:', error);
      throw error;
    }
  }

  static async atualizarVideo(videoId: number, novosDados: Partial<Video>): Promise<void> {
    try {
      const videos = await this.getVideos();
      const indiceVideo = videos.findIndex(video => video.id === videoId);
      
      if (indiceVideo === -1) {
        throw new Error(`Vídeo com ID ${videoId} não encontrado`);
      }
      
      videos[indiceVideo] = { ...videos[indiceVideo], ...novosDados };
      await this.saveVideos(videos);
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  static async removerVideo(videoId: number): Promise<void> {
    try {
      const videos = await this.getVideos();
      const videosAtualizados = videos.filter(video => video.id !== videoId);
      await this.saveVideos(videosAtualizados);
    } catch (error) {
      console.error('Erro ao remover vídeo:', error);
      throw error;
    }
  }

  // ========== VÍDEOS LIBERADOS ==========
  static async getVideosLiberados(): Promise<VideosLiberados> {
    try {
      const videosLiberados = await kv.get<VideosLiberados>(KEYS.VIDEOS_LIBERADOS);
      // Garantir que sempre retorna um objeto válido
      return videosLiberados && typeof videosLiberados === 'object' && !Array.isArray(videosLiberados) 
        ? videosLiberados 
        : {};
    } catch (error) {
      console.error('Erro ao buscar vídeos liberados:', error);
      return {};
    }
  }

  static async saveVideosLiberados(videosLiberados: VideosLiberados): Promise<void> {
    try {
      // Validar que é um objeto antes de salvar
      if (!videosLiberados || typeof videosLiberados !== 'object' || Array.isArray(videosLiberados)) {
        throw new Error('Dados de vídeos liberados devem ser um objeto');
      }
      await kv.set(KEYS.VIDEOS_LIBERADOS, videosLiberados);
      await kv.set(KEYS.LAST_UPDATED, Date.now());
    } catch (error) {
      console.error('Erro ao salvar vídeos liberados:', error);
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

  static async removerVideoLiberadoDoAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      
      if (videosLiberados[alunoId]) {
        videosLiberados[alunoId] = videosLiberados[alunoId].filter(id => id !== videoId);
        
        // Remove a entrada do aluno se não tiver mais vídeos liberados
        if (videosLiberados[alunoId].length === 0) {
          delete videosLiberados[alunoId];
        }
        
        await this.saveVideosLiberados(videosLiberados);
      }
    } catch (error) {
      console.error('Erro ao remover vídeo liberado do aluno:', error);
      throw error;
    }
  }

  static async getVideosLiberadosParaAluno(alunoId: string): Promise<number[]> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      return videosLiberados[alunoId] || [];
    } catch (error) {
      console.error('Erro ao buscar vídeos liberados para aluno:', error);
      return [];
    }
  }

  // ========== MÉTODOS ADICIONAIS ==========
  static async setPermissoesVideosAluno(alunoId: string, videoIds: number[]): Promise<void> {
    try {
      const videosLiberados = await this.getVideosLiberados();
      videosLiberados[alunoId] = videoIds;
      await this.saveVideosLiberados(videosLiberados);
    } catch (error) {
      console.error('Erro ao definir permissões de vídeos para aluno:', error);
      throw error;
    }
  }

  static async revogarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      await this.removerVideoLiberadoDoAluno(alunoId, videoId);
    } catch (error) {
      console.error('Erro ao revogar vídeo para aluno:', error);
      throw error;
    }
  }

  static async migrateFromLocalStorage(): Promise<void> {
    try {
      // Verifica se já existe dados no KV
      const existingData = await this.getAllData();
      if (existingData.alunos.length > 0 || existingData.videos.length > 0) {
        console.log('Dados já existem no KV, pulando migração');
        return;
      }

      // Tenta migrar dados do localStorage se existirem
      if (typeof window !== 'undefined') {
        const localAlunos = localStorage.getItem('alunos');
        const localVideos = localStorage.getItem('videos');
        const localVideosLiberados = localStorage.getItem('videosLiberados');

        if (localAlunos || localVideos || localVideosLiberados) {
          const alunos = localAlunos ? JSON.parse(localAlunos) : [];
          const videos = localVideos ? JSON.parse(localVideos) : [];
          const videosLiberados = localVideosLiberados ? JSON.parse(localVideosLiberados) : {};

          await this.syncData({ alunos, videos, videosLiberados });
          console.log('Migração do localStorage concluída');
        }
      }
    } catch (error) {
      console.error('Erro na migração do localStorage:', error);
      // Não lança erro para não quebrar a aplicação
    }
  }

  // ========== UTILITÁRIOS ==========
  static async getLastUpdated(): Promise<number> {
    try {
      const lastUpdated = await kv.get<number>(KEYS.LAST_UPDATED);
      return lastUpdated || 0;
    } catch (error) {
      console.error('Erro ao buscar última atualização:', error);
      return 0;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      await Promise.all([
        kv.del(KEYS.ALUNOS),
        kv.del(KEYS.VIDEOS),
        kv.del(KEYS.VIDEOS_LIBERADOS),
        kv.del(KEYS.LAST_UPDATED)
      ]);
    } catch (error) {
      console.error('Erro ao limpar todos os dados:', error);
      throw error;
    }
  }

  // ========== SINCRONIZAÇÃO ==========
  static async syncData(localData: {
    alunos: Aluno[];
    videos: Video[];
    videosLiberados: VideosLiberados;
  }): Promise<void> {
    try {
      await Promise.all([
        this.saveAlunos(localData.alunos),
        this.saveVideos(localData.videos),
        this.saveVideosLiberados(localData.videosLiberados)
      ]);
    } catch (error) {
      console.error('Erro ao sincronizar dados:', error);
      throw error;
    }
  }

  static async getAllData(): Promise<{
    alunos: Aluno[];
    videos: Video[];
    videosLiberados: VideosLiberados;
    lastUpdated: number;
  }> {
    try {
      const [alunos, videos, videosLiberados, lastUpdated] = await Promise.all([
        this.getAlunos(),
        this.getVideos(),
        this.getVideosLiberados(),
        this.getLastUpdated()
      ]);
      
      return {
        alunos,
        videos,
        videosLiberados,
        lastUpdated
      };
    } catch (error) {
      console.error('Erro ao buscar todos os dados:', error);
      throw error;
    }
  }
}