import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CreateIcon from '@material-ui/icons/Create';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import LooksOneIcon from '@material-ui/icons/LooksOne';
import LooksTwoIcon from '@material-ui/icons/LooksTwo';
import LooksThreeIcon from '@material-ui/icons/Looks3';
import LooksFourIcon from '@material-ui/icons/Looks4';
import LooksFiveIcon from '@material-ui/icons/Looks5';

import gameEngine from '../engine';

import { getQuestion } from '../utils';
import { COLORS } from '../utils/contants';

import GameHeader from './GameHeader';

const ANSWER_ICONS = {
  0: <LooksOneIcon fontSize="large" />,
  1: <LooksTwoIcon fontSize="large" />,
  2: <LooksThreeIcon fontSize="large" />,
  3: <LooksFourIcon fontSize="large" />,
  4: <LooksFiveIcon fontSize="large" />,
};

const GameAnswer = () => {
  // Local States
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [areAnswersValid, setAreAnswersValid] = useState(false);

  // Get questions on mount
  useEffect(() => {
    const gotQuestion = getQuestion(gameEngine.currentQuestionID);
    setCurrentQuestion(gotQuestion);
    setAnswers(new Array(gotQuestion.answers).fill(''));
  }, [setCurrentQuestion, setAnswers]);

  useEffect(() => {
    if (!answers.every((answer) => Boolean(answer))) {
      setAreAnswersValid(false);
    } else {
      setAreAnswersValid(answers.length === new Set(answers).size);
    }
  }, [answers]);

  const updateAnswer = (value, answerIndex) => {
    const newAnswers = [...answers];
    newAnswers[answerIndex] = value;
    setAnswers(newAnswers);
  };

  return (
    <div className="game-game game-container game-answer">
      <GameHeader />
      <div className="game-answer__icon">
        <CreateIcon fontSize="large" />
      </div>
      <h2>Answer Time!</h2>
      <h3 className="game-answer__current-question">{currentQuestion?.question}</h3>
      {answers.map((answer, index) => {
        const answerNumber = `answer-${index + 1}`;
        const answerLabel = `Answer ${index + 1}`;
        return (
          <div className="game-answer__answers" key={answerNumber}>
            {ANSWER_ICONS[index]}
            <TextField
              id={answerNumber}
              label={answerLabel}
              variant="outlined"
              className="answer-input-field"
              onChange={(e) => updateAnswer(e.target.value, index)}
            />
          </div>
        );
      })}
      <div className="action-button">
        <span className="action-button__warning">
          You must write all the answers and they must be different from each other to be able to
          submit.
        </span>
        <Button
          variant="contained"
          color="primary"
          disabled={!areAnswersValid || gameEngine.isUserReady}
          onClick={() => gameEngine.submitAnswers(answers)}
          style={{ background: COLORS.PRIMARY }}
        >
          Submit Answers
        </Button>
      </div>
      {gameEngine?.me?.isAdmin && (
        <div className="game-admin-actions">
          <span className="game-admin-actions__warning">
            This action should be automatic. Only use the button if the next phase fails to trigger
            after everybody is ready.
          </span>
          <Button
            variant="contained"
            color="primary"
            disabled={!gameEngine.isEveryoneReady}
            onClick={() => gameEngine.goToComparePhase()}
            style={{ background: COLORS.PRIMARY }}
            endIcon={<DoubleArrowIcon />}
          >
            Next Phase: Compare
          </Button>
        </div>
      )}
    </div>
  );
};

export default GameAnswer;
