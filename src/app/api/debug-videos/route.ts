import { NextResponse } from 'next/server';
import { ServerDataService } from '@/services/serverDataService';

// Interfaces para tipagem
interface Inconsistencia {
  alunoId: string;
  nome: string;
  videosNoAluno: number[];
  videosNoCache: number[];
  problema: string;
}

interface DiagnosticoAluno {
  id: string;
  nome: string;
  videosLiberadosNoAluno: number[];
  videosLiberadosNoCache: number[];
}

interface Diagnostico {
  alunos: DiagnosticoAluno[];
  cacheKeys: string[];
  inconsistencias: Inconsistencia[];
}

export async function GET() {
  try {
    console.log('[DEBUG] === DIAGNÓSTICO COMPLETO DE VÍDEOS LIBERADOS ===');
    
    // 1. Verificar alunos
    console.log('[DEBUG] 1. Buscando alunos...');
    const alunos = await ServerDataService.getAlunos();
    console.log('[DEBUG] Alunos encontrados:', alunos.length);
    
    // 2. Verificar cache de vídeos liberados
    console.log('[DEBUG] 2. Buscando cache de vídeos liberados...');
    const videosLiberadosCache = await ServerDataService.getVideosLiberados();
    console.log('[DEBUG] Cache de vídeos liberados:', videosLiberadosCache);
    
    // 3. Comparar dados
    const diagnostico: Diagnostico = {
      alunos: alunos.map(aluno => ({
        id: aluno.id,
        nome: aluno.name || aluno.nome || 'Nome não informado',
        videosLiberadosNoAluno: aluno.videosLiberados || [],
        videosLiberadosNoCache: videosLiberadosCache[aluno.id] || []
      })),
      cacheKeys: Object.keys(videosLiberadosCache),
      inconsistencias: []
    };
    
    // 4. Detectar inconsistências
    for (const aluno of alunos) {
      const videosNoAluno = aluno.videosLiberados || [];
      const videosNoCache = videosLiberadosCache[aluno.id] || [];
      
      if (JSON.stringify([...videosNoAluno].sort()) !== JSON.stringify([...videosNoCache].sort())) {
        diagnostico.inconsistencias.push({
          alunoId: aluno.id,
          nome: aluno.name || aluno.nome || 'Nome não informado',
          videosNoAluno,
          videosNoCache,
          problema: 'Dados divergentes entre aluno e cache'
        });
      }
    }
    
    console.log('[DEBUG] Diagnóstico completo:', diagnostico);
    
    return NextResponse.json({
      success: true,
      diagnostico
    });
  } catch (error) {
    console.error('[DEBUG] Erro no diagnóstico:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    console.log('[DEBUG] === SINCRONIZAÇÃO FORÇADA ===');
    
    // 1. Verificar Redis
    const redis = ServerDataService.getRedisClient();
    if (!redis) {
      throw new Error('Redis não configurado');
    }
    console.log('[DEBUG] Redis configurado corretamente');
    
    // 2. Buscar alunos
    const alunos = await ServerDataService.getAlunos();
    console.log('[DEBUG] Alunos encontrados:', alunos.length);
    console.log('[DEBUG] Dados dos alunos:', alunos.map(a => ({
      id: a.id,
      nome: a.name || a.nome,
      videosLiberados: a.videosLiberados
    })));
    
    // 3. Reconstruir cache baseado nos dados dos alunos
    const novoCache: { [alunoId: string]: number[] } = {};
    
    for (const aluno of alunos) {
      if (aluno.videosLiberados && aluno.videosLiberados.length > 0) {
        novoCache[aluno.id] = aluno.videosLiberados;
        console.log(`[DEBUG] Adicionando ao cache: ${aluno.id} -> ${JSON.stringify(aluno.videosLiberados)}`);
      }
    }
    
    console.log('[DEBUG] Novo cache construído:', novoCache);
    
    // 4. Verificar chave Redis diretamente
    const chaveRedis = 'escola:videos_liberados';
    console.log(`[DEBUG] Verificando chave Redis: ${chaveRedis}`);
    const dadosAtuaisRedis = await redis.get(chaveRedis);
    console.log('[DEBUG] Dados atuais no Redis:', dadosAtuaisRedis);
    
    // 5. Salvar novo cache
    console.log('[DEBUG] Salvando novo cache...');
    await ServerDataService.saveVideosLiberados(novoCache);
    console.log('[DEBUG] Cache salvo com sucesso');
    
    // 6. Verificar se foi salvo corretamente no Redis
    const dadosAposSalvar = await redis.get(chaveRedis);
    console.log('[DEBUG] Dados após salvar no Redis:', dadosAposSalvar);
    
    // 7. Verificar através da função getVideosLiberados
    const verificacao = await ServerDataService.getVideosLiberados();
    console.log('[DEBUG] Verificação através getVideosLiberados:', verificacao);
    
    return NextResponse.json({
      success: true,
      message: 'Sincronização concluída',
      dadosAtuaisRedis,
      dadosAposSalvar,
      novoCache,
      verificacao
    });
  } catch (error) {
    console.error('[DEBUG] Erro na sincronização:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}