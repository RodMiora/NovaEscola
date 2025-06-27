import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DataService } from '../../../../services/dataService';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const dadosAtualizados = await request.json();
    
    // Se a senha foi alterada, hashear a nova senha
    if (dadosAtualizados.password) {
      const saltRounds = 10;
      dadosAtualizados.password = await bcrypt.hash(dadosAtualizados.password, saltRounds);
    }
    
    await DataService.atualizarAluno(id, dadosAtualizados);
    
    return NextResponse.json({
      success: true,
      message: 'Aluno atualizado com sucesso'
    });
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