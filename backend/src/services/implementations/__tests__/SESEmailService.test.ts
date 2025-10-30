import AWS from 'aws-sdk';
import { SESEmailService } from '../SESEmailService';
import { HalloweenCharacter } from '../../../types';

// Mock AWS SDK
jest.mock('aws-sdk');

describe('SESEmailService', () => {
  let sesEmailService: SESEmailService;
  let mockSendEmail: jest.Mock;

  beforeEach(() => {
    // Reset environment variables
    process.env.AWS_REGION = 'us-east-1';
    process.env.AWS_SES_FROM_EMAIL = 'test@example.com';
    process.env.FRONTEND_URL = 'http://localhost:5173';

    // Mock SES sendEmail
    mockSendEmail = jest.fn().mockReturnValue({
      promise: jest.fn().mockResolvedValue({}),
    });

    (AWS.SES as jest.MockedClass<typeof AWS.SES>).mockImplementation(
      () =>
        ({
          sendEmail: mockSendEmail,
        } as any)
    );

    sesEmailService = new SESEmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should send verification email with correct parameters', async () => {
      const email = 'user@example.com';
      const token = 'test-token-123';

      await sesEmailService.sendVerificationEmail(email, token);

      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      const callArgs = mockSendEmail.mock.calls[0][0];

      expect(callArgs.Source).toBe('test@example.com');
      expect(callArgs.Destination.ToAddresses).toEqual([email]);
      expect(callArgs.Message.Subject.Data).toContain('할로윈 성격 테스트');
      expect(callArgs.Message.Subject.Data).toContain('이메일 인증');
      expect(callArgs.Message.Body.Html.Data).toContain(token);
      expect(callArgs.Message.Body.Html.Data).toContain('http://localhost:5173/auth/verify');
      expect(callArgs.Message.Body.Text.Data).toContain(token);
    });

    it('should include verification link in email body', async () => {
      const email = 'user@example.com';
      const token = 'test-token-123';

      await sesEmailService.sendVerificationEmail(email, token);

      const callArgs = mockSendEmail.mock.calls[0][0];
      const htmlBody = callArgs.Message.Body.Html.Data;
      const textBody = callArgs.Message.Body.Text.Data;

      expect(htmlBody).toContain(`http://localhost:5173/auth/verify?token=${token}`);
      expect(textBody).toContain(`http://localhost:5173/auth/verify?token=${token}`);
    });

    it('should throw error when SES fails', async () => {
      mockSendEmail.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('SES Error')),
      });

      await expect(sesEmailService.sendVerificationEmail('user@example.com', 'token')).rejects.toThrow(
        '이메일 전송에 실패했습니다'
      );
    });

    it('should use UTF-8 charset for Korean text', async () => {
      await sesEmailService.sendVerificationEmail('user@example.com', 'token');

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Charset).toBe('UTF-8');
      expect(callArgs.Message.Body.Html.Charset).toBe('UTF-8');
      expect(callArgs.Message.Body.Text.Charset).toBe('UTF-8');
    });
  });

  describe('sendResultEmail', () => {
    it('should send result email for zombie character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'zombie';

      await sesEmailService.sendResultEmail(email, character);

      expect(mockSendEmail).toHaveBeenCalledTimes(1);
      const callArgs = mockSendEmail.mock.calls[0][0];

      expect(callArgs.Source).toBe('test@example.com');
      expect(callArgs.Destination.ToAddresses).toEqual([email]);
      expect(callArgs.Message.Subject.Data).toContain('좀비');
      expect(callArgs.Message.Body.Html.Data).toContain('좀비');
      expect(callArgs.Message.Body.Html.Data).toContain('현실적이고 실용적인');
    });

    it('should send result email for joker character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'joker';

      await sesEmailService.sendResultEmail(email, character);

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Data).toContain('조커');
      expect(callArgs.Message.Body.Html.Data).toContain('조커');
      expect(callArgs.Message.Body.Html.Data).toContain('카리스마 넘치고 전략적인');
    });

    it('should send result email for skeleton character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'skeleton';

      await sesEmailService.sendResultEmail(email, character);

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Data).toContain('해골');
      expect(callArgs.Message.Body.Html.Data).toContain('해골');
      expect(callArgs.Message.Body.Html.Data).toContain('깊이 있고 이상주의적인');
    });

    it('should send result email for nun character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'nun';

      await sesEmailService.sendResultEmail(email, character);

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Data).toContain('수녀');
      expect(callArgs.Message.Body.Html.Data).toContain('수녀');
      expect(callArgs.Message.Body.Html.Data).toContain('헌신적이고 따뜻한');
    });

    it('should send result email for jack-o-lantern character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'jack-o-lantern';

      await sesEmailService.sendResultEmail(email, character);

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Data).toContain('잭오랜턴');
      expect(callArgs.Message.Body.Html.Data).toContain('잭오랜턴');
      expect(callArgs.Message.Body.Html.Data).toContain('열정적이고 사교적인');
    });

    it('should send result email for vampire character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'vampire';

      await sesEmailService.sendResultEmail(email, character);

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Data).toContain('뱀파이어');
      expect(callArgs.Message.Body.Html.Data).toContain('뱀파이어');
      expect(callArgs.Message.Body.Html.Data).toContain('신중하고 분석적인');
    });

    it('should send result email for ghost character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'ghost';

      await sesEmailService.sendResultEmail(email, character);

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Data).toContain('유령');
      expect(callArgs.Message.Body.Html.Data).toContain('유령');
      expect(callArgs.Message.Body.Html.Data).toContain('친근하고 활발한');
    });

    it('should send result email for frankenstein character', async () => {
      const email = 'user@example.com';
      const character: HalloweenCharacter = 'frankenstein';

      await sesEmailService.sendResultEmail(email, character);

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Data).toContain('프랑켄슈타인');
      expect(callArgs.Message.Body.Html.Data).toContain('프랑켄슈타인');
      expect(callArgs.Message.Body.Html.Data).toContain('독창적이고 지적인');
    });

    it('should include profile link in result email', async () => {
      await sesEmailService.sendResultEmail('user@example.com', 'zombie');

      const callArgs = mockSendEmail.mock.calls[0][0];
      const htmlBody = callArgs.Message.Body.Html.Data;
      const textBody = callArgs.Message.Body.Text.Data;

      expect(htmlBody).toContain('http://localhost:5173/profile');
      expect(textBody).toContain('http://localhost:5173/profile');
    });

    it('should throw error when SES fails', async () => {
      mockSendEmail.mockReturnValue({
        promise: jest.fn().mockRejectedValue(new Error('SES Error')),
      });

      await expect(sesEmailService.sendResultEmail('user@example.com', 'zombie')).rejects.toThrow(
        '결과 이메일 전송에 실패했습니다'
      );
    });

    it('should use UTF-8 charset for Korean text', async () => {
      await sesEmailService.sendResultEmail('user@example.com', 'zombie');

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Message.Subject.Charset).toBe('UTF-8');
      expect(callArgs.Message.Body.Html.Charset).toBe('UTF-8');
      expect(callArgs.Message.Body.Text.Charset).toBe('UTF-8');
    });
  });

  describe('AWS Configuration', () => {
    it('should configure AWS with environment variables', () => {
      expect(AWS.config.update).toHaveBeenCalledWith({
        region: 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });
    });

    it('should use default region if not provided', () => {
      delete process.env.AWS_REGION;
      new SESEmailService();

      expect(AWS.config.update).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'us-east-1',
        })
      );
    });

    it('should use default from email if not provided', async () => {
      delete process.env.AWS_SES_FROM_EMAIL;
      const service = new SESEmailService();

      await service.sendVerificationEmail('user@example.com', 'token');

      const callArgs = mockSendEmail.mock.calls[0][0];
      expect(callArgs.Source).toBe('noreply@example.com');
    });
  });
});
