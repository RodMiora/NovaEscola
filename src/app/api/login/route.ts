import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DataService } from '../../../services/dataService';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const alunos = await DataService.getAlunos();
    
    // Comparação direta de senhas em texto plano
    const aluno = alunos.find(a => a.login === email && a.password === password);
    
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