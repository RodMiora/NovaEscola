import { Aluno, Video, VideosLiberados } from '../hooks/types';

class ApiClient {
  private async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Alunos
  async getAlunos(): Promise<Aluno[]> {
    return this.request<Aluno[]>('/api/alunos');
  }

  async adicionarAluno(aluno: Omit<Aluno, 'id'>): Promise<Aluno> {
    return this.request<Aluno>('/api/alunos', {
      method: 'POST',
      body: JSON.stringify(aluno),
    });
  }

  async atualizarAluno(id: string, dados: Partial<Aluno>): Promise<void> {
    await this.request(`/api/alunos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados),
    });
  }

  async removerAluno(id: string): Promise<void> {
    await this.request(`/api/alunos/${id}`, {
      method: 'DELETE',
    });
  }

  // Vídeos
  async getVideos(): Promise<Video[]> {
    return this.request<Video[]>('/api/videos');
  }

  async adicionarVideo(video: Video): Promise<void> {
    await this.request('/api/videos', {
      method: 'POST',
      body: JSON.stringify(video),
    });
  }

  async atualizarVideo(id: number, video: Video): Promise<void> {
    await this.request(`/api/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(video),
    });
  }

  async removerVideo(id: number): Promise<void> {
    await this.request(`/api/videos/${id}`, {
      method: 'DELETE',
    });
  }

  // Vídeos Liberados
  async getVideosLiberados(): Promise<VideosLiberados> {
    return this.request<VideosLiberados>('/api/videos-liberados');
  }

  async setPermissoesVideosAluno(alunoId: string, videoIds: number[]): Promise<void> {
    await this.request('/api/videos-liberados', {
      method: 'POST',
      body: JSON.stringify({ alunoId, videosLiberados: videoIds }),
    });
  }

  async liberarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    await this.request(`/api/videos-liberados/${alunoId}/${videoId}`, {
      method: 'POST',
    });
  }

  async revogarVideoParaAluno(alunoId: string, videoId: number): Promise<void> {
    await this.request(`/api/videos-liberados/${alunoId}/${videoId}`, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();