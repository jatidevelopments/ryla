/**
 * Circuit Breaker Pattern
 * 
 * Prevents cascading failures by temporarily stopping requests to a failing service.
 * Based on the Erlang/Elixir circuit breaker pattern.
 * 
 * States:
 * - CLOSED: Normal operation, requests pass through
 * - OPEN: Service is failing, requests are rejected immediately
 * - HALF_OPEN: Testing if service has recovered
 */

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerConfig {
  /** Number of failures before opening circuit */
  failureThreshold: number;
  /** Time in ms before attempting to close circuit */
  resetTimeout: number;
  /** Number of successes in half-open state before closing */
  successThreshold: number;
  /** Time window in ms for counting failures */
  failureWindow: number;
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 2,
  failureWindow: 60000, // 1 minute
};

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private lastStateChangeTime: number = Date.now();
  private failureTimestamps: number[] = [];
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;
  private config: CircuitBreakerConfig;

  constructor(
    private readonly name: string,
    config: Partial<CircuitBreakerConfig> = {}
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute an operation through the circuit breaker
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Check if circuit should transition from OPEN to HALF_OPEN
    if (this.state === 'OPEN') {
      const timeSinceLastFailure = Date.now() - this.lastStateChangeTime;
      if (timeSinceLastFailure >= this.config.resetTimeout) {
        this.transitionTo('HALF_OPEN');
      } else {
        throw new CircuitBreakerOpenError(
          `Circuit breaker "${this.name}" is OPEN. Retry after ${this.config.resetTimeout - timeSinceLastFailure}ms`
        );
      }
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * Check if circuit allows requests
   */
  isAllowed(): boolean {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'HALF_OPEN') return true;
    
    // OPEN state - check if enough time has passed
    const timeSinceLastFailure = Date.now() - this.lastStateChangeTime;
    return timeSinceLastFailure >= this.config.resetTimeout;
  }

  /**
   * Get current state
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Get statistics
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      totalSuccesses: this.totalSuccesses,
    };
  }

  /**
   * Force reset the circuit breaker
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
    this.failureTimestamps = [];
    this.lastStateChangeTime = Date.now();
    console.log(`[CircuitBreaker:${this.name}] Reset to CLOSED`);
  }

  private recordSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.totalSuccesses++;

    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.config.successThreshold) {
        this.transitionTo('CLOSED');
      }
    } else if (this.state === 'CLOSED') {
      // Clear failures on success in closed state
      this.failures = 0;
      this.cleanupOldFailures();
    }
  }

  private recordFailure(): void {
    const now = Date.now();
    this.lastFailureTime = now;
    this.totalFailures++;
    this.failureTimestamps.push(now);

    if (this.state === 'HALF_OPEN') {
      // Any failure in half-open reopens the circuit
      this.transitionTo('OPEN');
    } else if (this.state === 'CLOSED') {
      this.cleanupOldFailures();
      this.failures = this.failureTimestamps.length;

      if (this.failures >= this.config.failureThreshold) {
        this.transitionTo('OPEN');
      }
    }
  }

  private cleanupOldFailures(): void {
    const cutoff = Date.now() - this.config.failureWindow;
    this.failureTimestamps = this.failureTimestamps.filter(t => t > cutoff);
  }

  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChangeTime = Date.now();

    if (newState === 'CLOSED') {
      this.failures = 0;
      this.successes = 0;
      this.failureTimestamps = [];
    } else if (newState === 'HALF_OPEN') {
      this.successes = 0;
    }

    console.log(`[CircuitBreaker:${this.name}] ${oldState} -> ${newState}`);
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}
