import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*', // TODO: Configure CORS properly
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    // In a real app, you would have a robust authentication strategy here
    // e.g., validating a JWT token from the handshake
    const userId = client.handshake.query.userId || client.handshake.query['user-id'];

    if (userId) {
      console.log(`Client connected: ${client.id}, user ID: ${userId}`);
      client.join(`user-${userId}`);
    } else {
      console.log(`Client connected with no user ID: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // Send notification to specific user
  public sendToUser(userId: number, event: string, data: any): void {
    this.server.to(`user-${userId}`).emit(event, data);
  }
}

