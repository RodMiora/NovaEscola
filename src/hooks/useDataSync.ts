// src/hooks/useDataSync.ts
import { useState, useEffect, useCallback, Dispatch, SetStateAction } from 'react';
// Importa os tipos do seu arquivo central
// O caminho './types' está correto SE types.ts estiver na mesma pasta (src/hooks)
import {
  Aluno,
  Video,
  Turma, // Importado, mas não usado no código atual
  VideosLiberados,
  NotificationData, // Importado, mas não usado no código atual
  ConfirmacaoState, // Importado, mas não usado no código atual
  Notificacao, // Importado, mas não usado no código atual
  Module, // Importado, mas não usado no código atual
  AlunosDict // Importado, mas não usado no código atual
} from './types'; // <-- Mantenha './types' se types.ts estiver em src/hooks

// Importa o cliente API em vez do DataService
import { apiClient } from '../services/apiClient';

// ============================================================================
// INTERFACE DO RETORNO DO HOOK useDataSync
// Define o que o hook retorna, incluindo loading e error
// ============================================================================
interface DataSyncState {
  alunos: Aluno[];
  setAlunos: Dispatch<SetStateAction<Aluno[]>>;
  adicionarAluno: (novoAluno: Omit<Aluno, 'id'>) => Promise<void>; // Agora é async para Vercel KV
  atualizarAluno: (alunoId: string, novosDados: Partial<Aluno>) => Promise<void>; // Agora é async
  removerAluno: (alunoId: string) => Promise<void>; // Agora é async

  videos: Video[];
  setVideos: Dispatch<SetStateAction<Video[]>>;
  adicionarVideo: (novoVideo: Video) => Promise<void>; // Agora é async
  atualizarVideo: (videoAtualizado: Video) => Promise<void>; // Agora é async
  removerVideo: (videoId: number) => Promise<void>; // Agora é async

  videosLiberados: VideosLiberados;
  setPermissoesVideosAluno: (alunoId: string, videoIds: number[]) => Promise<void>; // Agora é async
  liberarVideoParaAluno: (alunoId: string, videoId: number) => Promise<void>; // Agora é async
  revogarVideoParaAluno: (alunoId: string, videoId: number) => Promise<void>; // Agora é async
  getVideosLiberadosDoAluno: (alunoId: string) => number[];

  loading: boolean;
  error: string | null;
  loadData: () => Promise<void>; // Renomeado de refreshData para loadData
}

// ============================================================================
// HOOK useDataSync
// ============================================================================
export function useDataSync(): DataSyncState {
  // Estados para armazenar os dados
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [videosLiberados, setVideosLiberados] = useState<VideosLiberados>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para carregar todos os dados via API
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [alunosData, videosData, videosLiberadosData] = await Promise.all([
        apiClient.getAlunos(),
        apiClient.getVideos(),
        apiClient.getVideosLiberados()
      ]);
      
      setAlunos(alunosData);
      setVideos(videosData);
      setVideosLiberados(videosLiberadosData);
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Função para obter vídeos liberados de um aluno específico
  const getVideosLiberadosDoAluno = useCallback((alunoId: string): number[] => {
    return videosLiberados[alunoId] || [];
  }, [videosLiberados]);

  // Atualizar todas as funções CRUD para usar apiClient
  const adicionarAluno = useCallback(async (novoAluno: Omit<Aluno, 'id'>) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.adicionarAluno(novoAluno);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao adicionar aluno:', err);
      setError(err.message || 'Erro ao adicionar aluno');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const atualizarAluno = useCallback(async (alunoId: string, novosDados: Partial<Aluno>) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.atualizarAluno(alunoId, novosDados);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao atualizar aluno:', err);
      setError(err.message || 'Erro ao atualizar aluno');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const removerAluno = useCallback(async (alunoId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.removerAluno(alunoId);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao remover aluno:', err);
      setError(err.message || 'Erro ao remover aluno');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // ========== VÍDEOS ==========
  const adicionarVideo = useCallback(async (novoVideo: Video) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.adicionarVideo(novoVideo);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao adicionar vídeo:', err);
      setError(err.message || 'Erro ao adicionar vídeo');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const atualizarVideo = useCallback(async (videoAtualizado: Video) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.atualizarVideo(videoAtualizado.id, videoAtualizado);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao atualizar vídeo:', err);
      setError(err.message || 'Erro ao atualizar vídeo');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const removerVideo = useCallback(async (videoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.removerVideo(videoId);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao remover vídeo:', err);
      setError(err.message || 'Erro ao remover vídeo');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // ========== PERMISSÕES ==========
  const setPermissoesVideosAluno = useCallback(async (alunoId: string, videoIds: number[]) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 [useDataSync] Salvando permissões:', { alunoId, videoIds });
      await apiClient.setPermissoesVideosAluno(alunoId, videoIds);
      
      // Aguardar um pouco para garantir que os dados foram persistidos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🔄 [useDataSync] Recarregando dados após salvamento...');
      await loadData();
      
      console.log('✅ [useDataSync] Dados recarregados com sucesso');
    } catch (err: any) {
      console.error('❌ [useDataSync] Erro ao definir permissões:', err);
      setError(err.message || 'Erro ao definir permissões');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const liberarVideoParaAluno = useCallback(async (alunoId: string, videoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.liberarVideoParaAluno(alunoId, videoId);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao liberar vídeo:', err);
      setError(err.message || 'Erro ao liberar vídeo');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  const revogarVideoParaAluno = useCallback(async (alunoId: string, videoId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      await apiClient.revogarVideoParaAluno(alunoId, videoId);
      await loadData();
    } catch (err: any) {
      console.error('Erro ao revogar vídeo:', err);
      setError(err.message || 'Erro ao revogar vídeo');
    } finally {
      setLoading(false);
    }
  }, [loadData]);

  // =========================
  // === RETORNOS DO HOOK ====
  // =========================
  return {
    alunos,
    setAlunos,
    adicionarAluno,
    atualizarAluno,
    removerAluno,
    videos,
    setVideos,
    adicionarVideo,
    atualizarVideo,
    removerVideo,
    videosLiberados,
    setPermissoesVideosAluno,
    liberarVideoParaAluno,
    revogarVideoParaAluno,
    getVideosLiberadosDoAluno,
    loading,
    error,
    loadData, // Renomeado de refreshData para loadData
  };
}
