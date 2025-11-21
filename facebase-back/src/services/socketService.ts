import { Server as SocketIOServer } from 'socket.io';
import { Server as HttpServer } from 'http';

let io: SocketIOServer | null = null;

export const initializeSocketIO = (httpServer: HttpServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // В production укажите конкретные домены
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Клиент подписывается на обновления для конкретного userId
    socket.on('subscribe', (userId: string) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${userId} subscribed to updates (socket: ${socket.id})`);
    });

    // Клиент отписывается
    socket.on('unsubscribe', (userId: string) => {
      socket.leave(`user:${userId}`);
      console.log(`👋 User ${userId} unsubscribed (socket: ${socket.id})`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.IO initialized');
  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.');
  }
  return io;
};

// События для submission
export const emitSubmissionCreated = (userId: string, submission: any) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('submission:created', {
    type: 'submission:created',
    userId,
    submission,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Emitted submission:created for user ${userId}`);
};

export const emitSubmissionUpdated = (userId: string, submission: any) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('submission:updated', {
    type: 'submission:updated',
    userId,
    submission,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Emitted submission:updated for user ${userId}`);
};

export const emitStepCompleted = (userId: string, submission: any, stepNumber: number) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('step:completed', {
    type: 'step:completed',
    userId,
    submission,
    stepNumber,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Emitted step:completed (step ${stepNumber}) for user ${userId}`);
};

export const emitTaskListUpdated = (userId: string) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('task:list:updated', {
    type: 'task:list:updated',
    userId,
    timestamp: new Date().toISOString()
  });
  
  console.log(`📡 Emitted task:list:updated for user ${userId}`);
};

