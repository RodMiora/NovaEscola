import { Aluno, Video, VideosLiberados } from '../hooks/types';

// Tipos importados de ../hooks/types

// Chaves para localStorage
const KEYS = {
  ALUNOS: 'novaescola:alunos',
  VIDEOS: 'novaescola:videos', 
  VIDEOS_LIBERADOS: 'novaescola:videos_liberados',
  LAST_UPDATED: 'novaescola:last_updated'
} as const;

export class DataService {
  // ========== ALUNOS ==========
  static async getAlunos(): Promise<Aluno[]> {
    try {
      console.log('🔍 [DataService.getAlunos] Buscando alunos via API...');
      // No cliente, buscar via API
      const response = await fetch('/api/alunos');
      if (!response.ok) {
        throw new Error('Erro ao buscar alunos da API');
      }
      const alunos = await response.json();
      
      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.ALUNOS, JSON.stringify(alunos));
        localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
      }
      
      console.log('✅ [DataService.getAlunos] Retornando', alunos.length, 'alunos da API');
      return alunos;
    } catch (error) {
      console.error('❌ [DataService.getAlunos] Erro ao buscar alunos da API:', error);
      
      // Fallback para localStorage
      if (typeof window !== 'undefined') {
        const alunosStr = localStorage.getItem(KEYS.ALUNOS);
        const alunos = alunosStr ? JSON.parse(alunosStr) : [];
        console.log('📦 [DataService.getAlunos] Fallback localStorage:', alunos.length, 'alunos');
        return alunos;
      }
      
      return [];
    }
  }

  static async saveAlunos(alunos: Aluno[]): Promise<void> {
    try {
      console.log('🔍 [DataService.saveAlunos] Salvando', alunos.length, 'alunos no localStorage...');
      
      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.ALUNOS, JSON.stringify(alunos));
        localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
      }
      
      console.log('✅ [DataService.saveAlunos] Alunos salvos no localStorage');
    } catch (error) {
      console.error('❌ [DataService.saveAlunos] Erro ao salvar alunos:', error);
      throw error;
    }
  }

  static async adicionarAluno(aluno: Aluno): Promise<Aluno> {
    try {
      console.log('🔍 [DataService.adicionarAluno] Adicionando aluno via API:', aluno.nome || aluno.name);
      
      // Adicionar via API
      const response = await fetch('/api/alunos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aluno),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar aluno via API');
      }
      
      const alunoAdicionado = await response.json();
      
      // Atualizar localStorage como backup
      const alunos = await this.getAlunos();
      await this.saveAlunos(alunos);
      
      console.log('✅ [DataService.adicionarAluno] Aluno adicionado com sucesso via API');
      return alunoAdicionado;
    } catch (error) {
      console.error('❌ [DataService.adicionarAluno] Erro ao adicionar aluno:', error);
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
      
      // Atualizar o aluno com os novos dados
      alunos[index] = { ...alunos[index], ...dadosAtualizados };
      
      await this.saveAlunos(alunos);
      console.log(`✅ Aluno ${id} atualizado com sucesso`);
      
      return alunos[index]; // Retornar o aluno atualizado
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
      console.log('🔍 [DataService.getVideos] Buscando vídeos via API...');
      // No cliente, buscar via API
      const response = await fetch('/api/videos');
      if (!response.ok) {
        throw new Error('Erro ao buscar vídeos da API');
      }
      const videos = await response.json();
      
      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
        localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
      }
      
      console.log('✅ [DataService.getVideos] Retornando', videos.length, 'vídeos da API');
      return videos;
    } catch (error) {
      console.error('❌ [DataService.getVideos] Erro ao buscar vídeos da API:', error);
      
      // Fallback para localStorage
      if (typeof window !== 'undefined') {
        const videosStr = localStorage.getItem(KEYS.VIDEOS);
        const videos = videosStr ? JSON.parse(videosStr) : [];
        console.log('📦 [DataService.getVideos] Fallback localStorage:', videos.length, 'vídeos');
        return videos;
      }
      
      return [];
    }
  }

  static async saveVideos(videos: Video[]): Promise<void> {
    try {
      console.log('🔍 [DataService.saveVideos] Salvando', videos.length, 'vídeos no localStorage...');
      
      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videos));
        localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
      }
      
      console.log('✅ [DataService.saveVideos] Vídeos salvos no localStorage');
    } catch (error) {
      console.error('❌ [DataService.saveVideos] Erro ao salvar vídeos:', error);
      throw error;
    }
  }

  static async adicionarVideo(video: Omit<Video, 'id'>): Promise<Video> {
    try {
      console.log('🔍 [DataService.adicionarVideo] Adicionando vídeo via API:', video.titulo);
      
      // Adicionar via API
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(video),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao adicionar vídeo via API');
      }
      
      const novoVideo = await response.json();
      
      // Atualizar localStorage como backup
      if (typeof window !== 'undefined') {
        const videosAtuais = await this.getVideos();
        const videosAtualizados = [...videosAtuais, novoVideo];
        localStorage.setItem(KEYS.VIDEOS, JSON.stringify(videosAtualizados));
        localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
      }
      
      console.log('✅ [DataService.adicionarVideo] Vídeo adicionado com sucesso via API');
      return novoVideo;
    } catch (error) {
      console.error('❌ [DataService.adicionarVideo] Erro ao adicionar vídeo:', error);
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
  static async getVideosLiberados(): Promise<VideosLiberados> {
    try {
      console.log('🔍 [DataService.getVideosLiberados] === INÍCIO BUSCA API ===');
      console.log('🔍 [DataService.getVideosLiberados] Fazendo fetch para /api/videos-liberados...');
      
      // No cliente, buscar via API
      const response = await fetch('/api/videos-liberados');
      console.log('📡 [DataService.getVideosLiberados] Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });
      
      if (!response.ok) {
        throw new Error(`Erro ao buscar vídeos liberados da API: ${response.status} ${response.statusText}`);
      }
      
      console.log('📦 [DataService.getVideosLiberados] Fazendo parse da resposta...');
      const videosLiberados = await response.json();
      console.log('📦 [DataService.getVideosLiberados] Dados recebidos da API:', {
        type: typeof videosLiberados,
        keys: Object.keys(videosLiberados || {}),
        data: videosLiberados
      });
      
      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        console.log('💾 [DataService.getVideosLiberados] Salvando backup no localStorage...');
        localStorage.setItem(KEYS.VIDEOS_LIBERADOS, JSON.stringify(videosLiberados));
        localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
        console.log('✅ [DataService.getVideosLiberados] Backup salvo no localStorage');
      }
      
      console.log('✅ [DataService.getVideosLiberados] === SUCESSO API ===');
      return videosLiberados;
    } catch (error) {
      console.error('❌ [DataService.getVideosLiberados] === ERRO API ===', error);
      
      // Fallback para localStorage
      if (typeof window !== 'undefined') {
        console.log('🔄 [DataService.getVideosLiberados] Tentando fallback localStorage...');
        const videosLiberadosStr = localStorage.getItem(KEYS.VIDEOS_LIBERADOS);
        const videosLiberados = videosLiberadosStr ? JSON.parse(videosLiberadosStr) : {};
        console.log('📦 [DataService.getVideosLiberados] Fallback localStorage:', {
          found: !!videosLiberadosStr,
          data: videosLiberados
        });
        return videosLiberados;
      }
      
      console.log('❌ [DataService.getVideosLiberados] Retornando objeto vazio');
      return {};
    }
  }

  static async saveVideosLiberados(videos: VideosLiberados): Promise<void> {
    try {
      console.log('🔍 [DataService.saveVideosLiberados] Salvando vídeos liberados no localStorage...');
      
      // Salvar no localStorage como backup
      if (typeof window !== 'undefined') {
        localStorage.setItem(KEYS.VIDEOS_LIBERADOS, JSON.stringify(videos));
        localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
      }
      
      console.log('✅ [DataService.saveVideosLiberados] Vídeos liberados salvos no localStorage');
    } catch (error) {
      console.error('❌ [DataService.saveVideosLiberados] Erro ao salvar vídeos liberados:', error);
      throw error;
    }
  }

  static async liberarVideoParaAluno(alunoId: string, videoId: string): Promise<void> {
    try {
      console.log('🔍 [DataService.liberarVideoParaAluno] Liberando vídeo via API:', { alunoId, videoId });
      
      // Liberar via API
      const response = await fetch(`/api/videos-liberados/${alunoId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoId }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao liberar vídeo via API');
      }
      
      // Atualizar localStorage como backup
      if (typeof window !== 'undefined') {
        const videosLiberados = await this.getVideosLiberados();
        if (!videosLiberados[alunoId]) {
          videosLiberados[alunoId] = [];
        }
        if (!videosLiberados[alunoId].includes(parseInt(videoId))) {
          videosLiberados[alunoId].push(parseInt(videoId));
          localStorage.setItem(KEYS.VIDEOS_LIBERADOS, JSON.stringify(videosLiberados));
          localStorage.setItem(KEYS.LAST_UPDATED, new Date().toISOString());
        }
      }
      
      console.log('✅ [DataService.liberarVideoParaAluno] Vídeo liberado com sucesso via API');
    } catch (error) {
      console.error('❌ [DataService.liberarVideoParaAluno] Erro ao liberar vídeo:', error);
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
      console.log(`🎯 [setPermissoesVideosAluno] Definindo permissões para aluno ${alunoId}:`, videosLiberados);
      
      // Atualizar dados do aluno
      const alunos = await this.getAlunos();
      const alunoIndex = alunos.findIndex(aluno => aluno.id === alunoId);
      
      if (alunoIndex === -1) {
        throw new Error(`Aluno com ID ${alunoId} não encontrado`);
      }
      
      // Definir os vídeos liberados para o aluno
      alunos[alunoIndex].videosLiberados = videosLiberados;
      await this.saveAlunos(alunos);
      
      // Também atualizar o cache de vídeos liberados
      const videosLiberadosCache = await this.getVideosLiberados();
      videosLiberadosCache[alunoId] = videosLiberados; // Manter como number[]
      await this.saveVideosLiberados(videosLiberadosCache);
      
      console.log(`✅ Permissões de vídeos definidas para aluno ${alunoId}:`, {
        videosLiberados,
        salvoEmAlunos: true,
        salvoEmCache: true
      });
    } catch (error) {
      console.error('❌ Erro ao definir permissões de vídeos:', error);
      throw error;
    }
  }

  // ========== UTILITÁRIOS ==========
  static async getLastUpdated(): Promise<string | null> {
    try {
      console.log('🔍 [DataService.getLastUpdated] Buscando última atualização do localStorage...');
      
      if (typeof window !== 'undefined') {
        const lastUpdated = localStorage.getItem(KEYS.LAST_UPDATED);
        console.log('📦 [DataService.getLastUpdated] Última atualização:', lastUpdated);
        return lastUpdated;
      }
      
      return null;
    } catch (error) {
      console.error('❌ [DataService.getLastUpdated] Erro ao buscar última atualização:', error);
      return null;
    }
  }

  static async clearAllData(): Promise<void> {
    try {
      console.log('🔍 [DataService.clearAllData] Limpando dados do localStorage...');
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem(KEYS.ALUNOS);
        localStorage.removeItem(KEYS.VIDEOS);
        localStorage.removeItem(KEYS.VIDEOS_LIBERADOS);
        localStorage.removeItem(KEYS.LAST_UPDATED);
      }
      
      console.log('✅ [DataService.clearAllData] Dados do localStorage limpos');
    } catch (error) {
      console.error('❌ [DataService.clearAllData] Erro ao limpar dados:', error);
      throw error;
    }
  }
}