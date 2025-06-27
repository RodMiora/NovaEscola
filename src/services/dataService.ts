import { Redis } from '@upstash/redis';
import { Aluno, Video, VideosLiberados } from '../hooks/types';

// Função para obter a instância do Redis (usando Upstash)
function getRedisClient(): Redis {
  console.log('🔍 Verificando variáveis de ambiente Upstash:');
  console.log('UPSTASH_REDIS_REST_URL:', process.env.UPSTASH_REDIS_REST_URL ? 'Definida' : 'Não definida');
  console.log('UPSTASH_REDIS_REST_TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN ? 'Definida' : 'Não definida');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Criar cliente Redis usando Upstash (API REST)
  const redis = Redis.fromEnv();
  
  console.log('✅ Cliente Upstash Redis inicializado com sucesso');
  return redis;
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
      
      if (!alunosStr) {
        return [];
      }
      
      // Garantir que é uma string antes de fazer parse
      const alunosData = typeof alunosStr === 'string' ? alunosStr : String(alunosStr);
      const alunos = JSON.parse(alunosData);
      
      // Garantir que sempre retorna um array válido
      return Array.isArray(alunos) ? alunos : [];
    } catch (error) {
      console.error('❌ Erro ao buscar alunos:', error);
      return [];
    }
  }

  static async saveAlunos(alunos: Aluno[]): Promise<void> {
    try {
      const redis = getRedisClient();
      
      // Limpar dados não serializáveis antes de salvar
      const alunosLimpos = alunos.map(aluno => ({
        ...aluno,
        // Garantir que videosLiberados seja sempre um array
        videosLiberados: Array.isArray(aluno.videosLiberados) ? aluno.videosLiberados : []
      }));
      
      const alunosJson = JSON.stringify(alunosLimpos);
      await redis.set(KEYS.ALUNOS, alunosJson);
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ Alunos salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar alunos:', error);
      throw error;
    }
  }

  static async adicionarAluno(aluno: Aluno): Promise<Aluno> {
    try {
      const alunos = await this.getAlunos();
      
      // Garantir que o aluno tenha propriedades serializáveis
      const alunoLimpo = {
        ...aluno,
        // Garantir que videosLiberados seja sempre um array
        videosLiberados: aluno.videosLiberados || [],
        // Remover propriedades undefined
        ...(aluno.email !== undefined && { email: aluno.email }),
        ...(aluno.telefone !== undefined && { telefone: aluno.telefone }),
        ...(aluno.endereco !== undefined && { endereco: aluno.endereco }),
        ...(aluno.dataNascimento !== undefined && { dataNascimento: aluno.dataNascimento }),
        ...(aluno.dataInicioCurso !== undefined && { dataInicioCurso: aluno.dataInicioCurso }),
        ...(aluno.nomePaiMae !== undefined && { nomePaiMae: aluno.nomePaiMae }),
        ...(aluno.telefoneResponsavel !== undefined && { telefoneResponsavel: aluno.telefoneResponsavel })
      };
      
      alunos.push(alunoLimpo);
      await this.saveAlunos(alunos);
      console.log('✅ Aluno adicionado com sucesso');
      
      return alunoLimpo;
    } catch (error) {
      console.error('❌ Erro ao adicionar aluno:', error);
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
      
      // Atualizar o aluno com os novos dados
      alunos[index] = { ...alunos[index], ...dadosAtualizados };
      
      await this.saveAlunos(alunos);
      console.log(`✅ Aluno ${id} atualizado com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao atualizar aluno:', error);
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
      
      // Remover o aluno do array
      alunos.splice(index, 1);
      
      await this.saveAlunos(alunos);
      console.log(`✅ Aluno ${id} removido com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao remover aluno:', error);
      throw error;
    }
  }

  // ========== VIDEOS ==========
  static async getVideos(): Promise<Video[]> {
    try {
      const redis = getRedisClient();
      const videosStr = await redis.get(KEYS.VIDEOS);
      const videos = videosStr ? JSON.parse(videosStr as string) : [];
      return Array.isArray(videos) ? videos : [];
    } catch (error) {
      console.error('❌ Erro ao buscar vídeos:', error);
      return [];
    }
  }

  static async saveVideos(videos: Video[]): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.set(KEYS.VIDEOS, JSON.stringify(videos));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ Vídeos salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar vídeos:', error);
      throw error;
    }
  }

  static async adicionarVideo(video: Video): Promise<void> {
    try {
      const videos = await this.getVideos();
      videos.push(video);
      await this.saveVideos(videos);
      console.log('✅ Vídeo adicionado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao adicionar vídeo:', error);
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
      
      // Atualizar o vídeo com os novos dados
      videos[index] = { ...videos[index], ...dadosAtualizados };
      
      await this.saveVideos(videos);
      console.log(`✅ Vídeo ${id} atualizado com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao atualizar vídeo:', error);
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
      
      // Remover o vídeo do array
      videos.splice(index, 1);
      
      await this.saveVideos(videos);
      console.log(`✅ Vídeo ${id} removido com sucesso`);
    } catch (error) {
      console.error('❌ Erro ao remover vídeo:', error);
      throw error;
    }
  }

  // ========== VIDEOS LIBERADOS ==========
  static async getVideosLiberados(): Promise<VideosLiberados[]> {
    try {
      const redis = getRedisClient();
      const videosStr = await redis.get(KEYS.VIDEOS_LIBERADOS);
      const videos = videosStr ? JSON.parse(videosStr as string) : [];
      return Array.isArray(videos) ? videos : [];
    } catch (error) {
      console.error('❌ Erro ao buscar vídeos liberados:', error);
      return [];
    }
  }

  static async saveVideosLiberados(videos: VideosLiberados[]): Promise<void> {
    try {
      const redis = getRedisClient();
      await redis.set(KEYS.VIDEOS_LIBERADOS, JSON.stringify(videos));
      await redis.set(KEYS.LAST_UPDATED, new Date().toISOString());
      console.log('✅ Vídeos liberados salvos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao salvar vídeos liberados:', error);
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
      
      // Adicionar o vídeo aos vídeos liberados se não estiver já liberado
      if (!alunos[alunoIndex].videosLiberados.includes(videoId)) {
        alunos[alunoIndex].videosLiberados.push(videoId);
        await this.saveAlunos(alunos);
      }
      
      console.log(`✅ Vídeo ${videoId} liberado para aluno ${alunoId}`);
    } catch (error) {
      console.error('❌ Erro ao liberar vídeo para aluno:', error);
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
      
      // Remover o vídeo dos vídeos liberados
      const videoIndex = alunos[alunoIndex].videosLiberados.indexOf(videoId);
      if (videoIndex > -1) {
        alunos[alunoIndex].videosLiberados.splice(videoIndex, 1);
        await this.saveAlunos(alunos);
      }
      
      console.log(`✅ Vídeo ${videoId} revogado para aluno ${alunoId}`);
    } catch (error) {
      console.error('❌ Erro ao revogar vídeo para aluno:', error);
      throw error;
    }
  }

  static async setPermissoesVideosAluno(alunoId: string, videosLiberados: number[]): Promise<void> {
    try {
      const alunos = await this.getAlunos();
      const alunoIndex = alunos.findIndex(aluno => aluno.id === alunoId);
      
      if (alunoIndex === -1) {
        throw new Error(`Aluno com ID ${alunoId} não encontrado`);
      }
      
      // Definir os vídeos liberados para o aluno
      alunos[alunoIndex].videosLiberados = videosLiberados;
      await this.saveAlunos(alunos);
      
      console.log(`✅ Permissões de vídeos definidas para aluno ${alunoId}`);
    } catch (error) {
      console.error('❌ Erro ao definir permissões de vídeos:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========
  static async getLastUpdated(): Promise<string> {
    try {
      const redis = getRedisClient();
      const lastUpdated = await redis.get(KEYS.LAST_UPDATED);
      return lastUpdated as string || new Date().toISOString();
    } catch (error) {
      console.error('❌ Erro ao buscar última atualização:', error);
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