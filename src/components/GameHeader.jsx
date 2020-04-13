import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import IconButton from '@material-ui/core/IconButton';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import AutorenewIcon from '@material-ui/icons/Autorenew';
import BusinessIcon from '@material-ui/icons/Business';
import FavoriteIcon from '@material-ui/icons/Favorite';
import ImportExportIcon from '@material-ui/icons/ImportExport';
import NotListedLocationIcon from '@material-ui/icons/NotListedLocation';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import { COLORS, GAME_PHASES } from '../utils/contants';

import PlayerBadge from './PlayerBadge';

const TurnIcon = ({ turnType }) => {
  switch (turnType) {
    case 1:
    case 2:
    case 3:
      return (
        <div className="game-header__turn-type">
          <span className="game-header__turn-type-number">{turnType}</span> <ArrowUpwardIcon />
        </div>
      );
    case 0:
      return (
        <div className="game-header__turn-type">
          <span className="game-header__turn-type-number">1/1</span> <ImportExportIcon />
        </div>
      );
    default:
      return (
        <div className="game-header__turn-type">
          <NotListedLocationIcon />
        </div>
      );
  }
};

const FloorPosition = ({ floor }) => {
  return (
    <div className="game-header__player-position" title="Your floor positon">
      <BusinessIcon />
      <span className="game-header__player-position-number">{floor}</span>
    </div>
  );
};

const Score = ({ score }) => {
  return (
    <div className="game-header__score" title="Your score this turn">
      <span className="game-header__score-number">{score}</span>
      <FavoriteIcon />
    </div>
  );
};

const Player = ({ player }) => {
  return (
    <div className="game-header__badge">
      <PlayerBadge player={player} />
      <span className="game-header__badge-name">
        <strong>{player.nickname}</strong>, the {player.avatar}
      </span>
      <IconButton className="game-header__refresh" onClick={() => gameEngine.refresh()}>
        <AutorenewIcon />
      </IconButton>
    </div>
  );
};

const GameHeader = () => {
  const [game] = useGlobalState('game');
  const [nickname] = useGlobalState('nickname');

  const currentPlayer = gameEngine.players[nickname];

  if (!currentPlayer) return <div></div>;
  return (
    <AppBar position="static" style={{ background: COLORS.PRIMARY }} className="game-header">
      <Player player={currentPlayer} />
      {(gameEngine.phase === GAME_PHASES.COMPARE || gameEngine.phase === GAME_PHASES.RESULT) && (
        <Score score={currentPlayer.score} />
      )}
      <TurnIcon turnType={game.turnType} />
      <FloorPosition floor={currentPlayer.floor} />
    </AppBar>
  );
};

export default GameHeader;
