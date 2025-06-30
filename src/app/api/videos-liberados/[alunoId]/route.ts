import { NextRequest, NextResponse } from 'next/server';
import { ServerDataService } from '@/services/serverDataService';

export async function POST(request: NextRequest, { params }: { params: { alunoId: string } }) {
  try {
    const { alunoId } = params;
    const { videoId } = await request.json();
    
    await ServerDataService.liberarVideoParaAluno(alunoId, videoId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao liberar vídeo para aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao liberar vídeo para aluno' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { alunoId: string } }) {
  try {
    const { alunoId } = params;
    const videosLiberados = await ServerDataService.getVideosLiberados();
    const videosDoAluno = videosLiberados[alunoId] || [];
    
    return NextResponse.json(videosDoAluno);
  } catch (error: any) {
    console.error('Erro ao buscar vídeos liberados do aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos liberados do aluno' },
      { status: 500 }
    );
  }
}