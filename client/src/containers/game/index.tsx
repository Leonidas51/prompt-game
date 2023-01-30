import React, { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { cn } from '@bem-react/classname';

const className = cn('game');

const GuessStatusRecord = Object.freeze({
  NOT_FOUND: (guess: string) => `Word "${guess}" was not found`,
  FOUND: (guess: string) => `Hooray! Word "${guess}" found`,
});

type GuessStatusRecordKey = keyof typeof GuessStatusRecord;

const players = [0, 1, 2];

function getNextPlayer(items: number[], currentItem: number): number {
  // eslint-disable-next-line no-plusplus
  return ++currentItem % items.length;
}

export const Game = () => {
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [prompt, setPrompt] = useState('');
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(Array(players.length).fill(0));
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [guessStatus, setGuessStatus] = useState<GuessStatusRecordKey | null>(null);

  const cleanup = () => {
    setInputValue('');
  };

  useEffect(() => {
    const incrementScore = () => {
      setScore(score.map((value, index) => (index === currentPlayer ? value + 1 : value)));
    };

    const decrementScore = () => {
      setScore(score.map((value, index) => (index === currentPlayer ? value - 1 : value)));
    };

    const setNextPlayer = () => {
      setCurrentPlayer((getNextPlayer(players, currentPlayer)));
    };

    const nextTurn = () => {
      setNextPlayer();
      cleanup();
    };

    const socketConnect = io('localhost:3000');
    socketConnect.on('prompt', (newPrompt: string) => {
      setPrompt(newPrompt);
      cleanup();
    });

    socketConnect.on('success', () => {
      incrementScore();
      setGuessStatus('FOUND');
      nextTurn();
    });

    socketConnect.on('fail', () => {
      decrementScore();
      setGuessStatus('NOT_FOUND');
      nextTurn();
    });

    setSocket(socketConnect);
    socketConnect.emit('start');
  }, [currentPlayer, score]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    setGuess(inputValue);
    socket?.emit('word', inputValue);
  }, [socket, inputValue]);

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
          <span className={`word-status ${guessStatus === 'FOUND' ? 'found' : ''}`}>
            {guessStatus ? GuessStatusRecord[guessStatus](guess) : null}
          </span>
        </form>
      </div>
      <div className="separator" />
      <div id="players-list">
        {players.map((player) => (
          <div className={player === currentPlayer ? 'active' : ''}>
            {`Player ${player}: `}
            <span>
              {score[player]}
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
