import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { features } from '../config/features';

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleStartTest = () => {
    // In advanced mode, redirect to email entry if not authenticated
    if (features.emailAuth && !isAuthenticated) {
      navigate('/auth/email');
    } else {
      navigate('/test');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 w-32 h-32 bg-halloween-orange rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-halloween-purple rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-halloween-green rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-4xl w-full text-center">
        {/* Title */}
        <h1 className="font-spooky text-6xl md:text-8xl text-halloween-orange mb-6 animate-pulse drop-shadow-[0_0_20px_rgba(255,107,53,0.5)]">
          할로윈 성격 테스트
        </h1>

        {/* Subtitle */}
        <p className="font-korean text-xl md:text-2xl text-halloween-purple mb-8 drop-shadow-[0_0_10px_rgba(106,13,173,0.5)]">
          당신은 어떤 할로윈 캐릭터일까요?
        </p>

        {/* Description */}
        <div className="bg-halloween-dark/80 backdrop-blur-sm border-2 border-halloween-orange/30 rounded-lg p-8 mb-10 shadow-2xl">
          <p className="font-korean text-lg md:text-xl text-white leading-relaxed mb-4">
            15개의 질문을 통해 당신의 성격을 분석하고,
          </p>
          <p className="font-korean text-lg md:text-xl text-white leading-relaxed mb-4">
            8가지 할로윈 캐릭터 중 하나로 매칭해드립니다.
          </p>
          <p className="font-korean text-base md:text-lg text-halloween-green">
            🎃 좀비, 조커, 해골, 수녀, 잭오랜턴, 뱀파이어, 유령, 프랑켄슈타인 🎃
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={handleStartTest}
          className="group relative inline-flex items-center justify-center px-12 py-5 text-2xl font-korean font-bold text-halloween-darker bg-gradient-to-r from-halloween-orange to-halloween-blood rounded-full overflow-hidden shadow-[0_0_30px_rgba(255,107,53,0.6)] hover:shadow-[0_0_50px_rgba(255,107,53,0.8)] transition-all duration-300 transform hover:scale-105 active:scale-95"
        >
          <span className="relative z-10">테스트 시작하기</span>
          <div className="absolute inset-0 bg-gradient-to-r from-halloween-blood to-halloween-orange opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

        {/* Additional info */}
        <p className="font-korean text-sm text-gray-400 mt-8">
          소요 시간: 약 3-5분 | 총 15개 질문
        </p>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-halloween-darker to-transparent"></div>
    </div>
  );
}
