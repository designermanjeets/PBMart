const { createLogger } = require('../logger');
const logger = createLogger('circuit-breaker');

// Circuit breaker states
const STATES = {
  CLOSED: 'CLOSED',
  OPEN: 'OPEN',
  HALF_OPEN: 'HALF_OPEN'
};

// Circuit breaker configuration
const DEFAULT_OPTIONS = {
  failureThreshold: 5,        // Number of failures before opening circuit
  resetTimeout: 30000,        // Time in ms to wait before trying again (30 seconds)
  halfOpenSuccessThreshold: 2, // Number of successes needed to close circuit
  timeout: 10000              // Request timeout in ms
};

// Circuit breakers store
const circuitBreakers = {};

class CircuitBreaker {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.state = STATES.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttempt = Date.now();
    this.options = { ...DEFAULT_OPTIONS, ...options };
    
    logger.info(`Circuit breaker created for service: ${serviceName}`);
  }

  async exec(request) {
    if (this.state === STATES.OPEN) {
      if (this.nextAttempt <= Date.now()) {
        // Move to half-open state and allow the request
        this.state = STATES.HALF_OPEN;
        this.successCount = 0;
        logger.info(`Circuit half-open for service: ${this.serviceName}`);
      } else {
        // Circuit is open, fast fail
        logger.warn(`Circuit open for service: ${this.serviceName}, fast failing`);
        throw new Error(`Service ${this.serviceName} is unavailable`);
      }
    }

    try {
      // Execute the request with a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error(`Request to ${this.serviceName} timed out`)), this.options.timeout);
      });
      
      const result = await Promise.race([request(), timeoutPromise]);
      
      // Handle success
      this.handleSuccess();
      return result;
    } catch (error) {
      // Handle failure
      this.handleFailure(error);
      throw error;
    }
  }

  handleSuccess() {
    if (this.state === STATES.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.options.halfOpenSuccessThreshold) {
        this.state = STATES.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        logger.info(`Circuit closed for service: ${this.serviceName}`);
      }
    } else if (this.state === STATES.CLOSED) {
      this.failureCount = 0; // Reset failure count on success
    }
  }

  handleFailure(error) {
    logger.error(`Request to ${this.serviceName} failed: ${error.message}`);
    
    if (this.state === STATES.HALF_OPEN) {
      this.state = STATES.OPEN;
      this.nextAttempt = Date.now() + this.options.resetTimeout;
      logger.warn(`Circuit opened for service: ${this.serviceName}, next attempt at ${new Date(this.nextAttempt)}`);
    } else if (this.state === STATES.CLOSED) {
      this.failureCount++;
      
      if (this.failureCount >= this.options.failureThreshold) {
        this.state = STATES.OPEN;
        this.nextAttempt = Date.now() + this.options.resetTimeout;
        logger.warn(`Circuit opened for service: ${this.serviceName}, next attempt at ${new Date(this.nextAttempt)}`);
      }
    }
  }
}

// Create a circuit breaker middleware
const createCircuitBreaker = (requestHandler, serviceName, options = {}) => {
  // Create or reuse circuit breaker
  if (!circuitBreakers[serviceName]) {
    circuitBreakers[serviceName] = new CircuitBreaker(serviceName, options);
  }
  
  const breaker = circuitBreakers[serviceName];
  
  // Return middleware function
  return async (req, res, next) => {
    try {
      await breaker.exec(async () => {
        return await requestHandler(req, res, next);
      });
    } catch (error) {
      if (error.message === `Service ${serviceName} is unavailable`) {
        return res.status(503).json({
          error: 'Service Unavailable',
          message: `The ${serviceName} is temporarily unavailable. Please try again later.`
        });
      }
      
      // For other errors, pass to next error handler
      next(error);
    }
  };
};

module.exports = {
  createCircuitBreaker,
  CircuitBreaker,
  STATES
}; 