import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '@/services/dataService';

export async function POST(request: NextRequest, { params }: { params: { alunoId: string, videoId: string } }) {
  try {
    const { alunoId, videoId } = params;
    await DataService.liberarVideoParaAluno(alunoId, parseInt(videoId));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao liberar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro ao liberar vídeo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { alunoId: string, videoId: string } }) {
  try {
    const { alunoId, videoId } = params;
    await DataService.revogarVideoParaAluno(alunoId, parseInt(videoId));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Erro ao revogar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro ao revogar vídeo' },
      { status: 500 }
    );
  }
}