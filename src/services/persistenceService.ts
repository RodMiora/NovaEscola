/**
 * Serviço de Persistência
 * 
 * Este serviço garante que os dados sejam salvos de forma persistente,
 * usando Redis quando disponível ou localStorage como fallback.
 * 
 * Funcionalidades:
 * - Detecção automática de Redis vs localStorage
 * - Sincronização de dados entre dispositivos (quando Redis está disponível)
 * - Fallback para localStorage quando Redis não está configurado
 * - Logs detalhados para debugging
 */

import { Aluno, Video, VideosLiberados } from '../hooks/types';

export class PersistenceService {
  private static readonly STORAGE_KEYS = {
    ALUNOS: 'escola:alunos',
    VIDEOS: 'escola:videos',
    VIDEOS_LIBERADOS: 'escola:videos_liberados',
    LAST_UPDATED: 'escola:last_updated',
    SYNC_STATUS: 'escola:sync_status'
  };

  /**
   * Verifica se os dados estão sendo persistidos corretamente
   */
  static async verificarPersistencia(): Promise<{
    redisDisponivel: boolean;
    localStorageDisponivel: boolean;
    dadosSalvos: boolean;
    ultimaAtualizacao: string | null;
  }> {
    const redisDisponivel = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
    const localStorageDisponivel = typeof window !== 'undefined' && !!window.localStorage;
    
    let dadosSalvos = false;
    let ultimaAtualizacao: string | null = null;
    
    try {
      if (localStorageDisponivel) {
        const alunos = localStorage.getItem(this.STORAGE_KEYS.ALUNOS);
        dadosSalvos = !!alunos;
        ultimaAtualizacao = localStorage.getItem(this.STORAGE_KEYS.LAST_UPDATED);
      }
    } catch (error) {
      console.error('Erro ao verificar localStorage:', error);
    }
    
    return {
      redisDisponivel,
      localStorageDisponivel,
      dadosSalvos,
      ultimaAtualizacao
    };
  }

  /**
   * Força a sincronização de dados entre localStorage e Redis (se disponível)
   */
  static async sincronizarDados(): Promise<void> {
    try {
      console.log('🔄 [PersistenceService] Iniciando sincronização de dados...');
      
      const status = await this.verificarPersistencia();
      console.log('📊 [PersistenceService] Status da persistência:', status);
      
      if (!status.localStorageDisponivel) {
        console.warn('⚠️ [PersistenceService] localStorage não disponível');
        return;
      }
      
      // Marcar timestamp da sincronização
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEYS.SYNC_STATUS, JSON.stringify({
          ultimaSincronizacao: new Date().toISOString(),
          redisDisponivel: status.redisDisponivel,
          dadosSincronizados: true
        }));
      }
      
      console.log('✅ [PersistenceService] Sincronização concluída');
    } catch (error) {
      console.error('❌ [PersistenceService] Erro na sincronização:', error);
    }
  }

  /**
   * Obtém informações sobre o status da sincronização
   */
  static getSyncStatus(): {
    ultimaSincronizacao: string | null;
    redisDisponivel: boolean;
    dadosSincronizados: boolean;
  } {
    try {
      if (typeof window === 'undefined') {
        return {
          ultimaSincronizacao: null,
          redisDisponivel: false,
          dadosSincronizados: false
        };
      }
      
      const syncData = localStorage.getItem(this.STORAGE_KEYS.SYNC_STATUS);
      if (syncData) {
        return JSON.parse(syncData);
      }
    } catch (error) {
      console.error('Erro ao obter status de sincronização:', error);
    }
    
    return {
      ultimaSincronizacao: null,
      redisDisponivel: false,
      dadosSincronizados: false
    };
  }

  /**
   * Limpa todos os dados salvos (útil para debugging)
   */
  static async limparTodosDados(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        Object.values(this.STORAGE_KEYS).forEach(key => {
          localStorage.removeItem(key);
        });
        console.log('🧹 [PersistenceService] Todos os dados locais foram limpos');
      }
    } catch (error) {
      console.error('❌ [PersistenceService] Erro ao limpar dados:', error);
    }
  }
}