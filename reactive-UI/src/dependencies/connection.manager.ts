import WebSocket from 'ws';

export interface ILogger {
    log(message: string): void;
}

export class ConsoleLogger implements ILogger {
    log(message: string): void {
        console.log(message);
    }
}

class ConnectionModel {
  boardId: string;
  socket: WebSocket;

  constructor(boardId: string, socket: WebSocket) {
    this.boardId = boardId;
    this.socket = socket;
  }
}

export class ConnectionManager {
  private activeConnections: ConnectionModel[] = [];
  private logger: ILogger;

  constructor(logger: ILogger) {
    this.logger = logger;
  }

  async connect(boardId: string, socket: WebSocket): Promise<void> {
    this.activeConnections.push(new ConnectionModel(boardId, socket));
    this._connectionCount();
    await this.updateParticipationsCount(boardId);
  }

  async updateParticipationsCount(boardId: string): Promise<void> {
    const allConnectionsSameBoard = this.activeConnections.filter(connection => connection.boardId === boardId);
    const messageObject = {
      type: 'PARTICIPANTS_COUNT_UPDATE',
      data: allConnectionsSameBoard.length
    };
    const jsonString = JSON.stringify(messageObject);
    for (const connection of allConnectionsSameBoard) {
      connection.socket.send(jsonString);
    }
  }

  disconnect(socket: WebSocket): void {
    this.activeConnections = this.activeConnections.filter(connection => connection.socket !== socket);
    this._connectionCount();
  }

  async sendPersonalMessage(message: string, socket: WebSocket): Promise<void> {
    socket.send(message);
  }

  async broadcast(message: string): Promise<void> {
    for (const connection of this.activeConnections) {
      connection.socket.send(message);
    }
  }

  async toBoardUsers(boardId: string, message: string, currentUser: WebSocket): Promise<void> {
    for (const connection of this.activeConnections.filter(connection => connection.boardId === boardId && connection.socket !== currentUser)) {
      connection.socket.send(message);
    }
  }

  private _connectionCount(): void {
    this.logger.log(`${this.activeConnections.length} connections left!`);
  }
}
