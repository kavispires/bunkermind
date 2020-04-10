import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
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
          setToast(toastService.error(toast, err));
          setGameID(null);
          setScreen(SCREENS.HOME);
        } finally {
          clearTimeout(timeoutID);
        }
      }, 1000);
    }
  }, [dbRef, nickname, setGameID, setScreen, setToast, toast, game]);

  return (
    <div className="game game-waiting-room">
      <header className="game-waiting-room__title">
        <CircularProgress style={{ color: COLORS.PRIMARY }} />
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
          Every round a number of people will move up (BAD!) or move down (rare, but it could
          happen). The important thing to remember is that the lowest scores move, so whoever is
          tied in points move together (but points reset for every question). If you ever go above
          the 1st floor. You lose the game!
        </p>
        <p>
          <b>Are you with us or against us? Do you have the bunker mind?</b>
        </p>
      </main>
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
      {gameEngine?.me?.isAdmin && (
        <fieldset className="game-admin-actions">
          <legend>Admin Actions</legend>
          <Button
            variant="contained"
            color="primary"
            disabled={!gameEngine.isEveryoneOnline || Object.keys(game.players).length < 3}
            onClick={() => gameEngine.lockAndStart()}
            style={{ background: COLORS.PRIMARY }}
            startIcon={<LockIcon />}
          >
            Lock and Start Game
          </Button>
        </fieldset>
      )}
    </div>
  );
};

export default GameWaitingRoom;
