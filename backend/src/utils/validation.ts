import Joi from 'joi';

/**
 * Validation schema for test submission
 * Ensures all 15 questions are answered with valid values
 */
export const submitTestSchema = Joi.object({
  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().required(),
        answerId: Joi.string().required(),
        value: Joi.string()
          .valid('E', 'I', 'N', 'S', 'T', 'F')
          .required()
      })
    )
    .length(15)
    .required()
    .messages({
      'array.length': '모든 질문에 답변해주세요.',
      'array.base': '답변 형식이 올바르지 않습니다.',
      'any.required': '답변이 필요합니다.'
    })
});

/**
 * Validation schema for email verification request
 */
export const sendVerificationSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '유효하지 않은 이메일 주소입니다.',
      'any.required': '이메일 주소가 필요합니다.'
    })
});

/**
 * Validation schema for token verification
 */
export const verifyTokenSchema = Joi.object({
  token: Joi.string()
    .required()
    .messages({
      'any.required': '인증 토큰이 필요합니다.'
    })
});

