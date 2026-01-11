import { AllExceptionsFilter } from './all-exceptions.filter';
import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockRequest: { url: string; method: string };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/api/test',
      method: 'GET',
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('in development mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      filter = new AllExceptionsFilter();
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
    });

    it('should expose detailed error messages for generic errors', () => {
      const error = new Error('Database connection failed at /var/db/app.db');

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Database connection failed at /var/db/app.db',
        }),
      );
    });

    it('should pass through HttpException responses', () => {
      const exception = new HttpException(
        { message: 'Not Found', details: 'Resource missing' },
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          error: { message: 'Not Found', details: 'Resource missing' },
        }),
      );
    });
  });

  describe('in production mode', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      filter = new AllExceptionsFilter();
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
    });

    it('should hide detailed error messages for generic errors', () => {
      const error = new Error('Database connection failed at /var/db/app.db');

      filter.catch(error, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal server error',
        }),
      );
    });

    it('should not leak sensitive path information in production', () => {
      const error = new Error(
        "ENOENT: no such file or directory, open '/etc/passwd'",
      );

      filter.catch(error, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.error).toBe('Internal server error');
      expect(jsonCall.error).not.toContain('/etc/passwd');
    });

    it('should not leak database connection strings in production', () => {
      const error = new Error(
        'Connection failed: postgresql://user:password@localhost:5432/db',
      );

      filter.catch(error, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.error).toBe('Internal server error');
      expect(jsonCall.error).not.toContain('postgresql');
      expect(jsonCall.error).not.toContain('password');
    });

    it('should still pass through HttpException responses in production', () => {
      const exception = new HttpException(
        'Resource not found',
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          error: 'Resource not found',
        }),
      );
    });

    it('should handle BadRequestException with validation details', () => {
      const exception = new HttpException(
        { message: 'Validation failed', errors: ['email is required'] },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          error: {
            message: 'Validation failed',
            errors: ['email is required'],
          },
        }),
      );
    });
  });

  describe('response structure', () => {
    beforeEach(() => {
      filter = new AllExceptionsFilter();
    });

    it('should include timestamp in response', () => {
      const error = new Error('Test error');

      filter.catch(error, mockHost);

      const jsonCall = mockResponse.json.mock.calls[0][0];
      expect(jsonCall.timestamp).toBeDefined();
      expect(new Date(jsonCall.timestamp).getTime()).not.toBeNaN();
    });

    it('should include request path in response', () => {
      const error = new Error('Test error');

      filter.catch(error, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          path: '/api/test',
        }),
      );
    });

    it('should include status code in response', () => {
      const error = new Error('Test error');

      filter.catch(error, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        }),
      );
    });
  });

  describe('unknown exception types', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      filter = new AllExceptionsFilter();
    });

    afterEach(() => {
      delete process.env.NODE_ENV;
    });

    it('should handle non-Error exceptions safely', () => {
      const strangeException = { weird: 'object' };

      filter.catch(strangeException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal server error',
        }),
      );
    });

    it('should handle string exceptions', () => {
      const stringException = 'Something went wrong';

      filter.catch(stringException, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
        }),
      );
    });

    it('should handle null/undefined exceptions', () => {
      filter.catch(null, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: 'Internal server error',
        }),
      );
    });
  });
});
