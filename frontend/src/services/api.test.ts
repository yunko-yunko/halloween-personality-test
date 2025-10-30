/**
 * API Configuration Unit Tests
 */

import { describe, it, expect } from 'vitest';
import api from './api';

describe('API Configuration', () => {
  it('should export axios instance', () => {
    expect(api).toBeDefined();
    expect(api.defaults).toBeDefined();
  });

  it('should have correct base configuration', () => {
    expect(api.defaults.withCredentials).toBe(true);
    expect(api.defaults.headers['Content-Type']).toBe('application/json');
    expect(api.defaults.timeout).toBe(10000);
  });

  it('should have baseURL configured', () => {
    expect(api.defaults.baseURL).toBeDefined();
    expect(typeof api.defaults.baseURL).toBe('string');
  });

  it('should have response interceptor configured', () => {
    expect(api.interceptors.response).toBeDefined();
  });
});
