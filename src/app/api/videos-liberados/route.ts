import { NextRequest, NextResponse } from 'next/server';
import { ServerDataService } from '@/services/serverDataService';

export async function GET() {
  try {
    console.log('[API] GET /api/videos-liberados - Iniciando busca de vídeos liberados');
    const videosLiberados = await ServerDataService.getVideosLiberados();
    console.log('[API] GET /api/videos-liberados - Resultado:', {
      count: videosLiberados.length,
      data: videosLiberados
    });
    return NextResponse.json(videosLiberados);
  } catch (error) {
    console.error('[API] GET /api/videos-liberados - Erro ao buscar vídeos liberados:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { alunoId, videosLiberados } = await request.json();
    console.log('[API] POST /api/videos-liberados - Dados recebidos:', {
      alunoId,
      videosLiberados,
      count: videosLiberados?.length
    });
    
    if (!alunoId || !Array.isArray(videosLiberados)) {
      console.error('[API] POST /api/videos-liberados - Dados inválidos:', { alunoId, videosLiberados });
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    console.log('[API] POST /api/videos-liberados - Chamando setPermissoesVideosAluno');
    await ServerDataService.setPermissoesVideosAluno(alunoId, videosLiberados);
    console.log('[API] POST /api/videos-liberados - Permissões salvas com sucesso');
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API] POST /api/videos-liberados - Erro ao salvar permissões de vídeos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}