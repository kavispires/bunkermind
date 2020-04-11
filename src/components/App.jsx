import React from 'react';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';

import useGlobalState from '../useGlobalState';
import { SCREENS } from '../utils/contants';

import Home from './Home';
import Toast from './Toast';
import Game from './Game';
import Mocks from './Mocks';

const Screen = () => {
  const [screen] = useGlobalState('screen');

  switch (screen) {
    case SCREENS.GAME:
      return <Game />;
    default:
      return <Home />;
  }
};

const App = () => {
  // Global States
  const [isLoading] = useGlobalState('isLoading');

  return (
    <Container maxWidth="lg" className="app-container">
      {isLoading ? <LinearProgress /> : <div className="progress-bar-placeholder" />}
      <Screen />
      <Toast />
      <Mocks />
      <span className="release-number">v0.5</span>
    </Container>
  );
};

export default App;
