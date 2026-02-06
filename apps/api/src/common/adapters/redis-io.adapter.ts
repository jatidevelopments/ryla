import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ServerOptions } from 'socket.io';

type RedisClient = ReturnType<typeof createClient>;

/**
 * Redis-backed Socket.io adapter for multi-server support
 * 
 * When running multiple API server instances, WebSocket connections
 * are distributed across servers. The Redis adapter uses pub/sub to
 * broadcast events to all connected clients regardless of which
 * server they're connected to.
 * 
 * Flow:
 * 1. User connects to Server A
 * 2. Job completes on Server B
 * 3. Server B publishes event to Redis
 * 4. Server A receives event via Redis subscription
 * 5. Server A forwards event to connected user
 */
export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter> | null = null;
  private pubClient: RedisClient | null = null;
  private subClient: RedisClient | null = null;
  private isRedisConnected = false;

  constructor(app: INestApplication) {
    super(app);
  }

  /**
   * Connect to Redis and initialize the adapter
   * Call this before the app starts listening
   */
  async connectToRedis(): Promise<boolean> {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl) {
      console.warn('[RedisIoAdapter] REDIS_URL not set, using in-memory adapter (single-server only)');
      return false;
    }

    try {
      // Create pub/sub clients
      this.pubClient = createClient({ url: redisUrl });
      this.subClient = this.pubClient.duplicate();

      // Handle connection errors gracefully
      this.pubClient.on('error', (err: Error) => {
        console.error('[RedisIoAdapter] Pub client error:', err.message);
      });
      this.subClient.on('error', (err: Error) => {
        console.error('[RedisIoAdapter] Sub client error:', err.message);
      });

      // Connect both clients
      await Promise.all([
        this.pubClient.connect(),
        this.subClient.connect(),
      ]);

      // Create the Redis adapter
      this.adapterConstructor = createAdapter(this.pubClient, this.subClient);
      this.isRedisConnected = true;
      
      console.log('[RedisIoAdapter] Connected to Redis, multi-server WebSocket enabled');
      return true;
    } catch (error) {
      console.error('[RedisIoAdapter] Failed to connect to Redis:', error);
      console.warn('[RedisIoAdapter] Falling back to in-memory adapter (single-server only)');
      this.isRedisConnected = false;
      return false;
    }
  }

  /**
   * Create the Socket.io server with Redis adapter if available
   */
  createIOServer(port: number, options?: ServerOptions) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: process.env.CORS_ORIGINS?.split(',') || '*',
        credentials: true,
      },
      // Ping/pong for connection health
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Use Redis adapter if connected
    if (this.adapterConstructor && this.isRedisConnected) {
      server.adapter(this.adapterConstructor);
      console.log('[RedisIoAdapter] Socket.io server using Redis adapter');
    } else {
      console.log('[RedisIoAdapter] Socket.io server using in-memory adapter');
    }

    return server;
  }

  /**
   * Clean up Redis connections on shutdown
   */
  async disconnect(): Promise<void> {
    if (this.pubClient) {
      await this.pubClient.quit();
    }
    if (this.subClient) {
      await this.subClient.quit();
    }
    this.isRedisConnected = false;
  }

  /**
   * Check if Redis adapter is active
   */
  isUsingRedis(): boolean {
    return this.isRedisConnected;
  }
}
