import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { useSelector } from 'react-redux';
import { authService } from '../services/authService';
import { logoutUser, selectUser } from '../store/slices/authSlice';
import { LoadingSpinner } from '../components';
import type { TestResult } from '../types';
import characterDescriptions from '../data/character-descriptions.json';

export default function ProfilePage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useSelector(selectUser);
  
  const [testHistory, setTestHistory] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile and test history on mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch test history
        const historyResponse = await authService.getHistory();
        setTestHistory(historyResponse.results);
      } catch (err: any) {
        console.error('Failed to fetch profile data:', err);
        setError(err.message || '프로필 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (err: any) {
      console.error('Logout failed:', err);
      // Even if logout fails, we're redirected (logoutUser clears state even on error)
      navigate('/');
    }
  };

  // Handle take new test
  const handleTakeNewTest = () => {
    navigate('/test');
  };

  // Format date to Korean format
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="large" />
          <p className="font-korean text-xl text-halloween-purple mt-4">
            프로필을 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-halloween-dark/60 backdrop-blur-sm border-2 border-halloween-blood/50 rounded-xl p-8 text-center">
          <div className="text-6xl mb-4">😱</div>
          <h2 className="text-2xl font-spooky text-halloween-blood mb-4">오류 발생</h2>
          <p className="font-korean text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="
              px-6 py-3
              bg-halloween-orange hover:bg-halloween-orange/80
              text-white font-korean font-semibold
              rounded-lg
              transition-all duration-300
              transform hover:scale-105 active:scale-95
              focus:outline-none focus:ring-2 focus:ring-halloween-orange focus:ring-offset-2 focus:ring-offset-halloween-darker
            "
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-spooky text-halloween-orange text-center mb-4">
            내 프로필 👤
          </h1>
          <p className="text-center text-gray-400 font-korean text-lg">
            당신의 할로윈 성격 테스트 기록
          </p>
        </div>

        {/* User Info Card */}
        <div className="bg-halloween-dark/60 backdrop-blur-sm border-2 border-halloween-purple/30 rounded-xl p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-spooky text-halloween-purple mb-2">
                사용자 정보
              </h2>
              <p className="font-korean text-gray-300 text-lg mb-1">
                <span className="text-halloween-orange">이메일:</span> {user?.email}
              </p>
              <p className="font-korean text-gray-400 text-sm">
                가입일: {user?.createdAt ? formatDate(user.createdAt) : '-'}
              </p>
            </div>
            
            <button
              onClick={handleLogout}
              className="
                px-6 py-3
                bg-halloween-blood hover:bg-halloween-blood/80
                text-white font-korean font-semibold
                rounded-lg
                transition-all duration-300
                transform hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-halloween-blood focus:ring-offset-2 focus:ring-offset-halloween-darker
                whitespace-nowrap
              "
            >
              로그아웃
            </button>
          </div>
        </div>

        {/* Test History Section */}
        <div className="bg-halloween-dark/60 backdrop-blur-sm border-2 border-halloween-purple/30 rounded-xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl sm:text-3xl font-spooky text-halloween-orange">
              테스트 기록 📜
            </h2>
            
            <button
              onClick={handleTakeNewTest}
              className="
                px-6 py-3
                bg-halloween-orange hover:bg-halloween-orange/80
                text-white font-korean font-semibold
                rounded-lg
                transition-all duration-300
                transform hover:scale-105 active:scale-95
                hover:shadow-lg hover:shadow-halloween-orange/50
                focus:outline-none focus:ring-2 focus:ring-halloween-orange focus:ring-offset-2 focus:ring-offset-halloween-darker
                whitespace-nowrap
              "
            >
              새 테스트 하기 🎃
            </button>
          </div>

          {/* Test Results List */}
          {testHistory.length === 0 ? (
            // Empty state
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👻</div>
              <h3 className="text-2xl font-spooky text-halloween-purple mb-2">
                아직 테스트 기록이 없습니다
              </h3>
              <p className="font-korean text-gray-400 mb-6">
                첫 번째 할로윈 성격 테스트를 시작해보세요!
              </p>
              <button
                onClick={handleTakeNewTest}
                className="
                  px-8 py-4
                  bg-halloween-purple hover:bg-halloween-purple/80
                  text-white font-korean font-semibold text-lg
                  rounded-lg
                  transition-all duration-300
                  transform hover:scale-105 active:scale-95
                  hover:shadow-lg hover:shadow-halloween-purple/50
                  focus:outline-none focus:ring-2 focus:ring-halloween-purple focus:ring-offset-2 focus:ring-offset-halloween-darker
                "
              >
                테스트 시작하기
              </button>
            </div>
          ) : (
            // Test results grid
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testHistory.map((result) => {
                const characterInfo = characterDescriptions[result.characterType];
                
                return (
                  <div
                    key={result.id}
                    className="
                      bg-halloween-darker/50 border-2 border-halloween-purple/20
                      rounded-lg p-6
                      transition-all duration-300
                      hover:border-halloween-orange/50 hover:shadow-lg hover:shadow-halloween-orange/20
                      transform hover:scale-105
                    "
                  >
                    {/* Character Image */}
                    <div className="flex justify-center mb-4">
                      <img
                        src={characterInfo.imagePath}
                        alt={characterInfo.name}
                        className="w-32 h-32 object-contain animate-float"
                        onError={(e) => {
                          // Fallback if image doesn't exist
                          e.currentTarget.src = '/assets/characters/placeholder.png';
                        }}
                      />
                    </div>

                    {/* Character Name */}
                    <h3 className="text-2xl font-spooky text-halloween-orange text-center mb-2">
                      {characterInfo.name}
                    </h3>

                    {/* Date */}
                    <p className="font-korean text-gray-400 text-sm text-center mb-4">
                      {formatDate(result.completedAt)}
                    </p>

                    {/* Description */}
                    <p className="font-korean text-gray-300 text-sm leading-relaxed">
                      {characterInfo.description}
                    </p>

                    {/* MBTI Type (hidden from user, but stored) */}
                    <div className="mt-4 pt-4 border-t border-halloween-purple/20">
                      <p className="font-korean text-gray-500 text-xs text-center">
                        테스트 ID: {result.id.slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 font-korean text-sm">
            모든 테스트 기록은 안전하게 저장됩니다 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
