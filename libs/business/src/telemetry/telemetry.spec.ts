import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  telemetry,
  createTelemetry,
  createJsonSpanHandler,
  SpanEvent,
} from './telemetry';

describe('Telemetry', () => {
  let testTelemetry: ReturnType<typeof createTelemetry>;
  let capturedSpans: SpanEvent[];

  beforeEach(() => {
    capturedSpans = [];
    testTelemetry = createTelemetry({
      enabled: true,
      logToConsole: false,
      sampleRate: 1.0,
      serviceName: 'test-service',
    });
    testTelemetry.addSpanHandler((event) => capturedSpans.push(event));
  });

  describe('span', () => {
    it('should capture successful span', async () => {
      const result = await testTelemetry.span(
        'test.operation',
        { key: 'value' },
        () => Promise.resolve('success')
      );

      expect(result).toBe('success');
      expect(capturedSpans.length).toBe(1);
      expect(capturedSpans[0].name).toBe('test.operation');
      expect(capturedSpans[0].status).toBe('ok');
      expect(capturedSpans[0].attributes.key).toBe('value');
    });

    it('should capture failed span', async () => {
      await expect(
        testTelemetry.span(
          'test.fail',
          {},
          () => Promise.reject(new Error('test error'))
        )
      ).rejects.toThrow('test error');

      expect(capturedSpans.length).toBe(1);
      expect(capturedSpans[0].status).toBe('error');
      expect(capturedSpans[0].error?.message).toBe('test error');
    });

    it('should track duration', async () => {
      await testTelemetry.span(
        'test.slow',
        {},
        async () => {
          await new Promise(r => setTimeout(r, 50));
          return 'done';
        }
      );

      expect(capturedSpans[0].durationMs).toBeGreaterThanOrEqual(40);
    });

    it('should include service name', async () => {
      await testTelemetry.span('test.op', {}, () => Promise.resolve('ok'));

      expect(capturedSpans[0].attributes['service.name']).toBe('test-service');
    });

    it('should track parent-child relationships', async () => {
      await testTelemetry.span('parent', {}, async () => {
        await testTelemetry.span('child', {}, () => Promise.resolve('inner'));
        return 'outer';
      });

      expect(capturedSpans.length).toBe(2);
      const child = capturedSpans[0];
      const parent = capturedSpans[1];
      
      expect(child.name).toBe('child');
      expect(parent.name).toBe('parent');
      expect(child.parentSpanId).toBe(parent.attributes['span.id']);
    });
  });

  describe('spanSync', () => {
    it('should capture sync operations', () => {
      const result = testTelemetry.spanSync(
        'sync.op',
        { sync: true },
        () => 'sync result'
      );

      expect(result).toBe('sync result');
      expect(capturedSpans.length).toBe(1);
      expect(capturedSpans[0].name).toBe('sync.op');
    });

    it('should capture sync errors', () => {
      expect(() => 
        testTelemetry.spanSync(
          'sync.fail',
          {},
          () => { throw new Error('sync error'); }
        )
      ).toThrow('sync error');

      expect(capturedSpans[0].status).toBe('error');
    });
  });

  describe('emit', () => {
    it('should emit standalone events', () => {
      const events: any[] = [];
      testTelemetry.addEventHandler((e) => events.push(e));

      testTelemetry.emit('user.action', { action: 'click' });

      expect(events.length).toBe(1);
      expect(events[0].name).toBe('user.action');
      expect(events[0].attributes.action).toBe('click');
    });
  });

  describe('configuration', () => {
    it('should respect enabled flag', async () => {
      const disabledTelemetry = createTelemetry({ enabled: false, logToConsole: false });
      const spans: SpanEvent[] = [];
      disabledTelemetry.addSpanHandler((e) => spans.push(e));

      await disabledTelemetry.span('test', {}, () => Promise.resolve('ok'));

      expect(spans.length).toBe(0);
    });

    it('should respect sample rate', async () => {
      const sampledTelemetry = createTelemetry({
        enabled: true,
        logToConsole: false,
        sampleRate: 0, // Never sample
      });
      const spans: SpanEvent[] = [];
      sampledTelemetry.addSpanHandler((e) => spans.push(e));

      await sampledTelemetry.span('test', {}, () => Promise.resolve('ok'));

      expect(spans.length).toBe(0);
    });

    it('should allow config updates', () => {
      testTelemetry.configure({ serviceName: 'updated-service' });
      const config = testTelemetry.getConfig();
      expect(config.serviceName).toBe('updated-service');
    });
  });

  describe('handlers', () => {
    it('should support multiple handlers', async () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      
      testTelemetry.addSpanHandler(handler1);
      testTelemetry.addSpanHandler(handler2);

      await testTelemetry.span('test', {}, () => Promise.resolve('ok'));

      expect(handler1).toHaveBeenCalled();
      expect(handler2).toHaveBeenCalled();
    });

    it('should handle handler errors gracefully', async () => {
      testTelemetry.addSpanHandler(() => {
        throw new Error('handler error');
      });

      // Should not throw
      await expect(
        testTelemetry.span('test', {}, () => Promise.resolve('ok'))
      ).resolves.toBe('ok');
    });

    it('should clear handlers', async () => {
      const handler = vi.fn();
      testTelemetry.addSpanHandler(handler);
      testTelemetry.clearHandlers();

      await testTelemetry.span('test', {}, () => Promise.resolve('ok'));

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('createJsonSpanHandler', () => {
    it('should create JSON output', async () => {
      const logs: string[] = [];
      const originalLog = console.log;
      console.log = (msg: string) => logs.push(msg);

      const jsonHandler = createJsonSpanHandler();
      jsonHandler({
        name: 'test.json',
        timestamp: new Date('2026-01-01T00:00:00Z'),
        durationMs: 100,
        status: 'ok',
        attributes: { key: 'value' },
      });

      console.log = originalLog;

      expect(logs.length).toBe(1);
      const parsed = JSON.parse(logs[0]);
      expect(parsed.name).toBe('test.json');
      expect(parsed.duration_ms).toBe(100);
      expect(parsed.status).toBe('ok');
    });
  });
});
