'use client';

import React, { useState, useEffect } from 'react';
import { PersistenceService } from '../services/persistenceService';

interface SyncStatusProps {
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState({
    redisDisponivel: false,
    localStorageDisponivel: false,
    dadosSalvos: false,
    ultimaAtualizacao: null as string | null,
    ultimaSincronizacao: null as string | null,
    dadosSincronizados: false
  });
  const [loading, setLoading] = useState(true);

  const verificarStatus = async () => {
    try {
      setLoading(true);
      const persistenceStatus = await PersistenceService.verificarPersistencia();
      const syncStatus = PersistenceService.getSyncStatus();
      
      setStatus({
        ...persistenceStatus,
        ...syncStatus
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    } finally {
      setLoading(false);
    }
  };

  const sincronizar = async () => {
    try {
      setLoading(true);
      await PersistenceService.sincronizarDados();
      await verificarStatus();
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
    } finally {
      setLoading(false);
    }
  };

  const limparDados = async () => {
    if (confirm('Tem certeza que deseja limpar todos os dados salvos? Esta ação não pode ser desfeita.')) {
      try {
        setLoading(true);
        await PersistenceService.limparTodosDados();
        await verificarStatus();
        alert('Dados limpos com sucesso!');
      } catch (error) {
        console.error('Erro ao limpar dados:', error);
        alert('Erro ao limpar dados.');
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    verificarStatus();
    
    // Verificar status a cada 30 segundos
    const interval = setInterval(verificarStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const formatarData = (dataStr: string | null) => {
    if (!dataStr) return 'Nunca';
    try {
      return new Date(dataStr).toLocaleString('pt-BR');
    } catch {
      return 'Data inválida';
    }
  };

  const getStatusColor = () => {
    if (!status.localStorageDisponivel) return 'text-red-500';
    if (status.redisDisponivel && status.dadosSincronizados) return 'text-green-500';
    if (status.dadosSalvos) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getStatusText = () => {
    if (!status.localStorageDisponivel) return 'Erro: Armazenamento não disponível';
    if (status.redisDisponivel && status.dadosSincronizados) return 'Sincronizado (Redis + Local)';
    if (status.dadosSalvos) return 'Salvo localmente (Redis não configurado)';
    return 'Nenhum dado salvo';
  };

  const getStatusIcon = () => {
    if (!status.localStorageDisponivel) return '❌';
    if (status.redisDisponivel && status.dadosSincronizados) return '✅';
    if (status.dadosSalvos) return '⚠️';
    return '❌';
  };

  if (loading) {
    return (
      <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
          <span className="text-gray-300 text-sm">Verificando status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
          <span>Status de Sincronização</span>
          <span className="text-xl">{getStatusIcon()}</span>
        </h3>
        <button
          onClick={verificarStatus}
          className="text-orange-500 hover:text-orange-400 text-sm"
          disabled={loading}
        >
          🔄 Atualizar
        </button>
      </div>
      
      <div className="space-y-2 text-sm">
        <div className={`font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-gray-300">
          <div>
            <span className="text-gray-400">Redis:</span>
            <span className={`ml-2 ${status.redisDisponivel ? 'text-green-400' : 'text-red-400'}`}>
              {status.redisDisponivel ? 'Configurado' : 'Não configurado'}
            </span>
          </div>
          
          <div>
            <span className="text-gray-400">Local:</span>
            <span className={`ml-2 ${status.localStorageDisponivel ? 'text-green-400' : 'text-red-400'}`}>
              {status.localStorageDisponivel ? 'Disponível' : 'Indisponível'}
            </span>
          </div>
          
          <div className="col-span-2">
            <span className="text-gray-400">Última atualização:</span>
            <span className="ml-2 text-gray-300">
              {formatarData(status.ultimaAtualizacao)}
            </span>
          </div>
          
          {status.ultimaSincronizacao && (
            <div className="col-span-2">
              <span className="text-gray-400">Última sincronização:</span>
              <span className="ml-2 text-gray-300">
                {formatarData(status.ultimaSincronizacao)}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2 mt-4">
          <button
            onClick={sincronizar}
            className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-sm"
            disabled={loading}
          >
            🔄 Sincronizar
          </button>
          
          <button
            onClick={limparDados}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            disabled={loading}
          >
            🗑️ Limpar Dados
          </button>
        </div>
      </div>
      
      {!status.redisDisponivel && (
        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600 rounded text-yellow-200 text-xs">
          <strong>⚠️ Aviso:</strong> Redis não está configurado. Os dados são salvos apenas localmente. 
          Para sincronização entre dispositivos, configure as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN no arquivo .env.local.
        </div>
      )}
    </div>
  );
};

export default SyncStatus;