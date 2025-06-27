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
    const novoAluno = await DataService.adicionarAluno(aluno);
    return NextResponse.json(novoAluno);
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar aluno' },
      { status: 500 }
    );
  }
}