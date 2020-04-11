import React, { Fragment, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import TextField from '@material-ui/core/TextField';

import logo from '../images/bunker-mind-logo.svg';

import API from '../firebase';
import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import { generateID } from '../utils';
import { COLORS, SCREENS } from '../utils/contants';
import localStorageService from '../utils/localStorage';
import toastService from '../utils/toastService';

const Home = () => {
  // Local Storage State
  const [lsGameID, lsNickname] = localStorageService.getDefaults();
  // Global States
  const [gameID, setGameID] = useGlobalState('gameID');
  const [isLoading, setIsLoading] = useGlobalState('isLoading');
  const [nickname, setNickname] = useGlobalState('nickname');
  const [, setScreen] = useGlobalState('screen');
  const [toast, setToast] = useGlobalState('toast');
  // Local States
  const [errorGameID, setErrorGameID] = useState('');
  const [isCreatingGame, setIsCreatingGame] = useState(false);
  const [isValidGameID, setIsValidGameID] = useState(false);
  const [isValidNickname, setIsValidNickname] = useState(false);
  const [tempGameID, setTempGameID] = useState(lsGameID);
  const [tempNickname, setTempNickname] = useState(lsNickname);
  const [showCreateGame, setShowCreateGame] = useState(0);

  // On Mount
  useEffect(() => {
    if (tempNickname) {
      setNickname(tempNickname);
    }
  });

  // On Update
  useEffect(() => {
    // Check if game exists
    if (gameID !== tempGameID && tempGameID?.length === 4) {
      setIsLoading(true);

      API.ref()
        .child('bunkermind')
        .child(tempGameID.toUpperCase())
        .once('value', (snap) => {
          if (snap.val()) {
            setGameID(tempGameID.toUpperCase());
            setIsValidGameID(true);
            setErrorGameID('');
          } else {
            setErrorGameID('Provided Game ID does not exist. Try again.');
            setIsValidGameID(false);
          }
          setIsLoading(false);
        });
    }

    if (tempGameID?.length < 4) {
      setIsValidGameID(false);
    }

    if (tempGameID === gameID) {
      setIsValidGameID(true);
      setErrorGameID('');
    }

    // Check if nickname is valid
    if (nickname?.length >= 3 || tempNickname?.length >= 3) {
      setNickname(tempNickname || nickname);
      setIsValidNickname(true);
    } else {
      setIsValidNickname(false);
    }
  }, [
    gameID,
    tempGameID,
    setGameID,
    setIsValidGameID,
    setIsLoading,
    nickname,
    setIsValidNickname,
    setNickname,
    tempNickname,
  ]);

  const goToWaitingRoom = () => {
    localStorageService.setDefaults(gameID, nickname);
    setScreen(SCREENS.GAME);
  };

  const createGameSecret = () => {
    setShowCreateGame(showCreateGame + 1);
  };

  const createGame = () => {
    setIsLoading(true);
    setIsCreatingGame(true);
    const id = generateID();
    const state = gameEngine.init(id);

    try {
      API.ref()
        .child('bunkermind')
        .update({
          [id]: {
            ...state,
          },
        });
      setTempGameID(id);
      setToast(toastService.success(toast, `Game created successfully. ID: ${id}`));
    } catch {
      setToast(toastService.error(toast, 'Creating game has failed'));
    } finally {
      setIsLoading(false);
      setIsCreatingGame(false);
    }
  };

  return (
    <div className="home">
      {/* <button className="btn-invisible" onClick={() => createGameSecret()}> */}
      <img
        className="home__logo"
        src={logo}
        alt="Bunker Mind logo"
        onClick={() => createGameSecret()}
      />
      {/* </button> */}
      <div className="home-section join-game">
        <TextField
          className="mui-full-width"
          required
          id="game-id"
          label="Game ID"
          value={tempGameID}
          onChange={(e) => setTempGameID(e.target.value)}
          helperText={errorGameID}
          inputProps={{ maxLength: '4', autoComplete: 'off' }}
        />
        <TextField
          className="mui-full-width"
          required
          id="nickname"
          label="Nickname"
          defaultValue={tempNickname}
          onChange={(e) => setTempNickname(e.target.value)}
          inputProps={{ maxLength: '10', autoComplete: 'off' }}
          helperText={
            nickname && !isValidNickname ? 'Nickname must be at least 3 characters long.' : ''
          }
        />

        <div>{isLoading && <LinearProgress style={{ background: COLORS.PRIMARY }} />}</div>

        <Button
          className="mui-block"
          variant="contained"
          color="primary"
          disabled={!isValidNickname || !isValidGameID}
          onClick={() => goToWaitingRoom()}
          style={{ background: COLORS.PRIMARY }}
        >
          Join {gameID}
        </Button>
        {showCreateGame > 3 && (
          <Fragment>
            <div className="home-section home-section--separator">- or -</div>
            <div className="home-section create-game">
              <Button
                className="block"
                variant="contained"
                color="default"
                disabled={isCreatingGame}
                onClick={() => createGame()}
              >
                Create a Game
              </Button>
            </div>
          </Fragment>
        )}
      </div>
    </div>
  );
};

export default Home;
