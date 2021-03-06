import React, { Fragment, useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import DoneOutlineIcon from '@material-ui/icons/DoneOutline';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';

import gameEngine from '../engine';
import useGlobalState from '../useGlobalState';

import { getQuestion } from '../utils';
import { COLORS } from '../utils/contants';

import GameHeader from './GameHeader';
import AnswerChip from './AnswerChip';

const GameCompare = () => {
  // Global States
  const [nickname] = useGlobalState('nickname');
  // Local States
  const [currentQuestion, setCurrentQuestion] = useState(null);

  // Get questions on mount
  useEffect(() => {
    const gotQuestion = getQuestion(gameEngine.currentQuestionID);
    setCurrentQuestion(gotQuestion);
  }, [setCurrentQuestion]);

  return (
    <div className="game-game game-container game-compare">
      <GameHeader />
      {gameEngine.compare ? (
        <Fragment>
          <div className="game-compare__icon">
            <QuestionAnswerIcon fontSize="large" />
          </div>
          <h2>Compare Answers ({gameEngine.answersSet.length + 1} left)</h2>
          <h3 className="game-compare__current-question">{currentQuestion?.question}</h3>

          <div className="game-compare__accepted-answers">
            <div className="game-compare__current-answer">{gameEngine.compare.currentAnswer}</div>
            <div className="game-compare__accepted-chips">
              {gameEngine?.compare?.matches &&
                Object.entries(gameEngine.compare.matches).map(([nicknameKey, answerObj]) => {
                  const key = `matched-answer-${nicknameKey}`;

                  let type = 'votable';
                  if (answerObj.isLocked) {
                    type = 'locked';
                  } else if (nicknameKey === nickname) {
                    type = 'mine';
                  }

                  return (
                    <AnswerChip
                      key={key}
                      type={type}
                      answer={answerObj.answer}
                      avatar={gameEngine.getPlayerAvatar(nicknameKey)}
                      answerId={type === 'votable' ? nicknameKey : answerObj.answerId}
                      currentUser={nickname}
                      downvotes={answerObj?.downvotes}
                    />
                  );
                })}
            </div>
          </div>
          <ul className="game-compare__instructions">
            <li>Locked answered above are exact matches and can't be changed.</li>
            <li>
              If you disagree with someone's answer, you can click on the Thumbs Down icon, if
              available.
            </li>
            <li>If you believe one of your answers below, click to add it to the pool:</li>
          </ul>
          <div className="game-compare__answers-chips">
            {Object.entries(gameEngine.userAnswers).map(([answerId, answerObj]) => {
              if (!answerObj.isMatch) {
                return (
                  <AnswerChip
                    key={answerId}
                    type={Boolean(gameEngine.userCompareMatchingAnswer) ? 'none' : 'add'}
                    answer={answerObj.text}
                    avatar={gameEngine.getPlayerAvatar(nickname)}
                    answerId={answerId}
                    currentUser={nickname}
                  />
                );
              }
              return <span key={answerId}></span>;
            })}
          </div>

          <div className="action-button">
            <Button
              variant="contained"
              color="primary"
              disabled={gameEngine.isUserReady}
              onClick={() => gameEngine.doneComparing()}
              style={{ background: COLORS.PRIMARY }}
            >
              {gameEngine.isUserReady ? <DoneOutlineIcon /> : 'Done'}
            </Button>
          </div>
        </Fragment>
      ) : (
        <div className="game-compare-loading">
          <CircularProgress style={{ color: COLORS.PRIMARY }} />
          <p>Loading or something's wrong. I'm not sure</p>
        </div>
      )}
    </div>
  );
};

export default GameCompare;
