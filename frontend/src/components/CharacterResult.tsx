import React from 'react';
import type { HalloweenCharacter, CharacterInfo } from '../types';
import { features } from '../config/features';

interface CharacterResultProps {
  character: HalloweenCharacter;
  characterInfo: CharacterInfo;
  onRetakeTest: () => void;
  onViewProfile?: () => void;
}

const CharacterResult: React.FC<CharacterResultProps> = ({
  characterInfo,
  onRetakeTest,
  onViewProfile,
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Result Container */}
      <div className="bg-halloween-dark border-2 border-halloween-purple rounded-2xl p-6 sm:p-8 lg:p-10 shadow-2xl shadow-halloween-purple/30">

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-spooky text-halloween-orange mb-2">
            당신의 할로윈 캐릭터는...
          </h1>
        </div>

        {/* Character Image with Floating Animation */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <img
              src={characterInfo.imagePath}
              alt={characterInfo.name}
              className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 object-contain animate-float"
              onError={(e) => {
                // Fallback if image doesn't exist
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"%3E%3Crect fill="%236a0dad" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" font-size="60" text-anchor="middle" dy=".3em" fill="%23ff6b35"%3E%3F%3C/text%3E%3C/svg%3E';
              }}
            />
            {/* Glow effect */}
            <div className="absolute inset-0 bg-halloween-orange/20 rounded-full blur-3xl -z-10 animate-pulse" />
          </div>
        </div>

        {/* Character Name */}
        <div className="text-center mb-6">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-spooky text-halloween-purple mb-2">
            {characterInfo.name}
          </h2>
          <div className="h-1 w-32 bg-gradient-to-r from-halloween-orange via-halloween-purple to-halloween-orange mx-auto rounded-full" />
        </div>

        {/* Character Description */}
        <div className="mb-8">
          <p className="text-base sm:text-lg lg:text-xl font-korean text-white leading-relaxed text-center max-w-2xl mx-auto">
            {characterInfo.description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
          {/* Retake Test Button */}
          <button
            onClick={onRetakeTest}
            className="
              w-full sm:w-auto
              px-8 py-4
              bg-halloween-orange
              text-halloween-darker
              font-korean font-bold text-lg
              rounded-lg
              transition-all duration-300 ease-in-out
              transform hover:scale-105 active:scale-95
              hover:bg-halloween-orange/90
              hover:shadow-lg hover:shadow-halloween-orange/50
              focus:outline-none focus:ring-2 focus:ring-halloween-orange focus:ring-offset-2 focus:ring-offset-halloween-darker
            "
            aria-label="테스트 다시하기"
          >
            🔄 테스트 다시하기
          </button>

          {/* View Profile Button (Conditional) */}
          {features.emailAuth && onViewProfile && (
            <button
              onClick={onViewProfile}
              className="
                w-full sm:w-auto
                px-8 py-4
                bg-halloween-purple
                text-white
                font-korean font-bold text-lg
                rounded-lg
                transition-all duration-300 ease-in-out
                transform hover:scale-105 active:scale-95
                hover:bg-halloween-purple/90
                hover:shadow-lg hover:shadow-halloween-purple/50
                focus:outline-none focus:ring-2 focus:ring-halloween-purple focus:ring-offset-2 focus:ring-offset-halloween-darker
              "
              aria-label="프로필 보기"
            >
              👤 프로필 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterResult;
