const axios = require('axios');
const logger = require('./logger');

class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 3;
    this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  async exec(request, fallback) {
    if (this.state === 'OPEN') {
      if (this.nextAttempt <= Date.now()) {
        this.state = 'HALF-OPEN';
      } else {
        return fallback();
      }
    }

    try {
      const response = await request();
      this.onSuccess();
      return response;
    } catch (error) {
      this.onFailure();
      return fallback(error);
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount += 1;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeout;
      logger.warn(`Circuit breaker opened, will try again at ${new Date(this.nextAttempt)}`);
    }
  }
}

// Create circuit breakers for each service
const customerServiceBreaker = new CircuitBreaker();
const productServiceBreaker = new CircuitBreaker();
const shoppingServiceBreaker = new CircuitBreaker();
const tenantServiceBreaker = new CircuitBreaker();

// Export circuit breaker wrapped axios instances
module.exports = {
  customerService: {
    async request(config) {
      return customerServiceBreaker.exec(
        () => axios(config),
        (error) => {
          logger.error(`Customer service request failed: ${error.message}`);
          throw error;
        }
      );
    }
  },
  productService: {
    async request(config) {
      return productServiceBreaker.exec(
        () => axios(config),
        (error) => {
          logger.error(`Product service request failed: ${error.message}`);
          throw error;
        }
      );
    }
  },
  shoppingService: {
    async request(config) {
      return shoppingServiceBreaker.exec(
        () => axios(config),
        (error) => {
          logger.error(`Shopping service request failed: ${error.message}`);
          throw error;
        }
      );
    }
  },
  tenantService: {
    async request(config) {
      return tenantServiceBreaker.exec(
        () => axios(config),
        (error) => {
          logger.error(`Tenant service request failed: ${error.message}`);
          throw error;
        }
      );
    }
  }
}; 