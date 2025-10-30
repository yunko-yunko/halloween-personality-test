import request from 'supertest';
import app from '../app';

describe('Express App Configuration', () => {
  describe('Middleware Setup', () => {
    it('should parse JSON body', async () => {
      const response = await request(app)
        .post('/api/test/submit')
        .send({ answers: [] })
        .set('Content-Type', 'application/json');

      // Should not fail due to JSON parsing
      expect(response.status).not.toBe(500);
    });

    it('should handle CORS with credentials', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should have health check endpoint', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/api/unknown-route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('code', 'NOT_FOUND');
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('찾을 수 없습니다'); // Korean message
    });

    it('should handle invalid JSON with Korean error message', async () => {
      const response = await request(app)
        .post('/api/test/submit')
        .send('{ invalid json }')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('code', 'INVALID_JSON');
      expect(response.body.message).toContain('JSON'); // Korean message
    });

    it('should return Korean error messages', async () => {
      const response = await request(app)
        .post('/api/test/submit')
        .send({ answers: [] }); // Invalid - empty answers

      expect(response.body).toHaveProperty('message');
      // Error message should be in Korean (contains Korean characters)
      expect(/[\u3131-\uD79D]/.test(response.body.message)).toBe(true);
    });
  });

  describe('CORS Configuration', () => {
    it('should allow configured origins', async () => {
      const response = await request(app)
        .options('/api/test/questions')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.status).toBe(204);
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    });

    it('should allow credentials', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:5173');

      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });

    it('should allow specified methods', async () => {
      const response = await request(app)
        .options('/api/test/questions')
        .set('Origin', 'http://localhost:5173')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-methods']).toContain('POST');
      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });
  });

  describe('Request Logging', () => {
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    });

    afterEach(() => {
      consoleLogSpy.mockRestore();
    });

    it('should log incoming requests', async () => {
      await request(app).get('/health');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('GET /health')
      );
    });

    it('should log response status and duration', async () => {
      await request(app).get('/health');

      // Wait a bit for the finish event
      await new Promise(resolve => setTimeout(resolve, 10));

      const logCalls = consoleLogSpy.mock.calls.map(call => call[0]);
      const responseLog = logCalls.find(log => log.includes('200') && log.includes('ms'));
      
      expect(responseLog).toBeDefined();
    });
  });
});
