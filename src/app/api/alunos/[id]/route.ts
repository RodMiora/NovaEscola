// Verificar se o endpoint já trata atualizações parciais corretamente
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DataService } from '../../../../services/dataService';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Se password estiver presente, manter em texto plano
    const dadosAtualizados = { ...body };
    
    const alunoAtualizado = await DataService.atualizarAluno(id, dadosAtualizados);
    
    if (!alunoAtualizado) {
      return NextResponse.json(
        { error: 'Aluno não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(alunoAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await DataService.removerAluno(id);
    
    return NextResponse.json({
      success: true,
      message: 'Aluno removido com sucesso'
    });
  } catch (error) {
    console.error('Erro ao remover aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao remover aluno' },
      { status: 500 }
    );
  }
}