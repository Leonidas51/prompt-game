import React, { useCallback, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { cn } from '@bem-react/classname';

const className = cn('game');

export const Game = () => {
  const [inputValue, setInputValue] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [prompt, setPrompt] = useState('');

  useEffect(() => {
    const socketConnect = io('localhost:3000');
    socketConnect.on('prompt', (newPrompt: string) => {
      setPrompt(newPrompt);
      setInputValue('');
    });

    setSocket(socketConnect);
    socketConnect.emit('start');
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();

    socket?.emit('word', inputValue);
  }, [socket, inputValue]);

  return (
    <div className={className()}>
      <div>{prompt}</div>
      <form onSubmit={handleSubmit}>
        <input
          className={className('input')}
          type="text"
          value={inputValue}
          onChange={handleChange}
        />
      </form>
    </div>
  );
};
