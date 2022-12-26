import { createClient } from 'redis';
import { Socket } from 'socket.io';
import { Game } from './game';
import { getNewPrompt } from './get-new-prompt';

export const registerSocketHandlers = (
  socket: Socket,
  dbClient: ReturnType<typeof createClient>,
  game: Game,
) => {
  socket.on('word', async (word: string) => {
    const wordPromptsList = await dbClient.sMembers(`${word}:prompts`);

    if (wordPromptsList.includes(game.prompt)) {
      getNewPrompt(socket, dbClient, game);
    }
  });

  socket.once('disconnect', () => {
    console.log('disconnect');
  });
};
