import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../services/dataService';

export async function GET() {
  try {
    const videosLiberados = await DataService.getVideosLiberados();
    return NextResponse.json(videosLiberados);
  } catch (error) {
    console.error('Erro ao buscar vídeos liberados:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos liberados' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { alunoId, videoIds } = await request.json();
    await DataService.setPermissoesVideosAluno(alunoId, videoIds);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao definir permissões:', error);
    return NextResponse.json(
      { error: 'Erro ao definir permissões' },
      { status: 500 }
    );
  }
}