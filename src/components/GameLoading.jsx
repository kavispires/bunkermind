import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import { COLORS } from '../utils/contants';

const GameLoading = () => {
  return (
    <div className="game game-loading">
      <CircularProgress style={{ color: COLORS.PRIMARY, fontSize: 60 }} />
    </div>
  );
};

export default GameLoading;
