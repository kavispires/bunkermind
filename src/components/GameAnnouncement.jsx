import React, { useEffect } from 'react';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import GameHeader from './GameHeader';

const GameAnnouncement = () => {
  return (
    <div className="game game-container game-announcement">
      <GameHeader />
      <div className="game-announcement__content">Here comes the content</div>
    </div>
  );
};

export default GameAnnouncement;
