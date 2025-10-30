// ============================================================================
// Core Test Types
// ============================================================================

export type DimensionType = 'EI' | 'NS' | 'TF';
export type DimensionValue = 'E' | 'I' | 'N' | 'S' | 'T' | 'F';

export interface Answer {
  id: string;
  text: string;
  value: DimensionValue;
}

export interface Question {
  id: string;
  text: string;
  dimension: DimensionType;
  answers: [Answer, Answer];
}

// ============================================================================
// Halloween Character Types
// ============================================================================

export type HalloweenCharacter =
  | 'zombie'
  | 'joker'
  | 'skeleton'
  | 'nun'
  | 'jack-o-lantern'
  | 'vampire'
  | 'ghost'
  | 'frankenstein';

export interface CharacterInfo {
  name: string;
  description: string;
  imagePath: string;
  mbtiTypes: [string, string];
}

export type CharacterDescriptions = Record<HalloweenCharacter, CharacterInfo>;

// ============================================================================
// User and Authentication Types (Advanced Mode)
// ============================================================================

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VerificationToken {
  token: string;
  email: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

// ============================================================================
// Test Result Types
// ============================================================================

export interface TestResult {
  id: string;
  userId: string;
  characterType: HalloweenCharacter;
  mbtiType: string;
  completedAt: Date;
}

export interface TestResultInput {
  userId: string;
  characterType: HalloweenCharacter;
  mbtiType: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

// Test API
export interface SubmitTestRequest {
  answers: Array<{
    questionId: string;
    answerId: string;
    value: DimensionValue;
  }>;
}

export interface SubmitTestResponse {
  character: HalloweenCharacter;
  characterInfo: CharacterInfo;
  mbtiType: string;
}

export interface GetQuestionsResponse {
  questions: Question[];
}

// Auth API
export interface SendVerificationRequest {
  email: string;
}

export interface SendVerificationResponse {
  message: string;
  success: boolean;
}

export interface VerifyTokenRequest {
  token: string;
}

export interface VerifyTokenResponse {
  user: User;
  message: string;
}

export interface LogoutResponse {
  message: string;
}

// Profile API
export interface GetProfileResponse {
  user: User;
}

export interface GetHistoryResponse {
  results: TestResult[];
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  statusCode: number;
}

export interface ValidationError extends ApiError {
  fields?: Record<string, string>;
}

// ============================================================================
// Express Request Extensions
// ============================================================================

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
