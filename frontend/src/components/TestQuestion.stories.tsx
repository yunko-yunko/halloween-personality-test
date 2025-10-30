import React, { useState } from 'react';
import TestQuestion from './TestQuestion';
import type { Question } from '../types';

// Sample questions for demonstration
const sampleQuestions: Question[] = [
  {
    id: 'ei_1',
    text: '주말에 에너지를 충전하는 방법은?',
    dimension: 'EI',
    answers: [
      {
        id: 'ei_1_a',
        text: '친구들과 만나서 활동적으로 보낸다',
        value: 'E',
      },
      {
        id: 'ei_1_b',
        text: '집에서 혼자 조용히 쉰다',
        value: 'I',
      },
    ],
  },
  {
    id: 'ns_1',
    text: '새로운 프로젝트를 시작할 때 당신은?',
    dimension: 'NS',
    answers: [
      {
        id: 'ns_1_a',
        text: '전체적인 비전과 가능성을 먼저 생각한다',
        value: 'N',
      },
      {
        id: 'ns_1_b',
        text: '구체적인 단계와 실행 방법을 먼저 계획한다',
        value: 'S',
      },
    ],
  },
];

/**
 * Interactive demo of TestQuestion component
 * This demonstrates the component with state management
 */
export const InteractiveDemo: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const currentQuestion = sampleQuestions[currentQuestionIndex];

  const handleAnswer = (answerId: string) => {
    setSelectedAnswer(answerId);
  };

  const handleNext = () => {
    if (currentQuestionIndex < sampleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
    }
  };

  return (
    <div className="min-h-screen bg-halloween-darker py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-spooky text-halloween-orange text-center mb-8">
          TestQuestion Component Demo
        </h1>
        
        <div className="mb-6 text-center text-gray-400">
          Question {currentQuestionIndex + 1} of {sampleQuestions.length}
        </div>

        <TestQuestion
          question={currentQuestion}
          selectedAnswer={selectedAnswer}
          onAnswer={handleAnswer}
        />

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-2 bg-halloween-purple text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-halloween-purple/80 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={currentQuestionIndex === sampleQuestions.length - 1}
            className="px-6 py-2 bg-halloween-orange text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-halloween-orange/80 transition-colors"
          >
            Next
          </button>
        </div>

        {selectedAnswer && (
          <div className="mt-6 text-center text-halloween-green">
            Selected: {selectedAnswer}
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveDemo;
