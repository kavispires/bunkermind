import React from 'react';
import Container from '@material-ui/core/Container';
import LinearProgress from '@material-ui/core/LinearProgress';

import useGlobalState from '../useGlobalState';
import { SCREENS } from '../utils/contants';

import Home from './Home';
import WaitingRoom from './WaitingRoom';

const Screen = () => {
  const [screen] = useGlobalState('screen');

  switch (screen) {
    case SCREENS.WAITINGROOM:
      return <WaitingRoom />;
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
    </Container>
  );
};

export default App;
