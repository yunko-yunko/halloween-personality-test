# Requirements Document

## Introduction

A Halloween-themed MBTI personality test application that determines users' personality types through 15 questions and matches them to one of 8 Halloween characters. The application will be built in Korean using Next.js with a single codebase that supports two operational modes via feature flags: a simple mode without authentication and an advanced mode with email verification, user profiles, and test history storage using AWS services. The application will use abstracted service interfaces to allow future changes to AWS architecture without impacting business logic.

## Requirements

### Requirement 1: Core Personality Test Functionality

**User Story:** As a user, I want to take a Halloween-themed personality test, so that I can discover which Halloween character matches my personality.

#### Acceptance Criteria

1. WHEN the user starts the test THEN the system SHALL present 15 questions divided into 3 pages with 5 questions each
2. WHEN the user answers questions THEN the system SHALL track responses for E/I, N/S, and T/F dimensions (5 questions per dimension)
3. WHEN the user completes all questions THEN the system SHALL calculate the personality type using majority vote per dimension
4. WHEN the personality type is determined THEN the system SHALL map it to one of 8 Halloween characters based on the first 3 MBTI letters (E/I, N/S, T/F)
5. WHEN the result is displayed THEN the system SHALL show the Halloween character name and description in Korean WITHOUT revealing the underlying MBTI type

### Requirement 2: Question Flow and Navigation

**User Story:** As a user, I want to navigate through the test smoothly with clear progress indication, so that I know how far along I am in the test.

#### Acceptance Criteria

1. WHEN the user is taking the test THEN the system SHALL display a progress indicator showing current page and total pages
2. WHEN the user is on page 1 or 2 THEN the system SHALL provide a "Next" button to proceed after answering all 5 questions
3. WHEN the user is on page 2 or 3 THEN the system SHALL provide a "Previous" button to go back
4. WHEN the user is on page 3 and completes all questions THEN the system SHALL provide a "Submit" button to see results
5. WHEN the user navigates between pages THEN the system SHALL preserve previously selected answers

### Requirement 3: Character Mapping System

**User Story:** As a system, I need to map MBTI results to Halloween characters correctly, so that users receive accurate personality matches.

#### Acceptance Criteria

1. WHEN the result is ESTJ or ESTP THEN the system SHALL assign 좀비 (Zombie)
2. WHEN the result is ENTJ or ENTP THEN the system SHALL assign 조커 (Joker)
3. WHEN the result is INFJ or INFP THEN the system SHALL assign 해골 (Skeleton)
4. WHEN the result is ISFJ or ISFP THEN the system SHALL assign 수녀 (Nun)
5. WHEN the result is ENFJ or ENFP THEN the system SHALL assign 잭오랜턴 (Jack-o'-lantern)
6. WHEN the result is ISTJ or ISTP THEN the system SHALL assign 뱀파이어 (Vampire)
7. WHEN the result is ESFJ or ESFP THEN the system SHALL assign 유령 (Ghost)
8. WHEN the result is INTJ or INTP THEN the system SHALL assign 프랑켄슈타인 (Frankenstein)

### Requirement 4: Feature Flag Architecture

**User Story:** As a system administrator, I want to control authentication features via environment variables, so that I can easily switch between simple and advanced modes.

#### Acceptance Criteria

1. WHEN the application starts THEN it SHALL read the `ENABLE_EMAIL_AUTH` environment variable
2. WHEN `ENABLE_EMAIL_AUTH=false` THEN the system SHALL operate in simple mode without authentication features
3. WHEN `ENABLE_EMAIL_AUTH=true` THEN the system SHALL enable email verification, user profiles, and test history features
4. WHEN the feature flag changes THEN the system SHALL adjust routing and UI components accordingly without code changes
5. WHEN core test functionality is used THEN it SHALL work identically regardless of the feature flag state

### Requirement 5: Simple Mode (ENABLE_EMAIL_AUTH=false)

**User Story:** As a user, I want to take the personality test immediately without any registration, so that I can quickly discover my Halloween character.

#### Acceptance Criteria

1. WHEN the user visits the application in simple mode THEN the system SHALL allow immediate access to the test without email collection
2. WHEN the user completes the test THEN the system SHALL display results immediately
3. WHEN the user wants to retake the test THEN the system SHALL allow unlimited retakes without storing history
4. WHEN the user closes the browser THEN the system SHALL NOT persist any user data or test results
5. WHEN in simple mode THEN the system SHALL NOT display profile, login, or history-related UI elements

### Requirement 6: Advanced Mode - Email Verification and Authentication (ENABLE_EMAIL_AUTH=true)

**User Story:** As a user, I want to verify my email address before taking the test, so that I can save my results and access them later.

#### Acceptance Criteria

1. WHEN the user visits the application in advanced mode THEN the system SHALL prompt for email address entry
2. WHEN the user submits a valid email THEN the system SHALL send a verification email via the email service interface
3. WHEN the verification email is sent THEN it SHALL contain a unique verification link
4. WHEN the user clicks the verification link THEN the system SHALL verify the token and grant access to the test
5. IF the verification token is invalid or expired THEN the system SHALL display an error message and prompt for re-verification
6. WHEN the user is verified THEN the system SHALL create or retrieve the user session

### Requirement 7: Test Result Storage and History (Advanced Mode Only)

**User Story:** As a verified user, I want my test results to be saved, so that I can view my personality test history later.

#### Acceptance Criteria

1. WHEN a verified user completes the test in advanced mode THEN the system SHALL store the result via the repository interface with timestamp
2. WHEN the result is stored THEN it SHALL include user email, Halloween character, calculated MBTI type, and completion timestamp
3. WHEN the result is saved THEN the system SHALL send the result via email using the email service interface
4. WHEN a user retakes the test THEN the system SHALL store the new result as an additional entry (not overwrite)
5. WHEN storing results THEN the system SHALL maintain all historical test results for each user
6. WHEN in simple mode THEN the system SHALL NOT attempt to store or retrieve test results

### Requirement 8: User Profile and History View (Advanced Mode Only)

**User Story:** As a verified user, I want to view my past test results, so that I can see how my personality has been assessed over time.

#### Acceptance Criteria

1. WHEN a verified user accesses their profile in advanced mode THEN the system SHALL display all past test results in reverse chronological order
2. WHEN displaying test history THEN each entry SHALL show the Halloween character, date taken, and character description
3. WHEN the user has no test history THEN the system SHALL display a message prompting them to take the test
4. WHEN the user wants to take a new test THEN the system SHALL provide a clear call-to-action button
5. WHEN in simple mode THEN the profile route SHALL NOT be accessible

### Requirement 9: Email-Based Login System (Advanced Mode Only)

**User Story:** As a returning user, I want to log in using my email address with verification, so that I can access my profile and test history.

#### Acceptance Criteria

1. WHEN a returning user enters their email in advanced mode THEN the system SHALL send a verification email via the email service interface
2. WHEN the user clicks the verification link THEN the system SHALL authenticate the user and redirect to their profile
3. WHEN the user is authenticated THEN the system SHALL maintain the session until logout or expiration
4. WHEN the session expires THEN the system SHALL prompt the user to re-verify their email
5. IF the email doesn't exist in the database THEN the system SHALL treat it as a new user registration

### Requirement 10: Service Abstraction Layer

**User Story:** As a developer, I want abstracted service interfaces for external dependencies, so that I can change AWS architecture without impacting business logic.

#### Acceptance Criteria

1. WHEN implementing email functionality THEN the system SHALL use an `IEmailService` interface
2. WHEN implementing user data access THEN the system SHALL use an `IUserRepository` interface
3. WHEN implementing test result storage THEN the system SHALL use an `ITestResultRepository` interface
4. WHEN the application initializes THEN it SHALL inject concrete implementations based on configuration
5. WHEN changing from RDS to Aurora or adding API Gateway THEN only the repository implementation SHALL need changes
6. WHEN changing from SES to another email provider THEN only the email service implementation SHALL need changes
7. WHEN in simple mode THEN repository interfaces SHALL use no-op implementations that don't persist data

### Requirement 11: UI/UX and Theming

**User Story:** As a user, I want the application to have a dark, spooky Halloween theme, so that the experience is immersive and engaging.

#### Acceptance Criteria

1. WHEN the user views any page THEN the system SHALL display a dark, spooky Halloween-themed design
2. WHEN displaying Halloween characters THEN the system SHALL show character images from the designated assets directory
3. WHEN showing character descriptions THEN the system SHALL load content from the designated content directory
4. WHEN the user interacts with buttons and forms THEN the system SHALL provide visual feedback consistent with the Halloween theme
5. WHEN the application loads THEN all text content SHALL be displayed in Korean

### Requirement 12: Asset and Content Management

**User Story:** As a developer, I need designated directories for assets and content, so that images and character descriptions can be easily managed.

#### Acceptance Criteria

1. WHEN setting up the project THEN the system SHALL create a `/public/assets/characters/` directory for character images
2. WHEN referencing character images THEN the system SHALL use the naming convention: `{character-name}.png` (e.g., `zombie.png`, `joker.png`, `skeleton.png`, `nun.png`, `jack-o-lantern.png`, `vampire.png`, `ghost.png`, `frankenstein.png`)
3. WHEN setting up the project THEN the system SHALL create a `/data/character-descriptions.json` file for character descriptions in Korean
4. WHEN loading character descriptions THEN the system SHALL read from the JSON file with structure: `{ "zombie": "description", "joker": "description", ... }`
5. WHEN assets or descriptions are missing THEN the system SHALL display appropriate fallback content

### Requirement 13: AWS Integration (Advanced Mode Only)

**User Story:** As a system administrator, I need the application to integrate with AWS services, so that email verification and data storage work reliably.

#### Acceptance Criteria

1. WHEN sending verification emails THEN the system SHALL use AWS SES with proper configuration
2. WHEN storing user data and test results THEN the system SHALL use AWS RDS (PostgreSQL or MySQL)
3. WHEN connecting to AWS RDS THEN the system SHALL use environment variables for credentials
4. WHEN AWS services are unavailable THEN the system SHALL display appropriate error messages to users
5. WHEN generating verification tokens THEN the system SHALL create secure, time-limited tokens with expiration

### Requirement 14: Database Schema (Advanced Mode Only)

**User Story:** As a system, I need a proper database schema to store user information and test results, so that data is organized and queryable.

#### Acceptance Criteria

1. WHEN the database is initialized THEN it SHALL contain a `users` table with fields: id, email, created_at, updated_at
2. WHEN the database is initialized THEN it SHALL contain a `test_results` table with fields: id, user_id, character_type, mbti_type, completed_at
3. WHEN a new user verifies their email THEN a record SHALL be created in the `users` table
4. WHEN a user completes a test THEN a record SHALL be created in the `test_results` table linked to the user
5. WHEN querying test history THEN the system SHALL join users and test_results tables efficiently

### Requirement 15: Question Bank

**User Story:** As a system, I need a well-structured question bank that accurately determines E/I, N/S, and T/F dimensions, so that personality assessments are valid.

#### Acceptance Criteria

1. WHEN the question bank is created THEN it SHALL contain exactly 15 questions in Korean
2. WHEN organizing questions THEN 5 questions SHALL determine E/I, 5 SHALL determine N/S, and 5 SHALL determine T/F
3. WHEN presenting questions THEN each SHALL have 2 answer options that clearly indicate opposing preferences
4. WHEN a user selects an answer THEN the system SHALL record which dimension and direction (e.g., E vs I) the answer indicates
5. WHEN calculating results THEN the system SHALL use majority vote per dimension (e.g., 3+ E answers = E result)

### Requirement 16: Responsive Design

**User Story:** As a user on any device, I want the application to work well on mobile, tablet, and desktop, so that I can take the test comfortably.

#### Acceptance Criteria

1. WHEN viewing on mobile devices THEN the system SHALL display a single-column layout optimized for small screens
2. WHEN viewing on tablets THEN the system SHALL adapt the layout for medium-sized screens
3. WHEN viewing on desktop THEN the system SHALL display an optimized layout for large screens
4. WHEN interacting with buttons and forms THEN touch targets SHALL be appropriately sized for mobile devices
5. WHEN images are displayed THEN they SHALL scale appropriately for different screen sizes

### Requirement 17: Error Handling and Validation

**User Story:** As a user, I want clear error messages and validation, so that I understand what went wrong and how to fix it.

#### Acceptance Criteria

1. WHEN the user enters an invalid email THEN the system SHALL display a validation error in Korean
2. WHEN the user tries to proceed without answering all questions on a page THEN the system SHALL display a prompt to complete all questions
3. WHEN AWS services fail THEN the system SHALL display user-friendly error messages in Korean
4. WHEN database operations fail THEN the system SHALL log errors and display generic error messages to users
5. WHEN verification links expire THEN the system SHALL inform users and provide an option to resend verification
