import { Socket } from 'socket.io';
import { Game } from './game';

export const registerSocketHandlers = (
  socket: Socket,
  game: Game,
) => {
  socket.on('start', () => {
    game.start();

    socket.emit('prompt', game.getCurrentPrompt());
  });

  socket.on('word', async (word: string) => {
    const isSuccess = await game.onWord(word);

    if (isSuccess) {
      socket.emit('prompt', game.getNewPrompt());
    }
  });

  socket.once('disconnect', () => {
    console.log('disconnect');
  });
};
