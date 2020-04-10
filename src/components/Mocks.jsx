import React, { Fragment } from 'react';
import Button from '@material-ui/core/Button';

import gameEngine from '../engine';

const Mocks = ({ avatar }) => {
  return (
    <Fragment>
      {process.env.NODE_ENV === 'development' && (
        <div className="mock-buttons">
          <Button
            variant="contained"
            size="small"
            onClick={() => gameEngine.mock('waiting.incomplete')}
          >
            Waiting 2 people
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => gameEngine.mock('waiting.sufficient')}
          >
            Waiting 4 people
          </Button>
          <Button variant="contained" size="small" onClick={() => gameEngine.mock('waiting.full')}>
            Waiting 12 people
          </Button>
          <Button variant="contained" size="small" onClick={() => gameEngine.mock('announcement')}>
            Announcement 12
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => gameEngine.mock('announcement.ready')}
          >
            Announcement 12 Ready
          </Button>
        </div>
      )}
    </Fragment>
  );
};

export default Mocks;
