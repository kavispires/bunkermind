import React from 'react';
import GavelIcon from '@material-ui/icons/Gavel';
import Button from '@material-ui/core/Button';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import { COLORS, LOSER_FLAVOR_TEXT, SCREENS } from '../utils/contants';
import localStorageService from '../utils/localStorage';

const GameOver = () => {
  // Global States
  const [, setGameID] = useGlobalState('gameID');
  const [, setScreen] = useGlobalState('screen');

  const goHome = () => {
    localStorageService.resetGameID();
    setScreen(SCREENS.HOME);
    setGameID('null');
  };

  return (
    <div className="game game-container game-game-over">
      <div className="game-game-over__icon">
        <GavelIcon fontSize="large" />
      </div>
      <h2>Game Over</h2>

      <h3>After they left the bunker, this is what happened:</h3>
      <ul className="game-game-over__results">
        {gameEngine.losers.map((player, index) => {
          const key = `${player.name}-${index}`;
          return (
            <li key={key}>
              {player.name} {LOSER_FLAVOR_TEXT[player.flavorTextID]}.
            </li>
          );
        })}
      </ul>

      <h3>Good Game!</h3>

      <div className="action-button">
        <Button
          variant="contained"
          color="primary"
          onClick={() => goHome()}
          style={{ background: COLORS.PRIMARY }}
        >
          Home
        </Button>
      </div>

      {gameEngine.user?.isAdmin && (
        <div className="game-admin-actions">
          <Button
            variant="contained"
            color="primary"
            onClick={() => gameEngine.deleteGame()}
            style={{ background: COLORS.PRIMARY }}
          >
            Delete Game
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameOver;
