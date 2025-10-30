import React from 'react';

interface ProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentPage,
  totalPages,
}) => {
  const progressPercentage = (currentPage / totalPages) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 sm:mb-10 lg:mb-12">
      {/* Page Counter */}
      <div className="flex justify-center items-center mb-4">
        <span className="text-2xl sm:text-3xl lg:text-4xl font-spooky text-halloween-orange">
          {currentPage}
          <span className="text-halloween-purple mx-1">/</span>
          {totalPages}
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3 sm:h-4 bg-black border-2 rounded-full overflow-hidden shadow-inner" style={{ borderColor: '#6a0dad80' }}>
        {/* Progress Bar Fill */}
        <div
          className="absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out"
          style={{ 
            width: `${progressPercentage}%`,
            background: 'linear-gradient(to right, #6a0dad, #ff6b35, #8b0000)',
            boxShadow: '0 0 20px rgba(255, 107, 53, 0.5)'
          }}
          role="progressbar"
          aria-valuenow={currentPage}
          aria-valuemin={1}
          aria-valuemax={totalPages}
          aria-label={`진행률: ${currentPage}/${totalPages} 페이지`}
        />

        {/* Progress Bar Segments (Visual Markers) */}
        <div className="absolute inset-0 flex pointer-events-none">
          {Array.from({ length: totalPages - 1 }).map((_, index) => (
            <div
              key={index}
              className="flex-1 border-r"
              style={{ 
                borderColor: 'rgba(255, 255, 255, 0.2)',
                marginLeft: index === 0 ? `${100 / totalPages}%` : '0' 
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress Text (Screen Reader Friendly) */}
      <div className="sr-only">
        {currentPage} of {totalPages} pages completed
      </div>
    </div>
  );
};

export default ProgressIndicator;
