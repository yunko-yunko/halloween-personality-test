/**
 * Feature flag configuration
 * Controls which features are enabled based on environment variables
 */

export const features = {
  emailAuth: process.env.ENABLE_EMAIL_AUTH === 'true',
};

export type Features = typeof features;
