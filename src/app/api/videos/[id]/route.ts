import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../services/dataService';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const video = await request.json();
    await DataService.atualizarVideo(parseInt(params.id), video);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar vídeo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await DataService.removerVideo(parseInt(params.id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover vídeo:', error);
    return NextResponse.json(
      { error: 'Erro ao remover vídeo' },
      { status: 500 }
    );
  }
}