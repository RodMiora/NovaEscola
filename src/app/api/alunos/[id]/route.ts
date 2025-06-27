import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../../services/dataService';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dados = await request.json();
    await DataService.atualizarAluno(params.id, dados);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar aluno' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await DataService.removerAluno(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao remover aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao remover aluno' },
      { status: 500 }
    );
  }
}