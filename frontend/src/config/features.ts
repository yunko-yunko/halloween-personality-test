/**
 * Feature flag configuration
 * Controls which features are enabled based on environment variables
 */

export const features = {
  emailAuth: import.meta.env.VITE_ENABLE_EMAIL_AUTH === 'true',
};

export type Features = typeof features;
