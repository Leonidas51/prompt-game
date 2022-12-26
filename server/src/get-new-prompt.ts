import { createClient } from 'redis';
import { Socket } from 'socket.io';
import { Game } from './game';

export const getNewPrompt = async (
  socket: Socket,
  dbClient: ReturnType<typeof createClient>,
  game: Game,
) => {
  const prompt = await dbClient.sRandMember('prompts');

  if (prompt) {
    game.prompt = prompt;

    socket.emit('prompt', prompt);
  }
};
