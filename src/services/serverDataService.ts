import { Redis } from '@upstash/redis';
import { Aluno, Video, VideosLiberados } from '../hooks/types';

// Função para verificar se o Redis está configurado no servidor
function isRedisConfigured(): boolean {
  return !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

// Função para obter a instância do Redis (apenas no servidor)
function getRedisClient(): Redis | null {
  console.log('🔍 [ServerDataService] Verificando variáveis de ambiente Upstash:');
  console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Definida' : 'Não definida');
  console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Definida' : 'Não definida');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  if (!isRedisConfigured()) {
    console.warn('⚠️ [ServerDataService] Variáveis de ambiente do Upstash não configuradas!');
    return null;
  }
  
  try {
    // Criar cliente Redis usando Upstash (API REST)
    const redis = Redis.fromEnv();
    console.log('✅ [ServerDataService] Cliente Upstash Redis inicializado com sucesso');
    return redis;
  } catch (error) {
    console.error('❌ [ServerDataService] Erro ao inicializar Redis:', error);
    return null;
  }
}

// Chaves para o KV store
const KEYS = {
  ALUNOS: 'escola:alunos',
  VIDEOS: 'escola:videos',
  VIDEOS_LIBERADOS: 'escola:videos_liberados',
  LAST_UPDATED: 'escola:last_updated'
} as const;

export class ServerDataService {
  // ========== ALUNOS ==========
  static async getAlunos(): Promise<Aluno[]> {
    try {
      console.log('🔍 [ServerDataService.getAlunos] Iniciando busca de alunos...');
      const redis = getRedisClient();
      
      if (!redis) {
        console.warn('⚠️ [ServerDataService.getAlunos] Redis não configurado, retornando array vazio');
        return [];
      }
      
      const redisResponse = await redis.get(KEYS.ALUNOS);
      
      if (!redisResponse) {
        console.log('⚠️ [ServerDataService.getAlunos] Nenhum dado encontrado no Redis');
        return [];
      }
      
      // Processar resposta do Upstash Redis
      let alunos: any;
      if (typeof redisResponse === 'string') {
        alunos = JSON.parse(redisResponse);
      } else {
        alunos = redisResponse;
      }
      
      const resultado = Array.isArray(alunos) ? alunos : [];
      console.log('✅ [ServerDataService.getAlunos] Retornando', resultado.length, 'alunos');
      return resultado;
    } catch (error) {
      console.error('❌ [ServerDataService.getAlunos] Erro ao buscar alunos:', error);
      return [];
    }
  }

  static async saveAlunos(alunos: Aluno[]): Promise<void> {
    try {
      console.log('🔍 [ServerDataService.saveAlunos] Iniciando salvamento de', alunos.length, 'alunos...');
      const redis = getRedisClient();
      
      if (!redis) {
        console.warn('⚠️ [ServerDataService.saveAlunos] Redis não configurado');
        throw new Error('Redis não configurado no servidor');
      }
      
      // Limpar dados não serializáveis antes de salvar
      const alunosLimpos = alunos.map(aluno => ({
        ...aluno,
        videosLiberados: Array.isArray(aluno.videosLiberados) ? aluno.videosLiberados : []
      }));
      
      await redis.set(KEYS.ALUNOS, JSON.stringify(alunosLimpos));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ [ServerDataService.saveAlunos] Alunos salvos com sucesso no Redis');
    } catch (error) {
      console.error('❌ [ServerDataService.saveAlunos] Erro ao salvar alunos:', error);
      throw error;
    }
  }

  static async adicionarAluno(aluno: Aluno): Promise<Aluno> {
    try {
      console.log('🔍 [ServerDataService.adicionarAluno] Iniciando adição do aluno:', aluno.nome || aluno.name);
      const alunos = await this.getAlunos();
      
      // Garantir que o aluno tenha propriedades serializáveis
      const alunoLimpo = {
        ...aluno,
        videosLiberados: aluno.videosLiberados || []
      };
      
      alunos.push(alunoLimpo);
      await this.saveAlunos(alunos);
      console.log('✅ [ServerDataService.adicionarAluno] Aluno adicionado com sucesso');
      
      return alunoLimpo;
    } catch (error) {
      console.error('❌ [ServerDataService.adicionarAluno] Erro ao adicionar aluno:', error);
      throw error;
    }
  }

  static async atualizarAluno(id: string, dadosAtualizados: Partial<Aluno>): Promise<Aluno> {
    try {
      const alunos = await this.getAlunos();
      const index = alunos.findIndex(aluno => aluno.id === id);
      
      if (index === -1) {
        throw new Error(`Aluno com ID ${id} não encontrado`);
      }
      
      alunos[index] = { ...alunos[index], ...dadosAtualizados };
      await this.saveAlunos(alunos);
      console.log(`✅ [ServerDataService] Aluno ${id} atualizado com sucesso`);
      
      return alunos[index];
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao atualizar aluno:', error);
      throw error;
    }
  }

  static async removerAluno(id: string): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const index = alunos.findIndex(aluno => aluno.id === id);
      
      if (index === -1) {
        throw new Error(`Aluno com ID ${id} não encontrado`);
      }
      
      alunos.splice(index, 1);
      await this.saveAlunos(alunos);
      console.log(`✅ [ServerDataService] Aluno ${id} removido com sucesso`);
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao remover aluno:', error);
      throw error;
    }
  }

  // ========== VIDEOS ==========
  static async getVideos(): Promise<Video[]> {
    try {
      const redis = getRedisClient();
      
      if (!redis) {
        console.warn('⚠️ [ServerDataService.getVideos] Redis não configurado');
        return [];
      }
      
      const videosStr = await redis.get(KEYS.VIDEOS);
      const videos = videosStr ? JSON.parse(videosStr as string) : [];
      return Array.isArray(videos) ? videos : [];
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao buscar vídeos:', error);
      return [];
    }
  }

  static async saveVideos(videos: Video[]): Promise<void> {
    try {
      const redis = getRedisClient();
      
      if (!redis) {
        console.warn('⚠️ [ServerDataService.saveVideos] Redis não configurado');
        throw new Error('Redis não configurado no servidor');
      }
      
      await redis.set(KEYS.VIDEOS, JSON.stringify(videos));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ [ServerDataService] Vídeos salvos no Redis');
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao salvar vídeos:', error);
      throw error;
    }
  }

  static async adicionarVideo(video: Video): Promise<void> {
    try {
      const videos = await this.getVideos();
      videos.push(video);
      await this.saveVideos(videos);
      console.log('✅ [ServerDataService] Vídeo adicionado com sucesso');
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao adicionar vídeo:', error);
      throw error;
    }
  }

  static async atualizarVideo(id: number, dadosAtualizados: Partial<Video>): Promise<void> {
    try {
      const videos = await this.getVideos();
      const index = videos.findIndex(video => video.id === id);
      
      if (index === -1) {
        throw new Error(`Vídeo com ID ${id} não encontrado`);
      }
      
      videos[index] = { ...videos[index], ...dadosAtualizados };
      await this.saveVideos(videos);
      console.log(`✅ [ServerDataService] Vídeo ${id} atualizado com sucesso`);
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao atualizar vídeo:', error);
      throw error;
    }
  }

  static async removerVideo(id: number): Promise<void> {
    try {
      const videos = await this.getVideos();
      const index = videos.findIndex(video => video.id === id);
      
      if (index === -1) {
        throw new Error(`Vídeo com ID ${id} não encontrado`);
      }
      
      videos.splice(index, 1);
      await this.saveVideos(videos);
      console.log(`✅ [ServerDataService] Vídeo ${id} removido com sucesso`);
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao remover vídeo:', error);
      throw error;
    }
  }

  // ========== VIDEOS LIBERADOS ==========
  static async getVideosLiberados(): Promise<VideosLiberados> {
    try {
      const redis = getRedisClient();
      
      if (!redis) {
        console.warn('⚠️ [ServerDataService.getVideosLiberados] Redis não configurado');
        return {};
      }
      
      const videosStr = await redis.get(KEYS.VIDEOS_LIBERADOS);
      
      if (!videosStr) {
        return {};
      }
      
      return JSON.parse(videosStr as string);
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao buscar vídeos liberados:', error);
      return {};
    }
  }

  static async saveVideosLiberados(videos: VideosLiberados): Promise<void> {
    try {
      const redis = getRedisClient();
      
      if (!redis) {
        console.warn('⚠️ [ServerDataService.saveVideosLiberados] Redis não configurado');
        throw new Error('Redis não configurado no servidor');
      }
      
      await redis.set(KEYS.VIDEOS_LIBERADOS, JSON.stringify(videos));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ [ServerDataService] Vídeos liberados salvos no Redis');
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao salvar vídeos liberados:', error);
      throw error;
    }
  }

  static async liberarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const alunoIndex = alunos.findIndex(aluno => aluno.id === alunoId);
      
      if (alunoIndex === -1) {
        throw new Error(`Aluno com ID ${alunoId} não encontrado`);
      }
      
      if (!alunos[alunoIndex].videosLiberados.includes(videoId)) {
        alunos[alunoIndex].videosLiberados.push(videoId);
        await this.saveAlunos(alunos);
      }
      
      console.log(`✅ [ServerDataService] Vídeo ${videoId} liberado para aluno ${alunoId}`);
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao liberar vídeo para aluno:', error);
      throw error;
    }
  }

  static async revogarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const alunoIndex = alunos.findIndex(aluno => aluno.id === alunoId);
      
      if (alunoIndex === -1) {
        throw new Error(`Aluno com ID ${alunoId} não encontrado`);
      }
      
      const videoIndex = alunos[alunoIndex].videosLiberados.indexOf(videoId);
      if (videoIndex > -1) {
        alunos[alunoIndex].videosLiberados.splice(videoIndex, 1);
        await this.saveAlunos(alunos);
      }
      
      console.log(`✅ [ServerDataService] Vídeo ${videoId} revogado para aluno ${alunoId}`);
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao revogar vídeo para aluno:', error);
      throw error;
    }
  }

  static async setPermissoesVideosAluno(alunoId: string, videosLiberados: number[]): Promise<void> {
    try {
      console.log(`🎯 [ServerDataService.setPermissoesVideosAluno] Definindo permissões para aluno ${alunoId}:`, videosLiberados);
      
      // Verificar se Redis está configurado
      const redis = getRedisClient();
      if (!redis) {
        throw new Error('Redis não configurado');
      }
      
      console.log(`📋 [ServerDataService] Buscando alunos existentes...`);
      const alunos = await this.getAlunos();
      console.log(`📋 [ServerDataService] Encontrados ${alunos.length} alunos`);
      
      const alunoIndex = alunos.findIndex(aluno => aluno.id === alunoId);
      
      if (alunoIndex === -1) {
        console.error(`❌ [ServerDataService] Aluno com ID ${alunoId} não encontrado. Alunos disponíveis:`, alunos.map(a => a.id));
        throw new Error(`Aluno com ID ${alunoId} não encontrado`);
      }
      
      console.log(`📝 [ServerDataService] Atualizando aluno ${alunoId} com vídeos:`, videosLiberados);
      alunos[alunoIndex].videosLiberados = videosLiberados;
      await this.saveAlunos(alunos);
      console.log(`✅ [ServerDataService] Alunos salvos com sucesso`);
      
      console.log(`📝 [ServerDataService] Atualizando cache de vídeos liberados...`);
      const videosLiberadosCache = await this.getVideosLiberados();
      console.log(`📋 [ServerDataService] Cache atual:`, videosLiberadosCache);
      videosLiberadosCache[alunoId] = videosLiberados;
      await this.saveVideosLiberados(videosLiberadosCache);
      console.log(`✅ [ServerDataService] Cache de vídeos liberados atualizado`);
      
      // Verificar se foi salvo corretamente
      const verificacao = await this.getVideosLiberados();
      console.log(`🔍 [ServerDataService] Verificação - dados salvos:`, verificacao);
      
      console.log(`✅ [ServerDataService] Permissões de vídeos definidas para aluno ${alunoId}`);
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao definir permissões de vídeos:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========
  static async getLastUpdated(): Promise<string> {
    try {
      const redis = getRedisClient();
      
      if (!redis) {
        return new Date().toISOString();
      }
      
      const lastUpdated = await redis.get(KEYS.LAST_UPDATED);
      return lastUpdated as string || new Date().toISOString();
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao buscar última atualização:', error);
      return new Date().toISOString();
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      const redis = getRedisClient();
      
      if (!redis) {
        console.warn('⚠️ [ServerDataService.clearAllData] Redis não configurado');
        throw new Error('Redis não configurado no servidor');
      }
      
      await Promise.all([
        redis.del(KEYS.ALUNOS),
        redis.del(KEYS.VIDEOS),
        redis.del(KEYS.VIDEOS_LIBERADOS),
        redis.del(KEYS.LAST_UPDATED)
      ]);
      console.log('✅ [ServerDataService] Todos os dados foram limpos do Redis');
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao limpar dados:', error);
      throw error;
    }
  }

  // ========== STATUS ==========
  static isRedisAvailable(): boolean {
    return isRedisConfigured();
  }

  static async testConnection(): Promise<boolean> {
    try {
      const redis = getRedisClient();
      if (!redis) return false;
      
      await redis.set('test:connection', 'ok');
      const result = await redis.get('test:connection');
      await redis.del('test:connection');
      
      return result === 'ok';
    } catch (error) {
      console.error('❌ [ServerDataService] Erro ao testar conexão:', error);
      return false;
    }
  }
}