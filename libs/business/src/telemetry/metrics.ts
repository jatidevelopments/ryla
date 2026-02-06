/**
 * Metrics Collection
 * 
 * Lightweight metrics collection for tracking counters, gauges, and histograms.
 * Can be exported to various backends.
 */

export type MetricType = 'counter' | 'gauge' | 'histogram';

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  timestamp: Date;
}

export interface HistogramBuckets {
  buckets: number[];
  counts: number[];
  sum: number;
  count: number;
}

export type MetricHandler = (metric: Metric) => void;

class MetricsCollector {
  private counters: Map<string, number> = new Map();
  private gauges: Map<string, number> = new Map();
  private histograms: Map<string, HistogramBuckets> = new Map();
  private handlers: MetricHandler[] = [];
  private defaultLabels: Record<string, string> = {};

  constructor() {
    // Default histogram buckets (latency in ms)
    this.histogramBuckets = [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
  }

  private histogramBuckets: number[];

  /**
   * Increment a counter
   */
  increment(name: string, value: number = 1, labels: Record<string, string> = {}): void {
    const key = this.makeKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.emit({
      name,
      type: 'counter',
      value: current + value,
      labels: { ...this.defaultLabels, ...labels },
      timestamp: new Date(),
    });
  }

  /**
   * Set a gauge value
   */
  set(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.makeKey(name, labels);
    this.gauges.set(key, value);
    
    this.emit({
      name,
      type: 'gauge',
      value,
      labels: { ...this.defaultLabels, ...labels },
      timestamp: new Date(),
    });
  }

  /**
   * Record a histogram observation
   */
  observe(name: string, value: number, labels: Record<string, string> = {}): void {
    const key = this.makeKey(name, labels);
    let histogram = this.histograms.get(key);
    
    if (!histogram) {
      histogram = {
        buckets: [...this.histogramBuckets],
        counts: new Array(this.histogramBuckets.length + 1).fill(0),
        sum: 0,
        count: 0,
      };
      this.histograms.set(key, histogram);
    }

    // Update histogram
    histogram.sum += value;
    histogram.count++;
    
    for (let i = 0; i < histogram.buckets.length; i++) {
      if (value <= histogram.buckets[i]) {
        histogram.counts[i]++;
        break;
      }
    }
    // Infinity bucket
    histogram.counts[histogram.counts.length - 1]++;

    this.emit({
      name,
      type: 'histogram',
      value,
      labels: { ...this.defaultLabels, ...labels },
      timestamp: new Date(),
    });
  }

  /**
   * Time an operation and record as histogram
   */
  async time<T>(
    name: string,
    operation: () => Promise<T>,
    labels: Record<string, string> = {}
  ): Promise<T> {
    const start = Date.now();
    try {
      return await operation();
    } finally {
      const duration = Date.now() - start;
      this.observe(name, duration, labels);
    }
  }

  /**
   * Get counter value
   */
  getCounter(name: string, labels: Record<string, string> = {}): number {
    const key = this.makeKey(name, labels);
    return this.counters.get(key) || 0;
  }

  /**
   * Get gauge value
   */
  getGauge(name: string, labels: Record<string, string> = {}): number | undefined {
    const key = this.makeKey(name, labels);
    return this.gauges.get(key);
  }

  /**
   * Get histogram stats
   */
  getHistogram(name: string, labels: Record<string, string> = {}): HistogramBuckets | undefined {
    const key = this.makeKey(name, labels);
    return this.histograms.get(key);
  }

  /**
   * Get all metrics as array
   */
  getAll(): Metric[] {
    const metrics: Metric[] = [];
    
    for (const [key, value] of this.counters) {
      const { name, labels } = this.parseKey(key);
      metrics.push({ name, type: 'counter', value, labels, timestamp: new Date() });
    }
    
    for (const [key, value] of this.gauges) {
      const { name, labels } = this.parseKey(key);
      metrics.push({ name, type: 'gauge', value, labels, timestamp: new Date() });
    }
    
    for (const [key, histogram] of this.histograms) {
      const { name, labels } = this.parseKey(key);
      metrics.push({ name, type: 'histogram', value: histogram.count, labels, timestamp: new Date() });
    }
    
    return metrics;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
  }

  /**
   * Set default labels for all metrics
   */
  setDefaultLabels(labels: Record<string, string>): void {
    this.defaultLabels = labels;
  }

  /**
   * Add metric handler
   */
  addHandler(handler: MetricHandler): void {
    this.handlers.push(handler);
  }

  /**
   * Clear handlers
   */
  clearHandlers(): void {
    this.handlers = [];
  }

  private emit(metric: Metric): void {
    for (const handler of this.handlers) {
      try {
        handler(metric);
      } catch (err) {
        console.error('[Metrics] Handler error:', err);
      }
    }
  }

  private makeKey(name: string, labels: Record<string, string>): string {
    const sortedLabels = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${name}|${sortedLabels}`;
  }

  private parseKey(key: string): { name: string; labels: Record<string, string> } {
    const [name, labelsStr] = key.split('|');
    const labels: Record<string, string> = {};
    
    if (labelsStr) {
      for (const pair of labelsStr.split(',')) {
        const [k, v] = pair.split(':');
        if (k && v) labels[k] = v;
      }
    }
    
    return { name, labels };
  }
}

// Singleton instance
export const metrics = new MetricsCollector();

// Named exports
export const increment = metrics.increment.bind(metrics);
export const set = metrics.set.bind(metrics);
export const observe = metrics.observe.bind(metrics);
export const time = metrics.time.bind(metrics);

/**
 * Create a new metrics instance (for testing or isolation)
 */
export function createMetrics(): MetricsCollector {
  return new MetricsCollector();
}

/**
 * JSON handler for production logging
 */
export function createJsonMetricHandler(): MetricHandler {
  return (metric: Metric) => {
    console.log(JSON.stringify({
      timestamp: metric.timestamp.toISOString(),
      metric_name: metric.name,
      metric_type: metric.type,
      value: metric.value,
      ...metric.labels,
    }));
  };
}
