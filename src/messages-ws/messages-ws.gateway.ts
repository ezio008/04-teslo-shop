import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { NewMessageDto } from './dto/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/auth/interfaces';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.headers.authentication as string;
    let jwtPayload: JwtPayload;
    try {
      jwtPayload = this.jwtService.verify(token);
      await this.messagesWsService.registerClient(client, jwtPayload.id);
    } catch (error) {
      client.disconnect();
      return;
    }

    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  handleDisconnect(client: Socket) {
    this.messagesWsService.removeClient(client.id);
    this.wss.emit(
      'clients-updated',
      this.messagesWsService.getConnectedClients(),
    );
  }

  @SubscribeMessage('message-from-client')
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {
    //! Emite únicamente al cliente
    // client.emit('messages-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'No message',
    // });

    //! Emitir a todos menos al emisor
    // client.broadcast.emit('messages-from-server', {
    //   fullName: 'Soy yo',
    //   message: payload.message || 'No message',
    // });
    console.log(payload);

    //! Emitir a todos los clientes
    this.wss.emit('messages-from-server', {
      fullName: this.messagesWsService.getUserBySocketId(client.id),
      message: payload.message || 'No message',
    });
  }
}
