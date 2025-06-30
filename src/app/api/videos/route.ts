import { NextRequest, NextResponse } from 'next/server';
import { ServerDataService } from '../../../services/serverDataService';

export async function GET() {
  try {
    const videos = await ServerDataService.getVideos();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Erro ao buscar vídeos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar vídeos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const video = await request.json();
    await ServerDataService.adicionarVideo(video);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao adicionar vídeo:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar vídeo' },
      { status: 500 }
    );
  }
}