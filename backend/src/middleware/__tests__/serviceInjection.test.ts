import { Request, Response, NextFunction } from 'express';
import { injectServices } from '../serviceInjection';
import { ServiceFactory } from '../../services/ServiceFactory';
import { NoOpEmailService } from '../../services/implementations/NoOpEmailService';

// Mock the features config
jest.mock('../../config/features', () => ({
  features: {
    emailAuth: false,
  },
}));

describe('injectServices middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Reset ServiceFactory before each test
    ServiceFactory.reset();

    // Create mock request, response, and next
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    ServiceFactory.reset();
  });

  it('should inject services into request object', () => {
    injectServices(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockRequest.services).toBeDefined();
    expect(mockRequest.services?.emailService).toBeInstanceOf(NoOpEmailService);
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('should inject the same service instance on multiple calls', () => {
    const mockRequest1: Partial<Request> = {};
    const mockRequest2: Partial<Request> = {};

    injectServices(
      mockRequest1 as Request,
      mockResponse as Response,
      mockNext
    );

    injectServices(
      mockRequest2 as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockRequest1.services).toBe(mockRequest2.services);
    expect(mockNext).toHaveBeenCalledTimes(2);
  });

  it('should call next() after successful injection', () => {
    injectServices(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should handle service initialization errors gracefully', () => {
    // Mock ServiceFactory to throw an error
    jest.spyOn(ServiceFactory, 'getServices').mockImplementation(() => {
      throw new Error('Service initialization failed');
    });

    injectServices(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      code: 'SERVICE_INITIALIZATION_ERROR',
      message: 'Service initialization failed',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should handle non-Error exceptions', () => {
    // Mock ServiceFactory to throw a non-Error object
    jest.spyOn(ServiceFactory, 'getServices').mockImplementation(() => {
      throw 'String error';
    });

    injectServices(
      mockRequest as Request,
      mockResponse as Response,
      mockNext
    );

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      code: 'SERVICE_INITIALIZATION_ERROR',
      message: 'Service initialization failed',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should provide access to all required services', () => {
    // Restore any mocks from previous tests
    jest.restoreAllMocks();
    ServiceFactory.reset();

    const freshRequest: Partial<Request> = {};
    const freshNext = jest.fn();

    injectServices(
      freshRequest as Request,
      mockResponse as Response,
      freshNext
    );

    expect(freshRequest.services?.emailService).toBeDefined();
    expect(freshRequest.services?.userRepository).toBeDefined();
    expect(freshRequest.services?.testResultRepository).toBeDefined();

    // Verify services have required methods
    expect(typeof freshRequest.services?.emailService.sendVerificationEmail).toBe('function');
    expect(typeof freshRequest.services?.emailService.sendResultEmail).toBe('function');
    expect(typeof freshRequest.services?.userRepository.findByEmail).toBe('function');
    expect(typeof freshRequest.services?.userRepository.create).toBe('function');
    expect(typeof freshRequest.services?.testResultRepository.create).toBe('function');
    expect(typeof freshRequest.services?.testResultRepository.findByUserId).toBe('function');
  });
});
