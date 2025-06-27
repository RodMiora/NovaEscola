import { NextRequest, NextResponse } from 'next/server';
import { DataService } from '../../../services/dataService';

export async function GET() {
  try {
    const alunos = await DataService.getAlunos();
    return NextResponse.json(alunos);
  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar alunos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const aluno = await request.json();
    
    // Garantir que o aluno tenha um ID único
    if (!aluno.id) {
      aluno.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }
    
    // Adicionar o aluno (método não retorna nada)
    await DataService.adicionarAluno(aluno);
    
    // Retornar o aluno adicionado com status de sucesso
    return NextResponse.json({
      success: true,
      message: 'Aluno adicionado com sucesso',
      aluno: aluno
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar aluno' },
      { status: 500 }
    );
  }
}