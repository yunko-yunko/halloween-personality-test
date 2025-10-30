import AWS from 'aws-sdk';
import { IEmailService } from '../interfaces/IEmailService';
import { HalloweenCharacter } from '../../types';

/**
 * AWS SES implementation of IEmailService
 * Sends verification and result emails using AWS Simple Email Service
 */
export class SESEmailService implements IEmailService {
  private ses: AWS.SES;
  private fromEmail: string;
  private frontendUrl: string;

  constructor() {
    // Configure AWS SDK with credentials from environment variables
    AWS.config.update({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    this.ses = new AWS.SES({ apiVersion: '2010-12-01' });
    this.fromEmail = process.env.AWS_SES_FROM_EMAIL || 'noreply@example.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  /**
   * Send verification email with token link
   * @param email - Recipient email address
   * @param token - Verification token to include in link
   */
  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationLink = `${this.frontendUrl}/auth/verify?token=${token}`;

    const params: AWS.SES.SendEmailRequest = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: '🎃 할로윈 성격 테스트 - 이메일 인증',
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.getVerificationEmailTemplate(verificationLink),
            Charset: 'UTF-8',
          },
          Text: {
            Data: this.getVerificationEmailTextTemplate(verificationLink),
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      await this.ses.sendEmail(params).promise();
      console.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('이메일 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  /**
   * Send test result email with character information
   * @param email - Recipient email address
   * @param character - Halloween character result
   */
  async sendResultEmail(email: string, character: HalloweenCharacter): Promise<void> {
    const characterInfo = this.getCharacterInfo(character);

    const params: AWS.SES.SendEmailRequest = {
      Source: this.fromEmail,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `🎃 당신의 할로윈 캐릭터는 ${characterInfo.name}입니다!`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: this.getResultEmailTemplate(characterInfo),
            Charset: 'UTF-8',
          },
          Text: {
            Data: this.getResultEmailTextTemplate(characterInfo),
            Charset: 'UTF-8',
          },
        },
      },
    };

    try {
      await this.ses.sendEmail(params).promise();
      console.log(`Result email sent successfully to ${email}`);
    } catch (error) {
      console.error('Failed to send result email:', error);
      throw new Error('결과 이메일 전송에 실패했습니다.');
    }
  }

  /**
   * Get character information for email templates
   */
  private getCharacterInfo(character: HalloweenCharacter): { name: string; description: string } {
    const characterMap: Record<HalloweenCharacter, { name: string; description: string }> = {
      zombie: {
        name: '좀비',
        description:
          '당신은 현실적이고 실용적인 좀비입니다. 목표를 향해 끈질기게 나아가며, 체계적이고 조직적인 방식을 선호합니다. 전통과 규칙을 중시하며, 책임감이 강하고 신뢰할 수 있는 성격입니다.',
      },
      joker: {
        name: '조커',
        description:
          '당신은 카리스마 넘치고 전략적인 조커입니다. 리더십이 뛰어나며 큰 그림을 보는 능력이 있습니다. 도전을 즐기고 혁신적인 아이디어로 세상을 바꾸고 싶어합니다. 논리적이고 결단력 있는 성격입니다.',
      },
      skeleton: {
        name: '해골',
        description:
          '당신은 깊이 있고 이상주의적인 해골입니다. 내면의 세계가 풍부하며, 타인의 감정을 잘 이해합니다. 의미 있는 관계를 추구하고, 자신만의 가치관과 신념을 중요하게 생각합니다. 조용하지만 강한 내면을 가진 성격입니다.',
      },
      nun: {
        name: '수녀',
        description:
          '당신은 헌신적이고 따뜻한 수녀입니다. 타인을 돕는 것에서 기쁨을 느끼며, 세심하고 배려심이 깊습니다. 전통과 안정을 중시하고, 책임감 있게 맡은 일을 완수합니다. 조화로운 관계를 만드는 데 능숙합니다.',
      },
      'jack-o-lantern': {
        name: '잭오랜턴',
        description:
          '당신은 열정적이고 사교적인 잭오랜턴입니다. 사람들과 함께 있을 때 에너지가 넘치며, 긍정적이고 낙관적인 태도로 주변을 밝게 만듭니다. 창의적이고 자유로운 영혼으로, 새로운 경험을 즐깁니다.',
      },
      vampire: {
        name: '뱀파이어',
        description:
          '당신은 신중하고 분석적인 뱀파이어입니다. 독립적이며 자신만의 방식으로 일을 처리하는 것을 선호합니다. 논리적 사고가 뛰어나고, 효율성을 중시합니다. 조용하지만 강한 존재감을 가진 성격입니다.',
      },
      ghost: {
        name: '유령',
        description:
          '당신은 친근하고 활발한 유령입니다. 사람들과 어울리는 것을 좋아하며, 분위기를 즐겁게 만드는 재능이 있습니다. 현실적이고 실용적이며, 순간을 즐기는 방법을 잘 압니다. 따뜻하고 관대한 성격입니다.',
      },
      frankenstein: {
        name: '프랑켄슈타인',
        description:
          '당신은 독창적이고 지적인 프랑켄슈타인입니다. 복잡한 문제를 해결하는 것을 즐기며, 논리적이고 분석적인 사고를 합니다. 독립적이고 자신만의 세계관을 가지고 있습니다. 혁신적인 아이디어로 가득한 성격입니다.',
      },
    };

    return characterMap[character];
  }

  /**
   * HTML template for verification email
   */
  private getVerificationEmailTemplate(verificationLink: string): string {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>이메일 인증</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Noto Sans KR', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b35 0%, #6a0dad 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎃 할로윈 성격 테스트</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #e0e0e0;">
              <h2 style="margin: 0 0 20px 0; color: #ff6b35; font-size: 22px;">이메일 인증을 완료해주세요</h2>
              <p style="margin: 0 0 20px 0; line-height: 1.6; font-size: 16px;">
                할로윈 성격 테스트에 오신 것을 환영합니다! 🎃
              </p>
              <p style="margin: 0 0 30px 0; line-height: 1.6; font-size: 16px;">
                아래 버튼을 클릭하여 이메일 인증을 완료하고 테스트를 시작하세요.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationLink}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #ff6b35 0%, #ff8c5a 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(255, 107, 53, 0.3);">
                      이메일 인증하기
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 30px 0 0 0; line-height: 1.6; font-size: 14px; color: #999;">
                버튼이 작동하지 않으면 아래 링크를 복사하여 브라우저에 붙여넣으세요:<br>
                <a href="${verificationLink}" style="color: #ff6b35; word-break: break-all;">${verificationLink}</a>
              </p>
              
              <p style="margin: 20px 0 0 0; line-height: 1.6; font-size: 14px; color: #999;">
                이 링크는 24시간 동안 유효합니다.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.</p>
              <p style="margin: 10px 0 0 0;">© 2024 할로윈 성격 테스트. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Plain text template for verification email
   */
  private getVerificationEmailTextTemplate(verificationLink: string): string {
    return `
🎃 할로윈 성격 테스트 - 이메일 인증

할로윈 성격 테스트에 오신 것을 환영합니다!

아래 링크를 클릭하여 이메일 인증을 완료하고 테스트를 시작하세요:

${verificationLink}

이 링크는 24시간 동안 유효합니다.

이 이메일을 요청하지 않으셨다면 무시하셔도 됩니다.

© 2024 할로윈 성격 테스트. All rights reserved.
    `.trim();
  }

  /**
   * HTML template for result email
   */
  private getResultEmailTemplate(characterInfo: { name: string; description: string }): string {
    return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>테스트 결과</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Noto Sans KR', Arial, sans-serif; background-color: #0a0a0a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #6a0dad 0%, #ff6b35 100%); padding: 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">🎃 테스트 결과</h1>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px; color: #e0e0e0;">
              <h2 style="margin: 0 0 20px 0; color: #ff6b35; font-size: 24px; text-align: center;">
                당신의 할로윈 캐릭터는<br>
                <span style="color: #6a0dad; font-size: 32px;">${characterInfo.name}</span>
                입니다!
              </h2>
              
              <div style="background-color: #0a0a0a; border-radius: 8px; padding: 25px; margin: 30px 0;">
                <p style="margin: 0; line-height: 1.8; font-size: 16px; color: #e0e0e0;">
                  ${characterInfo.description}
                </p>
              </div>
              
              <p style="margin: 30px 0 0 0; line-height: 1.6; font-size: 16px; text-align: center;">
                프로필 페이지에서 언제든지 결과를 다시 확인할 수 있습니다.
              </p>
              
              <!-- Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0 0 0;">
                    <a href="${this.frontendUrl}/profile" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #6a0dad 0%, #8b2fc9 100%); color: #ffffff; text-decoration: none; border-radius: 5px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 6px rgba(106, 13, 173, 0.3);">
                      프로필 보기
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #0a0a0a; padding: 20px 30px; text-align: center; color: #666; font-size: 12px;">
              <p style="margin: 0;">테스트를 다시 해보고 싶으신가요? 프로필 페이지에서 새로운 테스트를 시작하세요!</p>
              <p style="margin: 10px 0 0 0;">© 2024 할로윈 성격 테스트. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  /**
   * Plain text template for result email
   */
  private getResultEmailTextTemplate(characterInfo: { name: string; description: string }): string {
    return `
🎃 할로윈 성격 테스트 결과

당신의 할로윈 캐릭터는 ${characterInfo.name}입니다!

${characterInfo.description}

프로필 페이지에서 언제든지 결과를 다시 확인할 수 있습니다:
${this.frontendUrl}/profile

테스트를 다시 해보고 싶으신가요? 프로필 페이지에서 새로운 테스트를 시작하세요!

© 2024 할로윈 성격 테스트. All rights reserved.
    `.trim();
  }
}
