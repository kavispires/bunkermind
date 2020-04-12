import React from 'react';
import AvatarGroup from '@material-ui/lab/AvatarGroup';
import Button from '@material-ui/core/Button';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

import floorTopImg from '../images/bunker/floor-top.svg';
import floor1img from '../images/bunker/floor-1.svg';
import floor2img from '../images/bunker/floor-2.svg';
import floor3img from '../images/bunker/floor-3.svg';
import floor4img from '../images/bunker/floor-4.svg';
import floor5img from '../images/bunker/floor-5.svg';
import floor6img from '../images/bunker/floor-6.svg';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';
import { getTurnTypeFlavorText } from '../utils';
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

const Floor = ({ floorNumber, players, blocker = false }) => {
  return (
    <div className={`bunker bunker--${floorNumber}`}>
      {blocker && <span className="bunker-active-blocker"></span>}
      <img
        className="bunker__floor-image"
        src={FLOOR_IMAGE_SOURCE[floorNumber]}
        alt={`floor${floorNumber}`}
      />
      <AvatarGroup className="bunker__avatar-group" max={5}>
        {players.map((player) => (
          <PlayerAvatar key={player.avatar} avatar={player.avatar} />
        ))}
      </AvatarGroup>
    </div>
  );
};

const GameAnnouncement = () => {
  const [game] = useGlobalState('game');
  const [nickname] = useGlobalState('nickname');

  // Split players by their floors
  const floors = Object.values(game.players).reduce(
    (floorsDistribution, player) => {
      const floorNumber = `floor${player.floor}`;
      if (player.nickname === nickname) {
        floorsDistribution[floorNumber] = [player, ...floorsDistribution[floorNumber]];
      } else {
        floorsDistribution[floorNumber].push(player);
      }

      return floorsDistribution;
    },
    {
      floor1: [],
      floor2: [],
      floor3: [],
      floor4: [],
      floor5: [],
      floor6: [],
    }
  );

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
            <h2>Round {game.turn}</h2>
            <p className="bunker-info--flavor-text">
              {getTurnTypeFlavorText(game.turnType, game.turn)}
            </p>
            <p className="bunker-info--turn-type">{TURN_TYPES[game.turnType]}</p>
            <p className="bunker-info--active-player">
              <strong>{gameEngine.activePlayer.nickname}</strong> will choose the question.
            </p>
            <p className="bunker-info--risk-warning">
              If someone is at risk, message will be here.
            </p>
          </div>
        </div>
        {Object.values(floors).map((players, index) => {
          const floorNumber = index + 1;
          return (
            <Floor
              key={floorNumber}
              floorNumber={floorNumber}
              players={players}
              blocker={gameEngine.floorBlockers?.[floorNumber]}
            />
          );
        })}
      </div>
      {!gameEngine.isUserReady ? (
        <div className="action-button">
          <Button
            variant="contained"
            color="primary"
            disabled={gameEngine.isUserReady}
            onClick={() => gameEngine.setUserReady()}
            style={{ background: COLORS.PRIMARY }}
            startIcon={<ThumbUpIcon />}
          >
            {gameEngine.isUserReady ? <DoneOutlineIcon /> : "I'm ready"}
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
            onClick={() => gameEngine.goToQuestionPhase()}
            style={{ background: COLORS.PRIMARY }}
            endIcon={<DoubleArrowIcon />}
          >
            Begin Turn
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameAnnouncement;
