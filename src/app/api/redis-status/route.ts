import { NextResponse } from 'next/server';
import { ServerDataService } from '@/services/serverDataService';

export async function GET() {
  try {
    // Tenta fazer uma operação simples no Redis
    await ServerDataService.getLastUpdated();
    return NextResponse.json({ 
      configured: true, 
      status: 'Redis conectado e funcionando' 
    });
  } catch (error) {
    return NextResponse.json({ 
      configured: false, 
      status: 'Redis não configurado ou com erro' 
    });
  }
}