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

// Remover as linhas de bcrypt e salvar senha em texto plano
export async function POST(request: NextRequest) {
  try {
    const { name, login, password, email, role, modulo } = await request.json();

    if (!name || !login || !password) {
      return NextResponse.json(
        { error: 'Nome, login e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Não hashear a senha - manter em texto plano
    const novoAluno = {
      id: Date.now().toString(),
      name,
      login,
      password, // Senha em texto plano
      email: email || '',
      role,
      modulo: modulo || 1, // Adicionar propriedade modulo obrigatória
      videosLiberados: []
    };

    await DataService.adicionarAluno(novoAluno);
    return NextResponse.json(novoAluno, { status: 201 });
  } catch (error) {
    console.error('Erro ao adicionar aluno:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}