import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { DataService } from '../../../services/dataService';

export async function POST(request: NextRequest) {
  try {
    const { login, password } = await request.json();

    if (!login || !password) {
      return NextResponse.json(
        { error: 'Login e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar todos os alunos
    const alunos = await DataService.getAlunos();
    
    // Encontrar aluno pelo login
    const aluno = alunos.find(a => a.login === login);
    
    if (!aluno) {
      return NextResponse.json(
        { error: 'Nome de usuário ou senha incorretos' },
        { status: 401 }
      );
    }

    // Verificar senha
    let isPasswordValid = false;
    
    if (aluno.password) {
      // Se a senha já está hasheada, usar bcrypt.compare
      if (aluno.password.startsWith('$2')) {
        isPasswordValid = await bcrypt.compare(password, aluno.password);
      } else {
        // Senha em texto plano (temporário para migração)
        isPasswordValid = aluno.password === password;
        
        // Hashear a senha para próximas vezes
        if (isPasswordValid) {
          const hashedPassword = await bcrypt.hash(password, 10);
          await DataService.atualizarAluno(aluno.id, { password: hashedPassword });
        }
      }
    }

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Nome de usuário ou senha incorretos' },
        { status: 401 }
      );
    }

    // Login bem-sucedido
    return NextResponse.json({
      success: true,
      message: 'Login realizado com sucesso',
      aluno: {
        id: aluno.id,
        name: aluno.name,
        login: aluno.login,
        email: aluno.email,
        modulo: aluno.modulo
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