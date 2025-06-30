import { NextResponse } from 'next/server';
import { ServerDataService } from '@/services/serverDataService';

export async function GET() {
  try {
    console.log('🔧 [Redis Status] Iniciando diagnóstico completo...');
    
    // 1. Verificar se está configurado
    const isConfigured = ServerDataService.isRedisConfigured();
    console.log('🔧 [Redis Status] Redis configurado:', isConfigured);
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        status: 'Redis não configurado',
        error: 'Verifique as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN',
        variables: {
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Definida' : 'Não definida',
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Definida' : 'Não definida'
        }
      });
    }
    
    // 2. Testar operações básicas
    console.log('🔧 [Redis Status] Testando operações...');
    
    const redis = ServerDataService.getRedisClient();
    if (!redis) {
      return NextResponse.json({
        configured: false,
        status: 'Falha ao obter cliente Redis',
        error: 'Cliente Redis não disponível'
      });
    }

    const testKey = `test-${Date.now()}`;
    const testValue = { test: true, timestamp: Date.now() };
    
    // Teste de escrita
    console.log('🔧 [Redis Status] Testando escrita...');
    await redis.set(testKey, JSON.stringify(testValue));
    
    // Teste de leitura
    console.log('🔧 [Redis Status] Testando leitura...');
    const retrieved = await redis.get(testKey);
    
    // Teste de exclusão
    console.log('🔧 [Redis Status] Limpando teste...');
    await redis.del(testKey);
    
    // 3. Verificar dados existentes
    console.log('🔧 [Redis Status] Verificando dados existentes...');
    const videosLiberados = await ServerDataService.getVideosLiberados();
    const alunos = await ServerDataService.getAlunos();
    
    const result = {
      configured: true,
      status: 'Redis funcionando corretamente',
      tests: {
        write: 'success',
        read: retrieved ? 'success' : 'failed',
        delete: 'success'
      },
      data: {
        videosLiberados: {
          keys: Object.keys(videosLiberados).length,
          content: videosLiberados
        },
        alunos: {
          count: alunos.length,
          ids: alunos.map(a => a.id)
        }
      },
      environment: {
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Configurada' : 'Não configurada',
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configurada' : 'Não configurada'
      }
    };
    
    console.log('🔧 [Redis Status] Diagnóstico completo:', result);
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ [Redis Status] Erro no diagnóstico:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      configured: false,
      status: 'Erro no Redis',
      error: errorMessage,
      stack: errorStack,
      environment: {
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? 'Configurada' : 'Não configurada',
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? 'Configurada' : 'Não configurada'
      }
    }, { status: 500 });
  }
}