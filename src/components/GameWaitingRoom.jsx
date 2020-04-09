import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import LockIcon from '@material-ui/icons/Lock';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import { SCREENS, COLORS } from '../utils/contants';
import toastService from '../utils/toastService';

import PlayerBadge from './PlayerBadge';

let timeoutID = null;

const GameWaitingRoom = () => {
  // Global States
  const [dbRef] = useGlobalState('dbRef');
  const [game] = useGlobalState('game');
  const [, setGameID] = useGlobalState('gameID');
  const [nickname] = useGlobalState('nickname');
  const [, setScreen] = useGlobalState('screen');
  const [toast, setToast] = useGlobalState('toast');

  // Set your nickname on mount
  useEffect(() => {
    if (dbRef && !timeoutID) {
      timeoutID = setTimeout(() => {
        console.log('TIMEOUT');
        try {
          if (!gameEngine.amISet) {
            gameEngine.setPlayer(nickname);
          }
        } catch (err) {
          console.error(err);
          setToast(toastService.error(toast, 'Game is full, try a different game ID'));
          setGameID(null);
          setScreen(SCREENS.HOME);
        } finally {
          clearTimeout(timeoutID);
        }
      }, 1000);
    }
  }, [dbRef, nickname, setGameID, setScreen, setToast, toast, game]);

  const lockAndStartGame = () => {
    console.log('HEY');
  };

  return (
    <div className="game game-waiting-room">
      <header className="game-waiting-room__title">
        <HourglassEmptyIcon />
        <h1>Waiting Room</h1>
      </header>
      <main>
        <p>
          The pandemic got us all in this bunker! But resources are scarce and soon that won't be
          enough for all of us. Some heard that we are on our last toilet paper roll! As a group, we
          decided that why to bother with being inclusive and welcoming when we can keep only the
          ones that think like us?
        </p>
        <p>
          The goal of the game is to match answers and think like the group. Each turn one player
          will choose a question and each person secretly answers it. For example: What are 3
          colors?
        </p>
        <p>
          You want your answer match to as many people's answers as possible because you get a point
          for every match, including your own (so make sure to write something for everything!)
        </p>
        <p>
          <b>Are you with us or against us? Do you have the bunker mind?</b>
        </p>
      </main>

      <CircularProgress style={{ color: COLORS.PRIMARY }} className="game-waiting-room__spinner" />
      <div className="game-waiting-room__line">
        {Object.values(game.players).map((player, index) => (
          <PlayerBadge
            key={player.nickname}
            player={player}
            showName
            orderNumber={index}
            isFloating
          />
        ))}
      </div>
      <div className="game-waiting-room__actions">
        <Button
          variant="contained"
          color="primary"
          disabled={false}
          onClick={() => lockAndStartGame()}
          style={{ background: COLORS.PRIMARY }}
          startIcon={<LockIcon />}
        >
          Lock and Start Game
        </Button>
      </div>
    </div>
  );
};

export default GameWaitingRoom;
