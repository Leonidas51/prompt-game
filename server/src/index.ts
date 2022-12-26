import express, { Request, Response } from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { registerSocketHandlers } from './register-socket-handlers';
import { getNewPrompt } from './get-new-prompt';
import { Game } from './game/index';

const dbClient = createClient();
dbClient.connect().then(() => {
  const app = express();
  const port = 3000;

  app.use(express.static(path.resolve(__dirname, '../client')));

  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../client/index.html'));
  });

  const server = createServer(app);
  const io = new Server(server);

  io.on('connect', (socket) => {
    const game = new Game();

    registerSocketHandlers(socket, dbClient, game);
    getNewPrompt(socket, dbClient, game);
  });

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}).catch((e) => {
  throw new Error('redis connection error', e);
});
