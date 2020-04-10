import React from 'react';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import GameHeader from './GameHeader';

const GameQuestion = () => {
  // const [game] = useGlobalState('game');
  const [nickname] = useGlobalState('nickname');

  const currentPlayer = gameEngine.players[nickname];

  if (!currentPlayer) return <div></div>;
  return (
    <div className="game game-container game-announcement">
      <GameHeader />
    </div>
  );
};

export default GameQuestion;
