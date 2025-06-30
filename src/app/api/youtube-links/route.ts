import { NextResponse } from 'next/server';
import { ServerDataService } from '@/services/serverDataService';

const YOUTUBE_LINKS_KEY = 'escola:youtube_links';

export async function GET() {
  try {
    console.log('[API] GET /api/youtube-links - Buscando links do YouTube...');
    
    const redis = ServerDataService.getRedisClient();
    if (!redis) {
      console.warn('[API] Redis não configurado, retornando objeto vazio');
      return NextResponse.json({});
    }

    const linksStr = await redis.get(YOUTUBE_LINKS_KEY);
    console.log('[API] Dados brutos do Redis:', linksStr);
    
    let links: { [key: string]: string } = {};
    if (linksStr) {
      try {
        // Verificar se já é um objeto ou se precisa fazer parse
        if (typeof linksStr === 'object') {
          links = linksStr as { [key: string]: string };
        } else {
          links = JSON.parse(linksStr.toString()) as { [key: string]: string };
        }
      } catch (error) {
        console.error('[API] Erro ao fazer parse dos links:', error);
        links = {};
      }
    }
    
    console.log('[API] Links do YouTube retornados:', JSON.stringify(links));
    return NextResponse.json(links);
  } catch (error) {
    console.error('[API] Erro ao buscar links do YouTube:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { videoId, url } = await request.json();
    console.log(`[API] POST /api/youtube-links - Salvando link para vídeo ${videoId}:`, url);
    
    if (!videoId) {
      return NextResponse.json({ error: 'videoId é obrigatório' }, { status: 400 });
    }

    const redis = ServerDataService.getRedisClient();
    if (!redis) {
      console.warn('[API] Redis não configurado');
      return NextResponse.json({ error: 'Redis não configurado' }, { status: 500 });
    }

    // Buscar links existentes
    const linksStr = await redis.get(YOUTUBE_LINKS_KEY);
    let links: { [key: string]: string } = {};
    
    if (linksStr) {
      try {
        if (typeof linksStr === 'object') {
          links = linksStr as { [key: string]: string };
        } else {
          links = JSON.parse(linksStr.toString()) as { [key: string]: string };
        }
      } catch (error) {
        console.error('[API] Erro ao fazer parse dos links existentes:', error);
        links = {};
      }
    }

    // Atualizar ou remover link
    if (url && url.trim() !== '') {
      links[videoId.toString()] = url.trim();
      console.log(`[API] Link adicionado/atualizado para vídeo ${videoId}`);
    } else {
      delete links[videoId.toString()];
      console.log(`[API] Link removido para vídeo ${videoId}`);
    }

    // Salvar no Redis
    await redis.set(YOUTUBE_LINKS_KEY, JSON.stringify(links));
    console.log('[API] Links salvos no Redis:', JSON.stringify(links));
    
    return NextResponse.json({ 
      success: true, 
      message: 'Link salvo com sucesso',
      links 
    });
  } catch (error) {
    console.error('[API] Erro ao salvar link do YouTube:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const newLinks = await request.json();
    console.log('[API] PUT /api/youtube-links - Substituindo todos os links:', newLinks);
    
    const redis = ServerDataService.getRedisClient();
    if (!redis) {
      console.warn('[API] Redis não configurado');
      return NextResponse.json({ error: 'Redis não configurado' }, { status: 500 });
    }

    // Salvar todos os links
    await redis.set(YOUTUBE_LINKS_KEY, JSON.stringify(newLinks));
    console.log('[API] Todos os links salvos no Redis');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Links salvos com sucesso',
      links: newLinks 
    });
  } catch (error) {
    console.error('[API] Erro ao salvar links do YouTube:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    }, { status: 500 });
  }
}