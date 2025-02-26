class AppError extends Error {
    constructor(message, statusCode, errors = {}) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
        this.errors = errors;
        this.isOperational = true;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message, errors = {}) {
        super(message, 400, errors);
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
    }
}

class AuthenticationError extends AppError {
    constructor(message) {
        super(message, 401);
    }
}

class AuthorizationError extends AppError {
    constructor(message) {
        super(message, 403);
    }
}

class ConflictError extends AppError {
    constructor(message, errors = {}) {
        super(message, 409, errors);
    }
}

module.exports = {
    AppError,
    ValidationError,
    NotFoundError,
    AuthenticationError,
    AuthorizationError,
    ConflictError
}; 