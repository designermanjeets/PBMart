/**
 * A simple circuit breaker implementation
 */
class CircuitBreaker {
    constructor(options = {}) {
        this.failureThreshold = options.failureThreshold || 3;
        this.resetTimeout = options.resetTimeout || 30000; // 30 seconds
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF-OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.successThreshold = options.successThreshold || 2;
        this.successCount = 0;
    }

    async execute(fn) {
        if (this.state === 'OPEN') {
            // Check if reset timeout has elapsed
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = 'HALF-OPEN';
                this.successCount = 0;
                console.log('Circuit breaker state changed to HALF-OPEN');
            } else {
                throw new Error('Circuit is OPEN - service unavailable');
            }
        }

        try {
            const result = await fn();
            
            // If we're in HALF-OPEN state, increment success count
            if (this.state === 'HALF-OPEN') {
                this.successCount++;
                if (this.successCount >= this.successThreshold) {
                    this.state = 'CLOSED';
                    this.failureCount = 0;
                    console.log('Circuit breaker state changed to CLOSED');
                }
            }
            
            return result;
        } catch (error) {
            this.failureCount++;
            this.lastFailureTime = Date.now();
            
            if (this.state === 'CLOSED' && this.failureCount >= this.failureThreshold) {
                this.state = 'OPEN';
                console.log('Circuit breaker state changed to OPEN');
            }
            
            throw error;
        }
    }
}

module.exports = CircuitBreaker; 