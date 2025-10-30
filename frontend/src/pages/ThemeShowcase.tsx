import React, { useState } from 'react';

/**
 * ThemeShowcase Component
 * 
 * This component demonstrates all Halloween theme styles and components.
 * Used for testing theme consistency and visual verification.
 * Can be accessed during development to preview all theme elements.
 */
const ThemeShowcase: React.FC = () => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="container-halloween min-h-screen p-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center animate-fadeIn">
          <h1 className="text-halloween-heading mb-4">
            Halloween Theme Showcase
          </h1>
          <p className="text-halloween-body">
            모든 할로윈 테마 컴포넌트와 스타일을 확인하세요
          </p>
        </div>

        {/* Typography Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Typography</h2>
          <div className="space-y-3">
            <h1 className="text-halloween-heading">Heading Text (Creepster)</h1>
            <h2 className="text-halloween-subheading">Subheading Text</h2>
            <p className="text-halloween-body">
              Body text in Korean: 할로윈 성격 테스트에 오신 것을 환영합니다!
            </p>
            <p className="text-halloween-small">
              Small text: 작은 텍스트 예시입니다.
            </p>
            <p className="text-halloween-body text-glow-orange">
              Glowing orange text
            </p>
            <p className="text-halloween-body text-glow-purple">
              Glowing purple text
            </p>
            <p className="text-halloween-body text-glow-green">
              Glowing green text
            </p>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="btn-halloween-primary">
              Primary Button
            </button>
            <button className="btn-halloween-secondary">
              Secondary Button
            </button>
            <button className="btn-halloween-ghost">
              Ghost Button
            </button>
            <button className="btn-halloween-danger">
              Danger Button
            </button>
            <button className="btn-halloween-disabled" disabled>
              Disabled Button
            </button>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-4">
          <h2 className="text-halloween-subheading mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-halloween">
              <h3 className="text-xl font-semibold text-halloween-orange mb-2">
                Basic Card
              </h3>
              <p className="text-halloween-body">
                기본 카드 스타일입니다.
              </p>
            </div>
            <div className="card-halloween-hover">
              <h3 className="text-xl font-semibold text-halloween-purple mb-2">
                Hover Card
              </h3>
              <p className="text-halloween-body">
                호버 효과가 있는 카드입니다.
              </p>
            </div>
            <div className="card-halloween-glow">
              <h3 className="text-xl font-semibold text-halloween-orange mb-2">
                Glow Card
              </h3>
              <p className="text-halloween-body">
                빛나는 효과가 있는 카드입니다.
              </p>
            </div>
          </div>
        </section>

        {/* Inputs Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Input Fields</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-halloween-body mb-2">
                Normal Input
              </label>
              <input
                type="text"
                className="input-halloween"
                placeholder="이메일을 입력하세요"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-halloween-body mb-2">
                Error Input
              </label>
              <input
                type="text"
                className="input-halloween-error"
                placeholder="유효하지 않은 입력"
              />
            </div>
            <div>
              <label className="block text-halloween-body mb-2">
                Success Input
              </label>
              <input
                type="text"
                className="input-halloween-success"
                placeholder="유효한 입력"
              />
            </div>
          </div>
        </section>

        {/* Answer Options Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Answer Options</h2>
          <div className="space-y-3">
            <div
              className={
                selectedAnswer === 'a'
                  ? 'answer-option-halloween-selected'
                  : 'answer-option-halloween'
              }
              onClick={() => setSelectedAnswer('a')}
            >
              <p className="text-halloween-body">
                A. 친구들과 만나서 활동적으로 보낸다
              </p>
            </div>
            <div
              className={
                selectedAnswer === 'b'
                  ? 'answer-option-halloween-selected'
                  : 'answer-option-halloween'
              }
              onClick={() => setSelectedAnswer('b')}
            >
              <p className="text-halloween-body">
                B. 집에서 혼자 조용히 쉰다
              </p>
            </div>
          </div>
        </section>

        {/* Progress Bar Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Progress Bar</h2>
          <div className="space-y-4">
            <div>
              <p className="text-halloween-body mb-2">33% Progress</p>
              <div className="progress-halloween">
                <div className="progress-halloween-fill" style={{ width: '33%' }} />
              </div>
            </div>
            <div>
              <p className="text-halloween-body mb-2">66% Progress</p>
              <div className="progress-halloween">
                <div className="progress-halloween-fill" style={{ width: '66%' }} />
              </div>
            </div>
            <div>
              <p className="text-halloween-body mb-2">100% Progress</p>
              <div className="progress-halloween">
                <div className="progress-halloween-fill" style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </section>

        {/* Badges Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Badges</h2>
          <div className="flex flex-wrap gap-3">
            <span className="badge-halloween-orange">Orange Badge</span>
            <span className="badge-halloween-purple">Purple Badge</span>
            <span className="badge-halloween-green">Green Badge</span>
          </div>
        </section>

        {/* Messages Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Messages</h2>
          <div className="space-y-4">
            <div className="error-halloween">
              <strong>오류:</strong> 유효하지 않은 이메일 주소입니다.
            </div>
            <div className="success-halloween">
              <strong>성공:</strong> 인증 이메일이 전송되었습니다.
            </div>
          </div>
        </section>

        {/* Loading Spinner Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Loading Spinner</h2>
          <div className="flex items-center gap-4">
            <div className="spinner-halloween" />
            <p className="text-halloween-body">Loading...</p>
          </div>
        </section>

        {/* Animations Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Animations</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-halloween text-center">
              <div className="w-16 h-16 bg-halloween-orange rounded-full mx-auto mb-2 animate-float" />
              <p className="text-halloween-small">Float</p>
            </div>
            <div className="card-halloween text-center">
              <div className="w-16 h-16 bg-halloween-purple rounded-full mx-auto mb-2 animate-pulse" />
              <p className="text-halloween-small">Pulse</p>
            </div>
            <div className="card-halloween text-center">
              <div className="w-16 h-16 bg-halloween-green rounded-full mx-auto mb-2 animate-bounce" />
              <p className="text-halloween-small">Bounce</p>
            </div>
            <div className="card-halloween text-center">
              <div className="w-16 h-16 bg-halloween-orange rounded-full mx-auto mb-2 animate-glow" />
              <p className="text-halloween-small">Glow</p>
            </div>
          </div>
        </section>

        {/* Links Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Links</h2>
          <div className="space-y-2">
            <a href="#" className="link-halloween block">
              할로윈 테마 링크
            </a>
            <a href="#" className="link-halloween block">
              Another Halloween Link
            </a>
          </div>
        </section>

        {/* Modal Section */}
        <section className="card-halloween space-y-4">
          <h2 className="text-halloween-subheading mb-4">Modal</h2>
          <button
            className="btn-halloween-primary"
            onClick={() => setShowModal(true)}
          >
            Open Modal
          </button>
        </section>

        {/* Character Card Example */}
        <section className="space-y-4">
          <h2 className="text-halloween-subheading mb-4">Character Card</h2>
          <div className="character-card-halloween">
            <div className="character-image-halloween bg-halloween-orange rounded-full flex items-center justify-center">
              <span className="text-6xl">🎃</span>
            </div>
            <h3 className="text-3xl font-spooky text-halloween-orange mb-4">
              잭오랜턴
            </h3>
            <p className="text-halloween-body">
              당신은 밝고 긍정적인 에너지로 주변을 환하게 밝히는 잭오랜턴입니다!
            </p>
          </div>
        </section>

        {/* Dividers */}
        <div className="divider-halloween" />
        <div className="divider-halloween-glow" />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay-halloween" onClick={() => setShowModal(false)}>
          <div className="modal-halloween" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-halloween-subheading mb-4">Modal Title</h3>
            <p className="text-halloween-body mb-6">
              이것은 할로윈 테마 모달입니다. 배경을 클릭하면 닫힙니다.
            </p>
            <div className="flex gap-4">
              <button
                className="btn-halloween-primary flex-1"
                onClick={() => setShowModal(false)}
              >
                확인
              </button>
              <button
                className="btn-halloween-ghost flex-1"
                onClick={() => setShowModal(false)}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeShowcase;
