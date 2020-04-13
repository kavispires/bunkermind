import React from 'react';
import Chip from '@material-ui/core/Chip';
import LockIcon from '@material-ui/icons/Lock';
import PublishIcon from '@material-ui/icons/Publish';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import CloseIcon from '@material-ui/icons/Close';

import gameEngine from '../engine';
import { COLORS, NOOP } from '../utils/contants';

import PlayerAvatar from './PlayerAvatar';

const getChipTypeOptions = (type, answerId, currentUser, downvotes) => {
  switch (type) {
    case 'add':
      return {
        clickAction: () => gameEngine.addMatch(answerId, currentUser),
        deleteAction: () => gameEngine.addMatch(answerId, currentUser),
        deleteIcon: <PublishIcon />,
        chickable: true,
      };
    case 'locked':
      return {
        clickAction: NOOP,
        deleteAction: NOOP,
        deleteIcon: <LockIcon />,
        chickable: false,
      };
    case 'mine':
      return {
        clickAction: null,
        deleteAction: () => gameEngine.removeMatch(answerId, currentUser),
        deleteIcon: <CloseIcon />,
        chickable: null,
      };
    case 'votable':
      const didIVote = downvotes[currentUser] ? { color: COLORS.RED } : null;
      return {
        clickAction: null,
        deleteAction: () => gameEngine.voteForAnswer(answerId, currentUser),
        deleteIcon: <ThumbDownIcon style={didIVote} />,
        chickable: null,
      };

    default:
      return {
        clickAction: null,
        deleteAction: null,
        deleteIcon: null,
        chickable: null,
      };
  }
};

const AnswerChip = ({ answer, avatar, type, answerId, currentUser, downvotes }) => {
  const options = getChipTypeOptions(type, answerId, currentUser, downvotes);

  return (
    <Chip
      avatar={<PlayerAvatar avatar={avatar} />}
      label={answer}
      onClick={options.clickAction}
      onDelete={options.deleteAction}
      deleteIcon={options.deleteIcon}
      clickable={options.clickable}
      className="answer-chip"
    />
  );
};

export default AnswerChip;
