import React from 'react';
import type { Question } from '../types';

interface TestQuestionProps {
  question: Question;
  selectedAnswer: string | null;
  onAnswer: (answerId: string) => void;
}

const TestQuestion: React.FC<TestQuestionProps> = ({
  question,
  selectedAnswer,
  onAnswer,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Question Text */}
      <div className="mb-8 sm:mb-10 lg:mb-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-korean font-semibold text-halloween-orange text-center leading-relaxed">
          {question.text}
        </h2>
      </div>

      {/* Answer Options */}
      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
        {question.answers.map((answer) => {
          const isSelected = selectedAnswer === answer.id;
          
          return (
            <button
              key={answer.id}
              onClick={() => onAnswer(answer.id)}
              style={isSelected ? { backgroundColor: '#ff6b35', borderColor: '#ff6b35' } : {}}
              className={`
                w-full p-4 sm:p-5 lg:p-6
                rounded-lg
                font-korean text-base sm:text-lg lg:text-xl
                transition-all duration-300 ease-in-out
                transform hover:scale-[1.02] active:scale-[0.98]
                border-2
                flex items-center justify-between
                ${
                  isSelected
                    ? 'text-black shadow-lg shadow-halloween-orange/50'
                    : 'bg-black border-halloween-purple/50 text-white hover:border-halloween-purple hover:bg-halloween-purple/20 hover:shadow-md hover:shadow-halloween-purple/30'
                }
                focus:outline-none focus:ring-2 focus:ring-halloween-orange focus:ring-offset-2 focus:ring-offset-black
              `}
              aria-pressed={isSelected}
              aria-label={`${answer.text}${isSelected ? ' (선택됨)' : ''}`}
            >
              <span className="text-left leading-relaxed flex-1 pr-4">
                {answer.text}
              </span>
              
              {/* Selection Indicator */}
              {isSelected && (
                <span className="text-black font-bold text-2xl flex-shrink-0" aria-hidden="true">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TestQuestion;
