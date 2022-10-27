import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { User } from 'src/auth/entities/user.entity';
import { ConnectedClients } from './interfaces/connected-clients.interface';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesWsService {
  private connectedClients: ConnectedClients = {};

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerClient(client: Socket, id: string) {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) throw new Error('User not found');
    if (!user.isActive) throw new Error('User deactivated');

    this.checkUserConnection(user);

    this.connectedClients[client.id] = { socket: client, user };
  }

  getUserBySocketId(socketId: string) {
    return this.connectedClients[socketId].user.fullName;
  }

  removeClient(clientID: string) {
    delete this.connectedClients[clientID];
  }

  getConnectedClients(): string[] {
    return Object.keys(this.connectedClients);
  }

  private checkUserConnection(user: User) {
    for (const clientId of Object.keys(this.connectedClients)) {
      const connectedClient = this.connectedClients[clientId];

      if (connectedClient.user.id === user.id) {
        connectedClient.socket.disconnect();
        delete this.connectedClients[clientId];
        break;
      }
    }
  }
}