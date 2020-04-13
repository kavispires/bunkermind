import { createGlobalState } from 'react-hooks-global-state';

import GameEngine from './engine';

import { SCREENS } from './utils/contants';

const initialState = {
  dbRef: null,
  game: GameEngine.state,
  gameID: null,
  isLoading: false,
  nickname: null,
  screen: SCREENS.HOME,
  toast: {
    isVisible: false,
    message: '',
  },
  lastUpdatedAt: Date.now(),
};

const { useGlobalState } = createGlobalState(initialState);

export default useGlobalState;
