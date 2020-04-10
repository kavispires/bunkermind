import React, { useEffect } from 'react';

import API from '../firebase';
import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import { GAME_PHASES, SCREENS } from '../utils/contants';
import toastService from '../utils/toastService';

import GameWaitingRoom from './GameWaitingRoom';
import GameAnnouncement from './GameAnnouncement';
import GameQuestion from './GameQuestion';
import GameAnswer from './GameAnswer';

const GameScreen = () => {
  const [game] = useGlobalState('game');

  switch (game.phase) {
    case GAME_PHASES.WAITING_ROOM:
      return <GameWaitingRoom />;
    case GAME_PHASES.ANNOUNCEMENT:
      return <GameAnnouncement />;
    case GAME_PHASES.QUESTION:
      return <GameQuestion />;
    case GAME_PHASES.ANSWER:
      return <GameAnswer />;
    default:
      return <GameWaitingRoom />;
  }
};

const Game = () => {
  // Global States
  const [dbRef, setDbRef] = useGlobalState('dbRef');
  const [game, setGame] = useGlobalState('game');
  const [gameID, setGameID] = useGlobalState('gameID');
  const [, setIsLoading] = useGlobalState('isLoading');
  const [, setScreen] = useGlobalState('screen');
  const [toast, setToast] = useGlobalState('toast');

  // Create database reference
  useEffect(() => {
    if (game.gameID === null && gameID) {
      setIsLoading(true);

      API.ref()
        .child('bunkermind')
        .child(gameID)
        .once('value', (snap) => {
          if (snap.val()) {
            const firebaseReference = API.ref().child('bunkermind').child(gameID);
            gameEngine.setGameID(gameID);
            setDbRef(gameEngine.setDbRef(firebaseReference));
            setGame(gameEngine.update(snap.val()));
          } else {
            setGameID(null);
            gameEngine.setGameID(null);
            setToast(toastService.error(toast, 'Failed to start game session'));
            setScreen(SCREENS.HOME);
          }

          setGame(gameEngine.state);
          setIsLoading(false);
        });
    }
  }, [game.gameID, gameID, setDbRef, setGame, setGameID, setIsLoading, setScreen, setToast, toast]);

  useEffect(() => {
    if (dbRef) {
      const handleGameState = (snap) => {
        setIsLoading(true);
        if (snap.val()) {
          setGame(gameEngine.update(snap.val()));
        }
        setIsLoading(false);
      };

      dbRef.on('value', handleGameState);

      const handleGameDisconnect = (snap) => {
        setIsLoading(false);
        setToast(toastService.info(toast, 'Server disconnected'));
        setScreen(SCREENS.HOME);
      };

      return () => {
        dbRef.off('value', handleGameDisconnect);
      };
    }
  }, [dbRef, setGame, setIsLoading, setScreen, setToast, toast]);

  return <GameScreen />;
};

export default Game;
