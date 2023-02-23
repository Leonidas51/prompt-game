import React, { useCallback, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { cn } from '@bem-react/classname';

const className = cn('game');

const GuessStatusTemplate = {
  NOT_FOUND: (guess: string) => `Word "${guess}" was not found`,
  FOUND: (guess: string) => `Hooray! Word "${guess}" found`,
} as const;

type GuessStatusRecordKey = keyof typeof GuessStatusTemplate;

const players = [0, 1, 2];

function getNextPlayer(items: number[], currentItem: number): number {
  return ++currentItem % items.length;
}

const socket = io('localhost:3000');

export const Game = () => {
  const [inputValue, setInputValue] = useState('');
  const [prompt, setPrompt] = useState('');
  const [guess, setGuess] = useState('');
  const [scoreboard, setScoreboard] = useState(Array(players.length).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [guessStatus, setGuessStatus] = useState<GuessStatusRecordKey | null>(null);

  const cleanup = () => {
    setInputValue('');
  };

  useEffect(() => {
    socket.on('prompt', (newPrompt: string) => {
      setPrompt(newPrompt);
      cleanup();
    });

    socket.emit('start');

    return () => {
      socket.off('prompt');
    };
  }, []);

  useEffect(() => {
    const incrementScore = () => {
      setScoreboard(scoreboard.map((value, index) => (
        index === currentPlayer ? value + 1 : value)));
    };

    const decrementScore = () => {
      setScoreboard(scoreboard.map((value, index) => (
        index === currentPlayer ? value - 1 : value)));
    };

    const nextTurn = () => {
      setCurrentPlayer(getNextPlayer(players, currentPlayer));
      cleanup();
    };

    socket.on('success', () => {
      incrementScore();
      setGuessStatus('FOUND');
      nextTurn();
    });

    socket.on('fail', () => {
      decrementScore();
      setGuessStatus('NOT_FOUND');
      nextTurn();
    });

    return () => {
      socket.off('success');
      socket.off('fail');
    };
  }, [scoreboard, currentPlayer]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    setGuess(inputValue);
    socket?.emit('word', inputValue);
  }, [inputValue]);

  return (
    <>
      <div className={className()}>
        <div>{prompt}</div>
        <form onSubmit={handleSubmit}>
          <input
            className={className('input')}
            type="text"
            value={inputValue}
            onChange={handleChange}
          />
          <span
            className={className(
              'word-status',
              { found: guessStatus === 'FOUND' },
            )}
          >
            {guessStatus ? GuessStatusTemplate[guessStatus](guess) : null}
          </span>
        </form>
      </div>
      <div className={className('separator')} />
      <div className={className('players-list')}>
        {players.map((player) => (
          <div
            key={`iamkey-${player}`}
            className={className('player', { active: player === currentPlayer })}
          >
            {`Player ${player}: `}
            <span>
              {scoreboard[player]}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
