import { createGlobalState } from 'react-hooks-global-state';

import GameEngine from './engine';

const initialState = {
  dbRef: null,
  game: GameEngine.state,
  gameID: null,
  isLoading: false,
  screen: null,
};

const { useGlobalState } = createGlobalState(initialState);

export default useGlobalState;
