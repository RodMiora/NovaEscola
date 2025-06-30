import { NextRequest, NextResponse } from 'next/server';
import { ServerDataService } from '../../../services/serverDataService';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Login e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const alunos = await ServerDataService.getAlunos();

    // Comparação direta de senhas em texto plano
    const aluno = alunos.find(a => a.login === login && a.password === password);
    
    if (!aluno) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      aluno: {
        id: aluno.id,
        name: aluno.name,
        login: aluno.login,
        role: aluno.role
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}