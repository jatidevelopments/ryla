import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
  SOCKET_EVENTS,
  GenerationProgressPayload,
  GenerationCompletePayload,
  GenerationErrorPayload,
} from '@ryla/shared';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGINS?.split(',') || '*',
    credentials: true,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  // Track which users are subscribed to which promptIds
  private userSubscriptions: Map<string, Set<string>> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId || client.handshake.query['user-id'];

    if (userId) {
      console.log(`[WebSocket] Client connected: ${client.id}, user ID: ${userId}`);
      client.join(`user-${userId}`);
      
      // Send connection confirmation
      client.emit(SOCKET_EVENTS.CONNECTION_ESTABLISHED, { userId: String(userId) });
    } else {
      console.log(`[WebSocket] Client connected with no user ID: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`[WebSocket] Client disconnected: ${client.id}`);
    // Clean up subscriptions for this client
    this.userSubscriptions.delete(client.id);
  }

  @SubscribeMessage(SOCKET_EVENTS.GENERATION_SUBSCRIBE)
  handleGenerationSubscribe(client: Socket, promptIds: string[]) {
    const existing = this.userSubscriptions.get(client.id) || new Set();
    promptIds.forEach(id => existing.add(id));
    this.userSubscriptions.set(client.id, existing);
    console.log(`[WebSocket] Client ${client.id} subscribed to: ${promptIds.join(', ')}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.GENERATION_UNSUBSCRIBE)
  handleGenerationUnsubscribe(client: Socket, promptIds: string[]) {
    const existing = this.userSubscriptions.get(client.id);
    if (existing) {
      promptIds.forEach(id => existing.delete(id));
    }
    console.log(`[WebSocket] Client ${client.id} unsubscribed from: ${promptIds.join(', ')}`);
  }

  @SubscribeMessage(SOCKET_EVENTS.PING)
  handlePing(client: Socket) {
    client.emit('pong');
  }

  // Send notification to specific user
  public sendToUser(userId: number | string, event: string, data: unknown): void {
    this.server.to(`user-${userId}`).emit(event, data);
  }

  /**
   * Emit generation progress to a specific user
   */
  public emitGenerationProgress(userId: number | string, payload: GenerationProgressPayload): void {
    this.server.to(`user-${userId}`).emit(SOCKET_EVENTS.GENERATION_PROGRESS, payload);
  }

  /**
   * Emit generation complete to a specific user
   */
  public emitGenerationComplete(userId: number | string, payload: GenerationCompletePayload): void {
    this.server.to(`user-${userId}`).emit(SOCKET_EVENTS.GENERATION_COMPLETE, payload);
    console.log(`[WebSocket] Emitted generation:complete for user ${userId}, promptId: ${payload.promptId}`);
  }

  /**
   * Emit generation error to a specific user
   */
  public emitGenerationError(userId: number | string, payload: GenerationErrorPayload): void {
    this.server.to(`user-${userId}`).emit(SOCKET_EVENTS.GENERATION_ERROR, payload);
    console.log(`[WebSocket] Emitted generation:error for user ${userId}, promptId: ${payload.promptId}`);
  }
}

