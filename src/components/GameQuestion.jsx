import React from 'react';

import gameEngine from '../engine';

import GameHeader from './GameHeader';
import GameQuestionSelection from './GameQuestionSelection';
import GameQuestionWaiting from './GameQuestionWaiting';

const GameQuestion = () => {
  return (
    <div className="game game-container game-question">
      <GameHeader />
      {gameEngine.isUserActivePlayer ? <GameQuestionSelection /> : <GameQuestionWaiting />}
    </div>
  );
};

export default GameQuestion;
