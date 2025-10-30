import { Request, Response, NextFunction } from 'express';
import { requestLogger } from '../requestLogger';

describe('requestLogger middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;
  let consoleLogSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      method: 'GET',
      path: '/api/test/questions'
    };

    const listeners: { [key: string]: Function } = {};
    mockResponse = {
      statusCode: 200,
      on: jest.fn((event: string, callback: Function) => {
        listeners[event] = callback;
        return mockResponse as Response;
      }),
      emit: jest.fn((event: string) => {
        if (listeners[event]) {
          listeners[event]();
        }
        return true;
      })
    };

    nextFunction = jest.fn();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it('should log incoming request', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test/questions')
    );
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should log response when finished', () => {
    requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

    // Simulate response finish
    (mockResponse as any).emit('finish');

    expect(consoleLogSpy).toHaveBeenCalledTimes(2);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('GET /api/test/questions')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('200')
    );
    expect(consoleLogSpy).toHaveBeenCalledWith(
      expect.stringContaining('ms')
    );
  });

  it('should log error status codes in red', () => {
    mockResponse.statusCode = 404;
    requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

    // Simulate response finish
    (mockResponse as any).emit('finish');

    const lastCall = consoleLogSpy.mock.calls[consoleLogSpy.mock.calls.length - 1][0];
    expect(lastCall).toContain('404');
    expect(lastCall).toContain('\x1b[31m'); // Red color code
  });

  it('should log success status codes in green', () => {
    mockResponse.statusCode = 200;
    requestLogger(mockRequest as Request, mockResponse as Response, nextFunction);

    // Simulate response finish
    (mockResponse as any).emit('finish');

    const lastCall = consoleLogSpy.mock.calls[consoleLogSpy.mock.calls.length - 1][0];
    expect(lastCall).toContain('200');
    expect(lastCall).toContain('\x1b[32m'); // Green color code
  });
});
