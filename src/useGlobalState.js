import { createGlobalState } from 'react-hooks-global-state';

import GameEngine from './engine';

const initialState = {
  dbRef: null,
  game: GameEngine.state,
  gameID: null,
  isLoading: false,
  nickname: null,
  screen: null,
  toast: {
    isVisible: false,
    message: '',
  },
};

const { useGlobalState } = createGlobalState(initialState);

export default useGlobalState;
