import express, { Request, Response } from 'express';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from 'redis';
import { registerSocketHandlers } from './register-socket-handlers';
import { Game } from './game/index';
import { DBConnection } from './connection/DBCconnection';

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

  io.on('connect', async (socket) => {
    const game = new Game(new DBConnection(dbClient));
    await game.init();

    registerSocketHandlers(socket, game);
  });

  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}).catch((e) => {
  throw new Error('redis connection error', e);
});
