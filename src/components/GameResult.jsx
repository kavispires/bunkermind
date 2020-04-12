import React from 'react';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Button from '@material-ui/core/Button';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';

import floorTopImg from '../images/bunker/floor-top.svg';
import floor1img from '../images/bunker/floor-1.svg';
import floor2img from '../images/bunker/floor-2.svg';
import floor3img from '../images/bunker/floor-3.svg';
import floor4img from '../images/bunker/floor-4.svg';
import floor5img from '../images/bunker/floor-5.svg';
import floor6img from '../images/bunker/floor-6.svg';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';
import { COLORS, TURN_TYPES } from '../utils/contants';

import GameHeader from './GameHeader';
import PlayerAvatar from './PlayerAvatar';
import PlayerBadge from './PlayerBadge';

const FLOOR_IMAGE_SOURCE = {
  1: floor1img,
  2: floor2img,
  3: floor3img,
  4: floor4img,
  5: floor5img,
  6: floor6img,
};

const MOVE_ANIMATION_CLASS = {
  MOVE_UP: 'move-animation--up',
  MOVE_DOWN: 'move-animation--down',
  SAVE: 'move-animation--save',
  STAY: 'move-animation--stay',
  GAME_OVER: 'move-animation--game-over',
};

const FloorAnimated = ({ floorNumber, players }) => {
  return (
    <div className="bunker bunker--2">
      <img
        className="bunker__floor-image"
        src={FLOOR_IMAGE_SOURCE[floorNumber]}
        alt={`floor${floorNumber}`}
      />
      <AvatarGroup className="bunker__avatar-group" max={7}>
        {players.map((player) => (
          <PlayerAvatar
            key={player.name}
            avatar={gameEngine.getPlayerAvatar(player.name)}
            classNames={MOVE_ANIMATION_CLASS[player.action]}
          />
        ))}
      </AvatarGroup>
    </div>
  );
};

const GameResult = () => {
  const [game] = useGlobalState('game');

  return (
    <div className="game game-container game-announcement">
      <GameHeader />
      <div className="game-announcement__content">
        <div className="bunker bunker--top">
          <img
            className="bunker__floor-image bunker__floor-image--top"
            src={floorTopImg}
            alt="bunker-top-floor"
          />
          <div className="bunker__info-container">
            <h2>Round {game.turn} Results</h2>
            <p className="bunker-info--turn-type">{TURN_TYPES[game.turnType]}</p>
          </div>
        </div>
        {Object.values(gameEngine.orderedResults).map((players, index) => {
          const floorNumber = index + 1;
          return <FloorAnimated key={floorNumber} floorNumber={floorNumber} players={players} />;
        })}
      </div>
      {!gameEngine.isUserReady ? (
        <div className="action-button">
          <Button
            variant="contained"
            color="primary"
            disabled={gameEngine.isUserReady}
            onClick={() => gameEngine.doSomething()}
            style={{ background: COLORS.PRIMARY }}
          >
            {gameEngine.isUserReady ? <DoneOutlineIcon /> : 'OK'}
          </Button>
        </div>
      ) : (
        <div className="action-button">
          <h3>Waiting for all players to be ready</h3>
          {gameEngine.whosReady?.length && (
            <div className="whos-ready-line">
              {gameEngine.whosReady.map((player, index) => (
                <PlayerBadge
                  key={player.nickname}
                  player={player}
                  showName
                  orderNumber={index}
                  isFloating
                />
              ))}
            </div>
          )}
        </div>
      )}
      {gameEngine.user?.isAdmin && (
        <div className="game-admin-actions">
          <Button
            variant="contained"
            color="primary"
            disabled={!gameEngine.isEveryoneReady}
            onClick={() => gameEngine.startNewTurn()}
            style={{ background: COLORS.PRIMARY }}
            endIcon={<DoubleArrowIcon />}
          >
            New Round
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameResult;
