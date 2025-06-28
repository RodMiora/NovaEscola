"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import './animations.css';

// Carregue o Equalizer apenas no lado do cliente
const Equalizer = dynamic(
  () => import('@/components/Equalizer'),
  {
    ssr: false,
    loading: () => <div className="w-full h-[200px] bg-gray-800 animate-pulse rounded-lg" />
  }
);

// Componente personalizado para o ícone do YouTube
type Video = {
  id: number;
  thumbnail: string;
  level?: string;
}
type Module = {
  id: number;
  title: string;
  videos: Video[];
}
const YouTubeIcon = ({ size = 16, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
  </svg>
);

// Módulos de violão organizados sequencialmente - definidos fora do componente
const initialModules = [
  {
    id: 1,
    title: 'Módulo 1: Começando do Zero!',
    videos: [
      {
        id: 101,
        thumbnail: '/imagens/Sem_titulo.jpg',
      },
      {
        id: 102,
        thumbnail: '/imagens/Postura.jpg',
      },
      {
        id: 103,
        thumbnail: '/imagens/afinando.png',
        level: 'iniciante'
      },
      {
        id: 104,
        thumbnail: '/imagens/diagrama.png',
        level: 'iniciante'
      },
      {
        id: 105,
        thumbnail: '/imagens/Sem_titulo.jpg',
        level: 'iniciante'
      },
      {
        id: 106,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,buying',
        level: 'iniciante'
      },
      {
        id: 107,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,accessories',
        level: 'iniciante'
      }
    ]
  },
  {
    id: 2,
    title: 'Módulo 2: Posicionando as Mãos e Postura',
    videos: [
      {
        id: 201,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,posture',
        level: 'iniciante'
      },
      {
        id: 202,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,hand',
        level: 'iniciante'
      },
      {
        id: 203,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,chord',
        level: 'iniciante'
      },
      {
        id: 204,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,practice',
        level: 'iniciante'
      },
      {
        id: 205,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,health',
        level: 'iniciante'
      },
      {
        id: 206,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,relax',
        level: 'iniciante'
      },
      {
        id: 207,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,fingers',
        level: 'iniciante-intermediario'
      },
      {
        id: 208,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,strength',
        level: 'iniciante-intermediario'
      }
    ]
  },
  {
    id: 3,
    title: 'Módulo 3: Primeiros Acordes',
    videos: [
      {
        id: 301,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,chords',
        level: 'iniciante'
      },
      {
        id: 302,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,minor',
        level: 'iniciante'
      },
      {
        id: 303,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,transition',
        level: 'iniciante-intermediario'
      },
      {
        id: 304,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,song',
        level: 'iniciante-intermediario'
      },
      {
        id: 305,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,seventh',
        level: 'intermediario'
      },
      {
        id: 306,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,suspended',
        level: 'intermediario'
      },
      {
        id: 307,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,progression',
        level: 'iniciante-intermediario'
      },
      {
        id: 308,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,harmony',
        level: 'intermediario'
      },
      {
        id: 309,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,barre',
        level: 'intermediario'
      }
    ]
  },
  {
    id: 4,
    title: 'Módulo 4: Técnicas de Ritmo',
    videos: [
      {
        id: 401,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,strumming',
        level: 'iniciante'
      },
      {
        id: 402,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,rhythm',
        level: 'iniciante-intermediario'
      },
      {
        id: 403,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,pick',
        level: 'iniciante'
      },
      {
        id: 404,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,fingerpicking',
        level: 'iniciante-intermediario'
      },
      {
        id: 405,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,latin',
        level: 'intermediario'
      },
      {
        id: 406,
        thumbnail: 'https://source.unsplash.com/random/300x200/?guitar,percussion',
        level: 'intermediario'
      }
    ]
  }
];

export default function VideosPage() {
  const router = useRouter();
  
  // Estados únicos (removendo duplicações)
  const [isMounted, setIsMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  // Linha 172 - Corrigir a tipagem do estado
  const [videosLiberados, setVideosLiberados] = useState<number[]>([]);
  const [hoveredModule, setHoveredModule] = useState<number | null>(null);
  const [showLeftArrow, setShowLeftArrow] = useState<{[key: number]: boolean}>({});
  const [showRightArrow, setShowRightArrow] = useState<{[key: number]: boolean}>({});
  const [notificacao, setNotificacao] = useState<{ tipo: "erro" | "sucesso"; texto: string } | null>(null);
  const [mostrarModalYoutube, setMostrarModalYoutube] = useState(false);
  const [videoSelecionado, setVideoSelecionado] = useState<(Video & { youtubeLink?: string }) | null>(null);
  const [youtubeLinks, setYoutubeLinks] = useState<{[key: number]: string}>({});
  const [modulesList, setModulesList] = useState<Module[]>(initialModules);
  const staticBars = [0.6, 0.8, 0.7, 0.9, 0.6];
  const [miniBars, setMiniBars] = useState<number[]>(staticBars);
  
  const carouselRefs = useRef<{[key: number]: HTMLDivElement | null}>({});

  // Funções que estavam faltando
  const handleMouseMove = (moduleId: number, e: React.MouseEvent) => {
    const container = carouselRefs.current[moduleId];
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const containerWidth = rect.width;
    
    setShowLeftArrow(prev => ({ ...prev, [moduleId]: x < containerWidth * 0.2 && container.scrollLeft > 0 }));
    setShowRightArrow(prev => ({ ...prev, [moduleId]: x > containerWidth * 0.8 && container.scrollLeft < container.scrollWidth - container.clientWidth }));
  };

  const handleMouseLeave = (moduleId: number) => {
    setShowLeftArrow(prev => ({ ...prev, [moduleId]: false }));
    setShowRightArrow(prev => ({ ...prev, [moduleId]: false }));
  };

  const scrollCarousel = (moduleId: number, direction: 'left' | 'right') => {
    const container = carouselRefs.current[moduleId];
    if (!container) return;
    
    const scrollAmount = 300;
    const newScrollLeft = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;
    
    container.scrollTo({ left: newScrollLeft, behavior: 'smooth' });
  };

  const abrirVideoYoutube = (videoId: number) => {
    const link = youtubeLinks[videoId];
    if (link) {
      window.open(link, '_blank');
    }
  };

  const abrirModalYoutube = (e: React.MouseEvent, video: Video) => {
    e.stopPropagation();
    setVideoSelecionado({ ...video, youtubeLink: youtubeLinks[video.id] || '' });
    setMostrarModalYoutube(true);
  };

  const salvarLinkYoutube = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoSelecionado) return;
    
    const novosLinks = { ...youtubeLinks, [videoSelecionado.id]: videoSelecionado.youtubeLink || '' };
    setYoutubeLinks(novosLinks);
    localStorage.setItem('youtubeLinks', JSON.stringify(novosLinks));
    
    setNotificacao({ tipo: 'sucesso', texto: 'Link do YouTube salvo com sucesso!' });
    setMostrarModalYoutube(false);
    
    setTimeout(() => setNotificacao(null), 3000);
  };

  useEffect(() => {
    const checkAdmin = () => {
      const username = localStorage.getItem('username');
      console.log('=== DEBUG checkAdmin ===');
      console.log('Username do localStorage:', username);
      console.log('Username é null?', username === null);
      console.log('Username é undefined?', username === undefined);
      console.log('Username é string vazia?', username === '');
      
      const isAdminUser = username === 'administrador';
      setIsAdmin(isAdminUser);
      setCurrentUser(username);
      console.log('isAdmin definido como:', isAdminUser);
      
      if (username && username !== 'administrador') {
        console.log('✅ Usuário não é admin, buscando dados do aluno...');
        const savedAlunos = localStorage.getItem('alunos');
        console.log('Alunos salvos no localStorage:', savedAlunos);
        console.log('savedAlunos é null?', savedAlunos === null);
        
        if (savedAlunos) {
          try {
            const alunos = JSON.parse(savedAlunos);
            console.log('Array de alunos parseado:', alunos);
            console.log('Tipo de alunos:', typeof alunos);
            console.log('alunos é array?', Array.isArray(alunos));
            
            if (Array.isArray(alunos)) {
              console.log('🔍 Procurando usuário com login:', username);
              console.log('Lista de logins disponíveis:', alunos.map(a => a.login));
              
              const currentUserData = alunos.find((a: any) => a.login === username);
              console.log('Dados do usuário encontrado:', currentUserData);
              
              if (currentUserData) {
                console.log('✅ Usuário encontrado! Definindo currentUserId para:', currentUserData.id);
                setCurrentUserId(currentUserData.id);
                setCurrentUser(currentUserData.nome);
              } else {
                console.log('❌ ERRO: Usuário não encontrado no array de alunos');
                console.log('Username procurado:', username);
                console.log('Logins disponíveis:', alunos.map(a => `"${a.login}"`));
              }
            } else {
              console.log('❌ ERRO: alunos não é um array, tipo:', typeof alunos);
            }
          } catch (error) {
            console.log('❌ ERRO ao fazer parse dos alunos:', error);
          }
        } else {
          console.log('❌ ERRO: Não há alunos salvos no localStorage');
        }
      } else {
        console.log('❌ Username é null, undefined, vazio ou é administrador');
        console.log('Condições: username existe?', !!username, 'não é admin?', username !== 'administrador');
      }
      console.log('=== FIM DEBUG checkAdmin ===');
    };
    
    checkAdmin();
    
    const savedLinks = localStorage.getItem('youtubeLinks');
    if (savedLinks) {
      setYoutubeLinks(JSON.parse(savedLinks));
    }
    
    setIsMounted(true);
  }, []);

  // useEffect separado para carregar vídeos liberados
  useEffect(() => {
    if (currentUserId) {
      const loadVideosLiberados = async () => {
        try {
          console.log('=== DEBUG loadVideosLiberados ===');
          console.log('Carregando vídeos liberados para usuário ID:', currentUserId);
          const response = await fetch(`/api/videos-liberados?userId=${currentUserId}`);
          if (response.ok) {
            const data = await response.json();
            console.log('Resposta da API videos-liberados:', data);
            console.log('Tipo de data:', typeof data);
            console.log('Keys de data:', Object.keys(data));
            
            // Verificar se a resposta tem a estrutura esperada
            if (data.videosLiberados && Array.isArray(data.videosLiberados)) {
              setVideosLiberados(data.videosLiberados);
              console.log('videosLiberados state atualizado com array:', data.videosLiberados);
            } else {
              console.log('Estrutura de dados inesperada:', data);
              setVideosLiberados([]);
            }
          } else {
            console.log('Erro na resposta da API:', response.status, response.statusText);
          }
          console.log('=== FIM DEBUG loadVideosLiberados ===');
        } catch (error) {
          console.error('Erro ao carregar vídeos liberados:', error);
        }
      };
      
      loadVideosLiberados();
    } else {
      console.log('currentUserId é null, não carregando vídeos liberados');
    }
  }, [currentUserId]);

  // Função para verificar se um vídeo está liberado para o usuário atual
  // Corrigir a linha 388 e 398 - o problema é que videosLiberados pode estar undefined
  const isVideoLiberadoParaUsuario = (videoId: number): boolean => {
  // Log específico para o vídeo 101
  if (videoId === 101) {
    console.log('🔍 DEBUG VÍDEO 101:');
    console.log('- currentUserId:', currentUserId);
    console.log('- videosLiberados array:', videosLiberados);
    console.log('- videosLiberados.length:', videosLiberados.length);
    console.log('- videosLiberados.includes(101):', videosLiberados.includes(101));
    console.log('- typeof videoId:', typeof videoId);
    console.log('- videoId === 101:', videoId === 101);
  }
  
  if (!currentUserId) {
    console.log(`❌ Usuário não identificado para vídeo ${videoId}`);
    return false;
  }
  
  // Agora videosLiberados é sempre um array
  const liberado = videosLiberados.includes(videoId);
  console.log(`🔐 Vídeo ${videoId} liberado:`, liberado);
  return liberado;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">

      {/* TOAST DE FEEDBACK */}
      {notificacao && (
        <div className={`fixed top-20 right-10 z-40 py-2 px-6 rounded-lg shadow-lg animate-fade-in
          ${notificacao.tipo === "erro" ? "bg-red-600 text-white" : "bg-green-600 text-white"}`}>
          {notificacao.texto}
        </div>
      )}

      {/* Estilos CSS para o mini equalizador */}
      <style jsx>{`
        @keyframes bar1 {
          0%, 100% { height: 6px; background-color: #FF5722; }
          50% { height: 10px; background-color: #FF8A65; }
        }
        @keyframes bar2 {
          0%, 100% { height: 9px; background-color: #FF8A65; }
          50% { height: 5px; background-color: #FF5722; }
        }
        @keyframes bar3 {
          0%, 100% { height: 12px; background-color: #FF5722; }
          33% { height: 16px; background-color: #FF8A65; }
          66% { height: 8px; background-color: #E64A19; }
        }
        .equalizer-bar1 {
          width: 2px;
          height: 6px;
          animation: bar1 1.2s ease-in-out infinite;
        }
        .equalizer-bar2 {
          width: 2px;
          height: 9px;
          animation: bar2 0.8s ease-in-out infinite;
        }
        .equalizer-bar3 {
          width: 2px;
          height: 12px;
          animation: bar3 1.5s ease-in-out infinite;
        }
      `}</style>
      <div className="fixed top-0 left-0 w-full bg-gray-800 text-gray-100 p-2 flex justify-between items-center z-50">
        {/* ESQUERDA - Equalizer + Nome */}
        <div className="flex items-center">
          <div className="w-6 h-6 mr-2 flex items-center justify-center">
            <div className="flex items-end space-x-[1px]">
              {staticBars.map((height, index) => (
                <div
                  key={index}
                  className="w-[5px] bg-gradient-to-t from-orange-500 to-green-500 transition-all duration-300 ease-out"
                  style={{ height: `${isMounted ? miniBars[index] : height}rem` }}
                />
              ))}
            </div>
          </div>
          <span className="font-bold text-sm">Escola de Música Coutinho</span>
        </div>
        {/* CENTRO - Bem-vindo */}
        {!isAdmin && currentUser && (
          <div className="text-orange-400 font-semibold text-2xl">
            Bem vindo {currentUser}
          </div>
        )}
        {/* DIREITA - Painel (se admin) + Sair */}
        <div className="flex items-center space-x-4">
          {isAdmin && (
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-base font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/50"
              onClick={() => router.push('/painel')}
            >
              Painel de Administração
            </button>
          )}
          <button
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-base font-medium rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
            onClick={() => {
              localStorage.removeItem('isLoggedIn');
              localStorage.removeItem('username');
              localStorage.removeItem('isAdmin');
              localStorage.removeItem('alunoId');
              window.location.href = '/';
            }}
          >
            SAIR
          </button>
        </div>
      </div>
      {/* Frase motivacional centralizada acima dos vídeos */}
      <div className="mt-24 mb-4 flex justify-center">
        <div
          className="text-white font-bold"
          style={{
            fontSize: '28px',
            textShadow: '0 0 10px rgba(255,255,255,0.7)',
            letterSpacing: '0.7px',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }}
        >
          "A Repetição leva à Perfeição"
        </div>
      </div>
      {/* Cabeçalho */}
      <div className="pb-4 flex flex-col items-center">
        <Equalizer />
      </div>
      {/* Módulos com vídeos em carrossel horizontal */}
      <div className="px-4 pb-12 w-full max-w-6xl mx-auto space-y-12">
        {modulesList.map((module) => (
          <div key={module.id} className="space-y-4">
            {/* Título do módulo */}
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">{module.title}</h2>
            </div>
            {/* Carrossel de vídeos */}
            <div
              className="relative overflow-hidden"
              onMouseMove={(e) => handleMouseMove(module.id, e)}
              onMouseLeave={() => handleMouseLeave(module.id)}
            >
              {/* Seta de navegação esquerda */}
              {showLeftArrow[module.id] && (
                <button
                  onClick={() => scrollCarousel(module.id, 'left')}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-orange-800 bg-opacity-70 text-white p-3 rounded-r-full z-10 hover:bg-opacity-90 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              {/* Seta de navegação direita */}
              {showRightArrow[module.id] && (
                <button
                  onClick={() => scrollCarousel(module.id, 'right')}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-orange-800 bg-opacity-70 text-white p-3 rounded-l-full z-10 hover:bg-opacity-90 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-orange-900/30"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              {/* Carrossel de vídeos com altura mínima para acomodar os cards */}
              <div
                ref={(el: HTMLDivElement | null) => {
                  carouselRefs.current[module.id] = el;
                }}
                className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  minHeight: '460px'
                }}
              >
                {module.videos.map((video) => (
                  <div
                    key={video.id}
                    className="relative"
                    style={{
                      width: '260px',
                      height: '440px',
                      flexShrink: 0,
                      margin: '0 8px'
                    }}
                  >
                    <img
                      src={video.thumbnail}
                      alt="Thumbnail do vídeo"
                      className="rounded-lg cursor-pointer shadow-lg border border-gray-700 hover:border-orange-500 transition-colors"
                      style={{
                        width: '260px',
                        height: '440px',
                        objectFit: 'cover',
                        filter: !isVideoLiberadoParaUsuario(video.id) && !isAdmin ? 'grayscale(1) brightness(0.6) contrast(1.2)' : 'none'
                      }}
                      onClick={() => youtubeLinks[video.id] ? abrirVideoYoutube(video.id) : null}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent hover:from-black/50 transition-all duration-300">
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex space-x-2 z-20">
                          <button
                            onClick={(e) => abrirModalYoutube(e, video)}
                            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 cursor-pointer transform transition-all duration-200 ease-in-out"
                            title="Adicionar link do YouTube"
                          >
                            <YouTubeIcon size={16} />
                          </button>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <button
                          className={`rounded-full p-3 transform hover:scale-110 transition-transform ${isVideoLiberadoParaUsuario(video.id) || isAdmin ? 'bg-orange-600' : 'bg-gray-800 border-2 border-red-500'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (youtubeLinks[video.id] && (isVideoLiberadoParaUsuario(video.id) || isAdmin)) {
                              abrirVideoYoutube(video.id);
                            }
                          }}
                          disabled={!isVideoLiberadoParaUsuario(video.id) && !isAdmin}
                        >
                          {isVideoLiberadoParaUsuario(video.id) || isAdmin ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {module.id !== modulesList[modulesList.length - 1].id && (
              <div className="border-b border-gray-700 mt-8"></div>
            )}
          </div>
        ))}
      </div>
      {/* Modal para adicionar link do YouTube */}
      {mostrarModalYoutube && videoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-white">Adicionar Link do YouTube</h2>
            <p className="text-gray-300 mb-4">Vídeo ID: {videoSelecionado.id}</p>
            <form onSubmit={salvarLinkYoutube}>
              <div className="mb-4">
                <label className="block text-white text-sm font-bold mb-2">Link do YouTube</label>
                <input
                  type="text"
                  value={videoSelecionado.youtubeLink || ''}
                  onChange={(e) => setVideoSelecionado({...videoSelecionado, youtubeLink: e.target.value})}
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded py-2 px-3"
                  placeholder="https://www.youtube.com/watch?v=..."
                  required
                />
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setMostrarModalYoutube(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <YouTubeIcon size={16} className="mr-2" /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
