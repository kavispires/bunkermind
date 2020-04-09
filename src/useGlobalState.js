import { createGlobalState } from 'react-hooks-global-state';

import GameEngine from './engine';

import { GAME_SCREENS, SCREENS } from './utils/contants';

const initialState = {
  dbRef: null,
  game: GameEngine.state,
  gameID: null,
  gameScreen: GAME_SCREENS.WAITING_ROOM,
  isLoading: false,
  nickname: null,
  screen: SCREENS.HOME,
  toast: {
    isVisible: false,
    message: '',
  },
};

const { useGlobalState } = createGlobalState(initialState);

export default useGlobalState;
