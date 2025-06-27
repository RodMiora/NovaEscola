import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
    
    // Hashear a senha antes de salvar
    if (aluno.password) {
      const saltRounds = 10;
      aluno.password = await bcrypt.hash(aluno.password, saltRounds);
    }
    
    // Adicionar o aluno
    await DataService.adicionarAluno(aluno);
    
    // Retornar o aluno adicionado (sem a senha)
    const { password, ...alunoSemSenha } = aluno;
    return NextResponse.json({
      success: true,
      message: 'Aluno adicionado com sucesso',
      aluno: alunoSemSenha
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error);
    return NextResponse.json(
      { error: 'Erro ao adicionar aluno' },
      { status: 500 }
    );
  }
}