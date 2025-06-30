import { NextResponse } from 'next/server';
import { ServerDataService } from '@/services/serverDataService';

export async function GET() {
  try {
    console.log('🔧 [Redis Debug] Testando configuração do Redis...');
    
    // Verificar se está configurado
    const isConfigured = ServerDataService.isRedisConfigured();
    console.log('🔧 [Redis Debug] Redis configurado:', isConfigured);
    
    if (!isConfigured) {
      return NextResponse.json({
        configured: false,
        error: 'Redis não configurado - verifique as variáveis UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN'
      });
    }
    
    // Testar operação de escrita e leitura
    const redis = ServerDataService.getRedisClient();
    if (!redis) {
      return NextResponse.json({
        configured: false,
        error: 'Falha ao obter cliente Redis'
      });
    }

    const testKey = 'test-key-' + Date.now();
    const testValue = { test: true, timestamp: Date.now() };
    
    console.log('🔧 [Redis Debug] Testando escrita...');
    await redis.set(testKey, JSON.stringify(testValue));
    
    console.log('🔧 [Redis Debug] Testando leitura...');
    const retrieved = await redis.get(testKey);
    
    console.log('🔧 [Redis Debug] Limpando teste...');
    await redis.del(testKey);
    
    return NextResponse.json({
      configured: true,
      writeTest: 'success',
      readTest: retrieved ? 'success' : 'failed',
      retrievedData: retrieved && typeof retrieved === 'string' ? JSON.parse(retrieved) : retrieved
    });
    
  } catch (error) {
    console.error('❌ [Redis Debug] Erro:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      configured: true,
      error: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}