import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

import gameEngine from '../engine';

import { COLORS } from '../utils/contants';

const GameQuestionWaiting = () => {
  return (
    <div className="game-question-waiting">
      <h1>Sit tight!</h1>
      <h2>{gameEngine.activePlayer.nickname} is choosing a question!</h2>
      <div className="game-question-waiting__spinner">
        <CircularProgress style={{ color: COLORS.PRIMARY }} />
      </div>
      <h3>In the meantime, review the rules:</h3>
      <ul className="game-question-waiting__rules">
        <li>The goal is not to be correct, it's to match!</li>
        <li>You are trying to match answers with as many people as possible.</li>
        <li>
          <strong className="tip--ok">OK</strong> Typos are forgiving
        </li>
        <li>
          <strong className="tip--not-ok">NOT OK</strong> Specific vs General: Lassie &#8800;
          Collie; Truck &#8800; Red Truck
        </li>
        <li>
          <strong className="tip--ok">OK</strong> Plurals match: Dog = Dogs
        </li>
        <li>
          <strong className="tip--not-ok">NOT OK</strong> Genders don't match: Prince &#8800;
          Princess
        </li>
        <li>
          <strong className="tip--ok">OK</strong> If it refers to the same thing: Lincoln = Abe
          Lincoln = Abraham Lincoln
        </li>
        <li>
          <strong>REMEMBER: Lowest scores move all together, so if you're tied, you go too!</strong>
        </li>
      </ul>
    </div>
  );
};

export default GameQuestionWaiting;
