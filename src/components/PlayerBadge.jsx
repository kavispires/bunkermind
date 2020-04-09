import React from 'react';
import Badge from '@material-ui/core/Badge';

import { isOnline, randomNumber } from '../utils';
import PlayerAvatar from './PlayerAvatar';

const PlayerBadge = ({ player, showName = false, showOnline = true, isFloating = false }) => {
  const onlineClass = isOnline(player.lastUpdated) ? 'badge--online' : 'badge--offline';

  const floatingClass = isFloating ? `floating-animation--${randomNumber(1, 5)}` : '';
  return (
    <div className={`badge-container ${floatingClass}`}>
      <Badge
        color="secondary"
        overlap="circle"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        variant="dot"
        className={`badge ${onlineClass}`}
      >
        <PlayerAvatar avatar={player.avatar} />
      </Badge>
      {showName && <span className="badge-name">{player.nickname}</span>}
    </div>
  );
};

export default PlayerBadge;
