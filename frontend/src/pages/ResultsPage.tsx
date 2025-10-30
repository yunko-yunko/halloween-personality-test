import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import CharacterResult from '../components/CharacterResult';
import { resetTest, selectResult } from '../store/slices/testSlice';
import { features } from '../config/features';
import type { AppDispatch } from '../store/store';

export default function ResultsPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const result = useSelector(selectResult);

  // Redirect to home if no result is available
  useEffect(() => {
    if (!result) {
      navigate('/', { replace: true });
    }
  }, [result, navigate]);

  // Handle retake test
  const handleRetakeTest = () => {
    dispatch(resetTest());
    navigate('/test');
  };

  // Handle view profile (advanced mode only)
  const handleViewProfile = () => {
    navigate('/profile');
  };

  // Handle social sharing
  const handleShare = (platform: 'twitter' | 'facebook' | 'kakao') => {
    if (!result) return;

    const shareText = `나의 할로윈 캐릭터는 ${result.characterInfo.name}! 🎃`;
    const shareUrl = window.location.origin;

    switch (platform) {
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'facebook':
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
          '_blank',
          'width=550,height=420'
        );
        break;
      case 'kakao':
        // Kakao sharing would require Kakao SDK integration
        // For now, just copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`);
        alert('링크가 클립보드에 복사되었습니다!');
        break;
    }
  };

  // Show loading state while checking result
  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-halloween-orange mb-4"></div>
          <p className="font-korean text-xl text-halloween-purple">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Main Result Display */}
        <CharacterResult
          character={result.character}
          characterInfo={result.characterInfo}
          onRetakeTest={handleRetakeTest}
          onViewProfile={features.emailAuth ? handleViewProfile : undefined}
        />

        {/* Social Sharing Section */}
        <div className="mt-12 max-w-4xl mx-auto px-4">
          <div className="bg-halloween-dark/60 backdrop-blur-sm border-2 border-halloween-purple/30 rounded-xl p-6 sm:p-8">
            <h3 className="text-2xl sm:text-3xl font-spooky text-halloween-orange text-center mb-6">
              결과 공유하기 👻
            </h3>
            
            <div className="flex flex-wrap justify-center gap-4">
              {/* Twitter Share Button */}
              <button
                onClick={() => handleShare('twitter')}
                className="
                  flex items-center gap-2
                  px-6 py-3
                  bg-[#1DA1F2] hover:bg-[#1a8cd8]
                  text-white
                  font-korean font-semibold
                  rounded-lg
                  transition-all duration-300
                  transform hover:scale-105 active:scale-95
                  hover:shadow-lg hover:shadow-[#1DA1F2]/50
                  focus:outline-none focus:ring-2 focus:ring-[#1DA1F2] focus:ring-offset-2 focus:ring-offset-halloween-darker
                "
                aria-label="트위터에 공유하기"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>트위터</span>
              </button>

              {/* Facebook Share Button */}
              <button
                onClick={() => handleShare('facebook')}
                className="
                  flex items-center gap-2
                  px-6 py-3
                  bg-[#4267B2] hover:bg-[#365899]
                  text-white
                  font-korean font-semibold
                  rounded-lg
                  transition-all duration-300
                  transform hover:scale-105 active:scale-95
                  hover:shadow-lg hover:shadow-[#4267B2]/50
                  focus:outline-none focus:ring-2 focus:ring-[#4267B2] focus:ring-offset-2 focus:ring-offset-halloween-darker
                "
                aria-label="페이스북에 공유하기"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>페이스북</span>
              </button>

              {/* Kakao Share Button */}
              <button
                onClick={() => handleShare('kakao')}
                className="
                  flex items-center gap-2
                  px-6 py-3
                  bg-[#FEE500] hover:bg-[#e5ce00]
                  text-[#000000]
                  font-korean font-semibold
                  rounded-lg
                  transition-all duration-300
                  transform hover:scale-105 active:scale-95
                  hover:shadow-lg hover:shadow-[#FEE500]/50
                  focus:outline-none focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2 focus:ring-offset-halloween-darker
                "
                aria-label="카카오톡에 공유하기"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3zm5.907 8.06l1.47-1.424a.472.472 0 0 0-.656-.678l-1.928 1.866V9.282a.472.472 0 0 0-.944 0v2.557a.471.471 0 0 0 0 .222V13.5a.472.472 0 0 0 .944 0v-1.363l.427-.413 1.428 2.033a.472.472 0 1 0 .773-.543l-1.514-2.155zm-2.958 1.924h-1.46V9.297a.472.472 0 0 0-.943 0v4.159c0 .26.21.472.471.472h1.932a.472.472 0 1 0 0-.944zm-5.857-1.092l.696-1.707.638 1.707H9.092zm2.523.488l.002-.016a.469.469 0 0 0-.127-.32l-1.046-2.8a.69.69 0 0 0-.627-.474.696.696 0 0 0-.653.447l-1.661 4.075a.472.472 0 0 0 .874.357l.33-.813h2.07l.299.8a.472.472 0 1 0 .884-.33l-.345-.926zM8.293 9.302a.472.472 0 0 0-.471-.472H4.577a.472.472 0 1 0 0 .944h1.16v3.736a.472.472 0 0 0 .944 0V9.774h1.14c.261 0 .472-.212.472-.472z"/>
                </svg>
                <span>카카오톡</span>
              </button>
            </div>

            <p className="text-center text-gray-400 font-korean text-sm mt-6">
              친구들과 함께 할로윈 성격 테스트를 즐겨보세요! 🎃
            </p>
          </div>
        </div>

        {/* Additional Info Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 font-korean text-sm">
            이 테스트는 MBTI 기반 할로윈 캐릭터 매칭 시스템입니다
          </p>
        </div>
      </div>
    </div>
  );
}
