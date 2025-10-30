import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TestQuestion from '../components/TestQuestion';
import ProgressIndicator from '../components/ProgressIndicator';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { testService } from '../services/testService';
import { extractErrorMessage } from '../utils/errorMessages';
import {
  setQuestions,
  setAnswer,
  nextPage,
  prevPage,
  setLoading,
  submitTestSuccess,
  submitTestFailure,
  selectCurrentPageQuestions,
  selectAnswers,
  selectCurrentPage,
  selectTotalPages,
  selectIsCurrentPageComplete,
  selectIsTestComplete,
  selectAnswersForSubmission,
  selectIsLoading,
  selectError,
} from '../store/slices/testSlice';
import type { AppDispatch } from '../store/store';

export default function TestPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  // Redux state
  const currentPageQuestions = useSelector(selectCurrentPageQuestions);
  const answers = useSelector(selectAnswers);
  const currentPage = useSelector(selectCurrentPage);
  const totalPages = useSelector(selectTotalPages);
  const isCurrentPageComplete = useSelector(selectIsCurrentPageComplete);
  const isTestComplete = useSelector(selectIsTestComplete);
  const answersForSubmission = useSelector(selectAnswersForSubmission);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  // Local state for validation messages
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load questions on mount
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        dispatch(setLoading(true));
        const response = await testService.getQuestions();
        dispatch(setQuestions(response.questions));
      } catch (err: any) {
        const errorMessage = extractErrorMessage(err);
        dispatch(submitTestFailure(errorMessage));
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadQuestions();
  }, [dispatch]);

  // Handle answer selection
  const handleAnswer = (questionId: string, answerId: string) => {
    dispatch(setAnswer({ questionId, answerId }));
    setValidationError(null); // Clear validation error when user answers
  };

  // Handle next page navigation
  const handleNext = () => {
    if (!isCurrentPageComplete) {
      setValidationError('모든 질문에 답변해주세요.');
      return;
    }
    setValidationError(null);
    dispatch(nextPage());
  };

  // Handle previous page navigation
  const handlePrevious = () => {
    setValidationError(null);
    dispatch(prevPage());
  };

  // Handle test submission
  const handleSubmit = async () => {
    if (!isTestComplete) {
      setValidationError('모든 질문에 답변해주세요.');
      return;
    }

    try {
      dispatch(setLoading(true));
      setValidationError(null);

      const result = await testService.submitTest(answersForSubmission);
      
      dispatch(submitTestSuccess({
        character: result.character,
        characterInfo: result.characterInfo,
        mbtiType: result.mbtiType,
      }));

      // Navigate to results page
      navigate('/results');
    } catch (err: any) {
      const errorMessage = extractErrorMessage(err);
      dispatch(submitTestFailure(errorMessage));
      setValidationError(errorMessage);
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Show loading state
  if (isLoading && currentPageQuestions.length === 0) {
    return <LoadingSpinner message="질문을 불러오는 중..." size="large" fullScreen />;
  }

  // Show error state
  if (error && currentPageQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-halloween-dark/80 backdrop-blur-sm border-2 border-halloween-blood/50 rounded-lg p-8 text-center">
          <p className="font-korean text-xl text-halloween-blood mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-halloween-orange text-halloween-darker font-korean font-bold rounded-lg hover:bg-halloween-blood transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-halloween-darker via-halloween-dark to-halloween-darker py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Indicator */}
        <ProgressIndicator currentPage={currentPage} totalPages={totalPages} />

        {/* Questions */}
        <div className="space-y-12 mb-12">
          {currentPageQuestions.map((question) => (
            <TestQuestion
              key={question.id}
              question={question}
              selectedAnswer={answers[question.id] || null}
              onAnswer={(answerId) => handleAnswer(question.id, answerId)}
            />
          ))}
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="max-w-3xl mx-auto mb-6 px-4">
            <ErrorMessage
              message={validationError}
              onDismiss={() => setValidationError(null)}
            />
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex justify-between items-center gap-4">
            {/* Previous Button */}
            {currentPage > 1 ? (
              <button
                onClick={handlePrevious}
                className="px-8 py-4 bg-halloween-purple/80 text-white font-korean font-bold text-lg rounded-lg border-2 border-halloween-purple hover:bg-halloween-purple hover:shadow-lg hover:shadow-halloween-purple/50 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                ← 이전
              </button>
            ) : (
              <div className="w-32"></div> // Spacer for alignment
            )}

            {/* Next or Submit Button */}
            {currentPage < totalPages ? (
              <button
                onClick={handleNext}
                disabled={!isCurrentPageComplete}
                className={`px-8 py-4 font-korean font-bold text-lg rounded-lg border-2 transition-all duration-300 transform ${
                  isCurrentPageComplete
                    ? 'bg-halloween-orange text-halloween-darker border-halloween-orange hover:bg-halloween-blood hover:border-halloween-blood hover:shadow-lg hover:shadow-halloween-orange/50 hover:scale-105 active:scale-95'
                    : 'bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                다음 →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!isTestComplete || isLoading}
                className={`px-8 py-4 font-korean font-bold text-lg rounded-lg border-2 transition-all duration-300 transform ${
                  isTestComplete && !isLoading
                    ? 'bg-gradient-to-r from-halloween-orange to-halloween-blood text-halloween-darker border-halloween-orange hover:shadow-lg hover:shadow-halloween-orange/50 hover:scale-105 active:scale-95'
                    : 'bg-gray-600 text-gray-400 border-gray-600 cursor-not-allowed opacity-50'
                }`}
              >
                {isLoading ? '제출 중...' : '결과 보기 🎃'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
