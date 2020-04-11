import React, { useEffect, useState } from 'react';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import LiveHelpIcon from '@material-ui/icons/LiveHelp';
import MailIcon from '@material-ui/icons/Mail';

import gameEngine from '../engine';

import { getUniqueQuestions } from '../utils';
import { COLORS } from '../utils/contants';

const GameQuestionSelection = () => {
  // Local States
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // Get questions on mount
  useEffect(() => {
    setQuestions(getUniqueQuestions(gameEngine.usedQuestions));
  }, [setQuestions]);

  const chooseQuestion = (event) => {
    setSelectedQuestion(event.target.value);
  };

  return (
    <div className="game-question-selection">
      <div className="game-question-selection__icon">
        <LiveHelpIcon fontSize="large" />
      </div>
      <h2 className="game-question-selection__title">
        {gameEngine.activePlayer.nickname}, it's time to select a question!
      </h2>
      <p>
        Keep in mind that you want a question that you are able to answer and will give you most
        matching answer with other players. And don't take too long, other players are waiting
      </p>
      <RadioGroup
        aria-label="question"
        name="question"
        value={selectedQuestion}
        onChange={chooseQuestion}
      >
        {questions.map((question) => (
          <FormControlLabel
            key={question.id}
            className="game-question-selection__question"
            value={question.id}
            control={<Radio style={{ color: COLORS.PRIMARY }} />}
            label={question.question}
          />
        ))}
      </RadioGroup>
      <div className="action-button">
        <Button
          variant="contained"
          color="primary"
          disabled={!selectedQuestion}
          onClick={() => gameEngine.goToAnswerPhase(selectedQuestion)}
          style={{ background: COLORS.PRIMARY }}
          endIcon={<MailIcon />}
        >
          Next Phase
        </Button>
      </div>
    </div>
  );
};

export default GameQuestionSelection;
