// Base application error
class AppError extends Error {
    constructor(message, statusCode = 500, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.isOperational = true;
        this.errors = errors;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

// 400 - Bad Request
class ValidationError extends AppError {
    constructor(message, errors = null) {
        super(message, 400, errors);
    }
}

// 401 - Unauthorized
class AuthenticationError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}

// 403 - Forbidden
class AuthorizationError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}

// 404 - Not Found
class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

// 409 - Conflict
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}

// 429 - Too Many Requests
class RateLimitError extends AppError {
    constructor(message) {
        super(message, 429);
    }
}

// 500 - Elasticsearch Error
class ElasticsearchError extends AppError {
    constructor(message) {
        super(message, 500);
    }
}

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    RateLimitError,
    ElasticsearchError
}; 