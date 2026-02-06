import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  metrics,
  createMetrics,
  createJsonMetricHandler,
  Metric,
} from './metrics';

describe('Metrics', () => {
  let testMetrics: ReturnType<typeof createMetrics>;
  let capturedMetrics: Metric[];

  beforeEach(() => {
    capturedMetrics = [];
    testMetrics = createMetrics();
    testMetrics.addHandler((m) => capturedMetrics.push(m));
  });

  describe('counter', () => {
    it('should increment counter', () => {
      testMetrics.increment('requests.total');
      testMetrics.increment('requests.total');
      testMetrics.increment('requests.total', 5);

      expect(testMetrics.getCounter('requests.total')).toBe(7);
    });

    it('should support labels', () => {
      testMetrics.increment('requests.total', 1, { method: 'GET' });
      testMetrics.increment('requests.total', 1, { method: 'POST' });
      testMetrics.increment('requests.total', 1, { method: 'GET' });

      expect(testMetrics.getCounter('requests.total', { method: 'GET' })).toBe(2);
      expect(testMetrics.getCounter('requests.total', { method: 'POST' })).toBe(1);
    });

    it('should emit metric events', () => {
      testMetrics.increment('test.counter');

      expect(capturedMetrics.length).toBe(1);
      expect(capturedMetrics[0].name).toBe('test.counter');
      expect(capturedMetrics[0].type).toBe('counter');
    });
  });

  describe('gauge', () => {
    it('should set gauge value', () => {
      testMetrics.set('queue.depth', 10);
      expect(testMetrics.getGauge('queue.depth')).toBe(10);

      testMetrics.set('queue.depth', 5);
      expect(testMetrics.getGauge('queue.depth')).toBe(5);
    });

    it('should support labels', () => {
      testMetrics.set('queue.depth', 10, { queue: 'high' });
      testMetrics.set('queue.depth', 5, { queue: 'low' });

      expect(testMetrics.getGauge('queue.depth', { queue: 'high' })).toBe(10);
      expect(testMetrics.getGauge('queue.depth', { queue: 'low' })).toBe(5);
    });
  });

  describe('histogram', () => {
    it('should record observations', () => {
      testMetrics.observe('request.duration', 10);
      testMetrics.observe('request.duration', 50);
      testMetrics.observe('request.duration', 100);

      const histogram = testMetrics.getHistogram('request.duration');
      expect(histogram?.count).toBe(3);
      expect(histogram?.sum).toBe(160);
    });

    it('should support labels', () => {
      testMetrics.observe('request.duration', 10, { endpoint: '/api/users' });
      testMetrics.observe('request.duration', 20, { endpoint: '/api/users' });

      const histogram = testMetrics.getHistogram('request.duration', { endpoint: '/api/users' });
      expect(histogram?.count).toBe(2);
    });
  });

  describe('time', () => {
    it('should time async operations', async () => {
      const result = await testMetrics.time(
        'operation.duration',
        async () => {
          await new Promise(r => setTimeout(r, 50));
          return 'done';
        }
      );

      expect(result).toBe('done');
      
      const histogram = testMetrics.getHistogram('operation.duration');
      expect(histogram?.count).toBe(1);
      expect(histogram?.sum).toBeGreaterThanOrEqual(40);
    });

    it('should record duration even on error', async () => {
      await expect(
        testMetrics.time(
          'error.duration',
          () => Promise.reject(new Error('fail'))
        )
      ).rejects.toThrow('fail');

      const histogram = testMetrics.getHistogram('error.duration');
      expect(histogram?.count).toBe(1);
    });
  });

  describe('getAll', () => {
    it('should return all metrics', () => {
      testMetrics.increment('counter');
      testMetrics.set('gauge', 5);
      testMetrics.observe('histogram', 10);

      const all = testMetrics.getAll();
      expect(all.length).toBe(3);
      expect(all.map(m => m.name).sort()).toEqual(['counter', 'gauge', 'histogram']);
    });
  });

  describe('reset', () => {
    it('should clear all metrics', () => {
      testMetrics.increment('counter');
      testMetrics.set('gauge', 5);
      testMetrics.observe('histogram', 10);

      testMetrics.reset();

      expect(testMetrics.getCounter('counter')).toBe(0);
      expect(testMetrics.getGauge('gauge')).toBeUndefined();
      expect(testMetrics.getHistogram('histogram')).toBeUndefined();
    });
  });

  describe('defaultLabels', () => {
    it('should include default labels in all metrics', () => {
      testMetrics.setDefaultLabels({ service: 'ryla-api', env: 'test' });
      testMetrics.increment('requests');

      expect(capturedMetrics[0].labels.service).toBe('ryla-api');
      expect(capturedMetrics[0].labels.env).toBe('test');
    });
  });

  describe('handlers', () => {
    it('should support multiple handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      testMetrics.addHandler(handler1);
      testMetrics.addHandler(handler2);
      testMetrics.increment('test');

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle handler errors gracefully', () => {
      testMetrics.addHandler(() => {
        throw new Error('handler error');
      });

      // Should not throw
      expect(() => testMetrics.increment('test')).not.toThrow();
    });

    it('should clear handlers', () => {
      const handler = vi.fn();
      testMetrics.addHandler(handler);
      testMetrics.clearHandlers();
      testMetrics.increment('test');

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('createJsonMetricHandler', () => {
    it('should output JSON', () => {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      const handler = createJsonMetricHandler();
      handler({
        name: 'test.metric',
        type: 'counter',
        value: 5,
        labels: { service: 'test' },
        timestamp: new Date('2026-01-01T00:00:00Z'),
      });

      console.log = originalLog;

      expect(logs.length).toBe(1);
      const parsed = JSON.parse(logs[0]);
      expect(parsed.metric_name).toBe('test.metric');
      expect(parsed.metric_type).toBe('counter');
      expect(parsed.value).toBe(5);
      expect(parsed.service).toBe('test');
    });
  });
});
