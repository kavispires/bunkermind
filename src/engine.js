import { deepCopy, shuffle } from './utils';
import {
  AVATARS,
  GAME_PHASES,
  ONE_MINUTE,
  ONLINE_MINIUTE_THRESHOLD,
  TEST_NOW,
  ENGINE_TIMEOUT,
  RESULT_ACTION,
} from './utils/contants';

import mockTurns from './firebase/mock-turns';

export class GameEngine {
  constructor() {
    this._dbRef = null;
    this._isAdmin = false;
    this.me = null;

    // Saved on Firebase
    this.gameID = null;
    this.avatars = [];
    this.players = {};
    this.isLocked = false;
    this.turnOrder = [];
    this.turn = 0;
    this.turnType = 1;
    this.phase = GAME_PHASES.NONE;
    this.usedQuestions = {};
    this.currentQuestionID = null;
    this.answersSet = [];
    this.compare = null;
    this.floorBlockers = {
      1: true,
      2: true,
      3: true,
    };
    this.result = {};
    this.gameOver = false;

    // Used by delay save
    this._interval = null;
    this._tempSaveObj = null;
  }

  // GETTERS

  /**
   * State to be used by the game global state
   * @type  {string}
   */
  get state() {
    return {
      gameID: this.gameID,
      players: this.players,
      isLocked: this.isLocked,
      turnOrder: this.turnOrder,
      turn: this.turn,
      phase: this.phase,
      turnType: this.turnType,
      currentQuestionID: this.currentQuestionID,
      usedQuestions: this.usedQuestions,
      answersSet: this.answersSet,
      compare: this.compare,
      floorBlockers: this.floorBlockers,
      result: this.result,
      gameOver: this.gameOver,
    };
  }

  /**
   * Return active player object based on turn and turnOrder
   * @returns  {object}
   */
  get activePlayer() {
    const index = (this.turn - 1) % this.turnOrder.length;
    return this.players[this.turnOrder[index]];
  }

  /**
   * Flag indicating if every player is online
   * @type  {boolean}
   */
  get isEveryoneOnline() {
    return Boolean(
      Object.keys(this.players).length &&
        Object.values(this.players).every(
          (p) => this.now - p.lastUpdated < ONE_MINUTE * ONLINE_MINIUTE_THRESHOLD
        )
    );
  }

  /**
   * Flag indicating if every player is ready (and online)
   * @returns  {boolean}
   */
  get isEveryoneReady() {
    return this.isEveryoneOnline && Object.values(this.players).every((p) => p.isReady);
  }

  /**
   * Flag indicating if game has already two players set
   * @returns  {boolean}
   */
  get isGameFull() {
    return !this.isUserSet && Object.keys(this.players).length === 12;
  }

  /**
   * Flag indicating if user is the active player
   * @returns  {boolean}
   */
  get isUserActivePlayer() {
    return this.me === this.activePlayer?.nickname;
  }

  /**
   * Flag indicating if player is online
   * @returns  {boolean}
   */
  get isUserOnline() {
    return (
      this.isUserSet && this.now - this.user.lastUpdated < ONE_MINUTE * ONLINE_MINIUTE_THRESHOLD
    );
  }

  /**
   * Flag indicating if me property is set and included in players
   * @returns  {boolean}
   */
  get isUserSet() {
    return Boolean(this.me && this.players[this.me]);
  }

  /**
   * Flag indicating if player is ready
   * @returns  {boolean}
   */
  get isUserReady() {
    return Boolean(this.players[this.me]?.isReady);
  }

  /**
   * Returns current time in miliseconds
   * @returns {number}
   */
  get now() {
    return process.env.NODE_ENV === 'test' ? TEST_NOW : Date.now();
  }

  /**
   * Order restuls based on their result action
   */
  get orderedResults() {
    // For each floor, order by user first, game-over, move up, move down, save, then stay

    return Object.entries(this.result).reduce((acc, [key, floorObj]) => {
      if (Object.keys(floorObj).length < 1) {
        acc[key] = [];
        return acc;
      }

      const orderedFloorObj = {
        me: [],
        [RESULT_ACTION.GAME_OVER]: [],
        [RESULT_ACTION.MOVE_UP]: [],
        [RESULT_ACTION.MOVE_DOWN]: [],
        [RESULT_ACTION.SAVE]: [],
        [RESULT_ACTION.STAY]: [],
      };

      Object.values(floorObj).forEach((playerResult) => {
        if (playerResult.name === this.me) {
          return orderedFloorObj.me.push(playerResult);
        }

        return orderedFloorObj[playerResult.action].push(playerResult);
      });

      acc[key] = [
        ...orderedFloorObj.me,
        ...orderedFloorObj[RESULT_ACTION.GAME_OVER],
        ...orderedFloorObj[RESULT_ACTION.MOVE_UP],
        ...orderedFloorObj[RESULT_ACTION.MOVE_DOWN],
        ...orderedFloorObj[RESULT_ACTION.SAVE],
        ...orderedFloorObj[RESULT_ACTION.STAY],
      ];

      return acc;
    }, {});
  }

  /**
   * Gets user (me) from the live players object
   * @returns {object}
   */
  get user() {
    return this.players[this.me];
  }

  /**
   * Get user's answers
   * @returns  {object}
   */
  get userAnswers() {
    return this.players[this.me]?.answers || {};
  }

  /**
   * Get user answer in the compare matches object
   * @returns {object}
   */
  get userCompareMatchingAnswer() {
    return this.compare?.matches?.[this.me];
  }

  /**
   * Get every player that is ready
   * @returns  {array}
   */
  get whosReady() {
    return Object.values(this.players).filter((p) => p.isReady);
  }

  // DYNAMIC GETTER

  /**
   * Gets given players avatar
   * @param {string} playerNickname
   * @returns {string} the avatar
   */
  getPlayerAvatar(playerNickname) {
    return this.players[playerNickname].avatar;
  }

  // MAIN METHODS

  init(gameID) {
    this.gameID = gameID;
    this._isAdmin = true;

    this.setup();

    return {
      gameID: this.gameID,
      avatars: this.avatars,
    };
  }

  setup() {
    // Define avatars for players
    this.avatars = shuffle(AVATARS);
  }

  delaySave() {
    if (!this._interval) {
      this._interval = setInterval(() => {
        if (this._dbRef) {
          this.save({ ...this._tempSaveObj });
          this._tempSaveObj = null;
          clearInterval(this._interval);
        }
      }, 1000);
    } else {
      console.warn("There's already a save interval running");
    }
  }

  save(dataObj = {}) {
    if (!this._dbRef) {
      this.print('Delaying save...');
      this._tempSaveObj = dataObj;
      return this.delaySave();
    }

    this.print('Saving...', dataObj);

    this._dbRef.update({
      ...dataObj,
      lastUpdatedBy: this.me,
    });

    if (this.me) {
      this._dbRef.child('players').child(this.me).update({
        lastUpdated: this.now,
      });
    }
  }

  update(data) {
    this.print(`Updating game (by ${data.lastUpdatedBy})...`, data);

    this.gameID = data.gameID;
    this.avatars = data.avatars || [];
    this.players = data.players || {};
    this.isLocked = data.isLocked || false;
    this.turnOrder = data.turnOrder || [];
    this.turn = data.turn;
    this.turnType = data.turnType;
    this.phase = data.phase;
    this.currentQuestionID = data.currentQuestionID || null;
    this.usedQuestions = data.usedQuestions || {};
    this.answersSet = data.answersSet || [];
    this.compare = data.compare || null;
    this.floorBlockers = data.floorBlockers;
    this.gameOver = data.gameOver;
    this.result = data.result ? this.extendResult(data.result) : {};

    return this.state;
  }

  reset() {
    this._dbRef = null;
    this._isAdmin = false;
    this.me = null;
    this.gameID = null;
    this.avatars = [];
    this.players = {};
    this.isLocked = false;
    this.turnOrder = [];
    this.turn = 0;
    this.turnType = 1;
    this.phase = GAME_PHASES.NONE;
    this.usedQuestions = {};
    this.currentQuestionID = null;
    this.answersSet = [];
    this.compare = null;
    this._interval = null;
    this._tempSaveObj = null;
    this.floorBlockers = {
      1: true,
      2: true,
      3: true,
    };
    this.result = {};
    this.gameOver = false;

    this.save(this.state);
  }

  // SETTERS

  /**
   * Sets the the firebase reference
   * @param {object} dbRef firebase database reference
   * @returns {object} the reference itself
   */
  setDbRef(dbRef) {
    if (!this._dbRef) {
      this._dbRef = dbRef;
    }
    return this._dbRef;
  }

  /**
   * Sets the game ID
   * @param {string} gameID four-digit unique id
   */
  setGameID(gameID) {
    this.gameID = gameID;
  }

  /**
   * Turns every every player isReady flag off
   */
  unReadyPlayers() {
    Object.values(this.players).forEach((player) => {
      player.isReady = false;
    });
  }

  // SAVERS

  /**
   * Pulls or saves a new player instance to database
   * @param {string} nickname the nickname of the user
   */
  setPlayer(nickname) {
    // Set me
    this.me = nickname;

    // Define new player
    let newPlayer;
    if (this.players[nickname]) {
      newPlayer = {
        ...this.players[nickname],
        lastUpdated: this.now,
      };
    } else {
      newPlayer = {
        lastUpdated: this.now,
        nickname,
        avatar: this.avatars[Object.keys(this.players).length],
        floor: 6,
        isReady: false,
        score: 0,
        answers: {},
      };

      if (this._isAdmin) {
        newPlayer.isAdmin = true;
      }
    }

    if (this.isGameFull) {
      throw Error('Game is full, try a different game ID');
    }

    if (!this.players[nickname] && this.isLocked) {
      throw Error('Game is locked, you can not join this time');
    }

    this.print('Adding player...');

    this._dbRef.child('players').update({
      [nickname]: newPlayer,
    });
  }

  /**
   * Locks games and take users to announcement
   */
  lockAndStart() {
    this.save({
      turnOrder: shuffle(Object.keys(this.players)),
      phase: GAME_PHASES.ANNOUNCEMENT,
      isLocked: true,
      turn: 1,
      turnType: 1,
    });
  }

  /**
   * Saves new typestamp to player/user
   */
  refresh() {
    if (!this.isUserOnline && this.me) {
      this.print('Refreshing player...');

      this._dbRef.child('players').child(this.me).update({
        lastUpdated: this.now,
      });
    }
  }

  /**
   * Set user/player's isReady to true with new timestamp
   */
  setUserReady() {
    if (this.me) {
      this.print('Reading player...');

      this._dbRef.child('players').child(this.me).update({
        isReady: true,
        lastUpdated: this.now,
      });

      setTimeout(() => {
        // If everybody is ready, trigger next phase
        if (this.isEveryoneReady && this.phase !== GAME_PHASES.QUESTION) {
          this.goToQuestionPhase();
        }
      }, ENGINE_TIMEOUT);
    }
  }

  goToQuestionPhase() {
    this.print('Going to QUESTION phase...');

    this.save({
      phase: GAME_PHASES.QUESTION,
      lastUpdatedBy: this.me,
    });
  }

  goToAnswerPhase(questionID) {
    this.print('Going to ANSWER phase...');

    this.unReadyPlayers();

    this.save({
      lastUpdatedBy: this.me,
      phase: GAME_PHASES.ANSWER,
      currentQuestionID: questionID,
      usedQuestions: {
        ...this.usedQuestions,
        [questionID]: true,
      },
      players: this.players,
    });
  }

  submitAnswers(answers) {
    if (this.me) {
      // Set answers, uppercase
      const userAnswers = answers.reduce((acc, answer, index) => {
        const id = `${this.currentQuestionID};${this.me};${index}`;
        acc[id] = {
          text: answer.toUpperCase(),
          isMatch: false,
        };
        return acc;
      }, {});

      this._dbRef.child('players').child(this.me).update({
        isReady: true,
        lastUpdated: this.now,
        answers: userAnswers,
      });

      setTimeout(() => {
        // If everybody is ready, trigger next phase
        if (this.isEveryoneReady && this.phase !== GAME_PHASES.COMPARE) {
          this.goToComparePhase();
        }
      }, ENGINE_TIMEOUT);
    }
  }

  goToComparePhase() {
    this.print('Going to COMPARE phase...');

    this.answersSet = [
      ...new Set(
        Object.values(this.players)
          .map((player) => Object.values(player.answers).map((answer) => answer.text))
          .flat()
          .sort()
          .reverse()
      ),
    ];

    this.save({
      lastUpdatedBy: this.me,
      phase: GAME_PHASES.COMPARE,
      answersSet: this.answersSet,
    });

    setTimeout(() => {
      // After a second, prepare
      this.prepareCompare();
    }, ENGINE_TIMEOUT);
  }

  prepareCompare() {
    // Unready players
    this.unReadyPlayers();

    // Get currentAnswer
    const currentAnswer = this.answersSet.pop();

    const matches = {};

    // Auto-match all users
    Object.values(this.players).forEach((player) =>
      Object.entries(player.answers).forEach(([answerId, answer]) => {
        if (answer.text === currentAnswer) {
          matches[player.nickname] = {
            answer: answer.text,
            isLocked: true,
            answerId,
          };
          // Mark as matched in the player object
          answer.isMatch = true;
        }
      })
    );

    this.save({
      lastUpdatedBy: this.me,
      phase: GAME_PHASES.COMPARE,
      players: this.players,
      answersSet: this.answersSet,
      compare: {
        currentAnswer,
        matches,
      },
    });
  }

  addMatch(id, nickname) {
    // Mark player answer as match
    this.players[nickname].answers[id].isMatch = true;

    const [, name] = id.split(';');

    // Add player answer to compare.matches
    this.compare.matches[name] = {
      answer: this.userAnswers[id].text,
      isLocked: false,
      downvotes: {
        [name]: true,
      },
      answerId: id,
    };

    const userAnswersCopy = deepCopy(this.userAnswers);

    // Save
    this.save({
      lastUpdatedBy: this.me,
      compare: this.compare,
      players: this.players,
    });

    this._dbRef.child('players').child(name).update({
      lastUpdated: this.now,
      answers: userAnswersCopy,
    });
  }

  removeMatch(id, nickname) {
    // Mark player answer as NOT match
    this.players[nickname].answers[id].isMatch = false;

    const [, name] = id.split(';');

    // Remove player answer to compare.matches
    this.compare.matches[name] = {};
    const userAnswersCopy = deepCopy(this.userAnswers);

    // Save
    this.save({
      lastUpdatedBy: this.me,
      compare: this.compare,
    });

    this._dbRef.child('players').child(name).update({
      lastUpdated: this.now,
      answers: userAnswersCopy,
    });
  }

  voteForAnswer(id, voterName) {
    if (this.compare.matches[id]) {
      if (this.compare.matches[id].downvotes[voterName]) {
        delete this.compare.matches[id].downvotes[voterName];
      } else {
        this.compare.matches[id].downvotes[voterName] = true;
      }
    }

    // Save
    this.save({
      lastUpdatedBy: this.me,
      compare: this.compare,
    });
  }

  doneComparing() {
    this._dbRef.child('players').child(this.me).update({
      isReady: true,
      lastUpdated: this.now,
    });

    setTimeout(() => {
      // If everybody is ready, run score then (prepare or results)
      if (this.isEveryoneReady && this.phase === GAME_PHASES.COMPARE) {
        this.score();
      }
    }, ENGINE_TIMEOUT);
  }

  score() {
    // Build invalid dictionary
    const invalidDict = Object.values(this.compare.matches).reduce((acc, matchEntry) => {
      const numPlayers = Object.keys(this.players).length;
      const numDownvotes = Object.keys(matchEntry?.downvotes || {}).length;

      if (!matchEntry.isLocked && numDownvotes / numPlayers > 0.4) {
        acc[matchEntry.answer] = true;
      }

      return acc;
    }, {});

    // Reset any player that has more than 30% of players downvoted
    Object.entries(this.compare.matches).forEach(([playerName, matchEntry]) => {
      if (invalidDict[matchEntry.answer]) {
        // Dis-match
        this.players[playerName].answers[matchEntry.answerId].isMatch = false;
        // Remove from matches
        delete this.compare.matches[playerName];
      } else {
        // Remove any non exact macthes that were accepted from answersSet
        const toRemoveIndex = this.answersSet.findIndex((a) => a === matchEntry.answer);
        if (toRemoveIndex > -1) {
          this.answersSet[toRemoveIndex] = undefined;
        }
      }
    });

    // Score
    const totalPointsForAnswer = Object.keys(this.compare.matches).length;

    Object.keys(this.compare.matches).forEach((playerName) => {
      this.players[playerName].score += totalPointsForAnswer;
    });

    // Reset set
    this.answersSet = this.answersSet.filter((a) => a);

    // Save
    this.save({
      lastUpdatedBy: this.me,
      players: this.players,
      answersSet: this.answersSet,
      compare: this.compare,
    });

    setTimeout(() => {
      // Call prepare or result if no more words in set
      if (this.answersSet.length > 0) {
        this.prepareCompare();
      } else {
        this.turnResult();
      }
    }, ENGINE_TIMEOUT);
  }

  turnResult() {
    // Split players into groups by score
    const tiers = Object.values(this.players)
      .reduce((tiersAcc, player) => {
        if (tiersAcc[player.score] === undefined) {
          tiersAcc[player.score] = [];
        }
        tiersAcc[player.score].push(player);

        return tiersAcc;
      }, [])
      .filter((entry) => entry);

    // Create result object
    const result = {
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
      6: {},
    };

    let isGameOver = false;

    const floorBlockersCopy = { ...this.floorBlockers };
    const newFloorBlockers = { ...this.floorBlockers };
    const highestScoreIndex = tiers.length - 1;

    class PlayerResult {
      constructor(name, score, from, to, savedByBlocker = false) {
        this.name = name;
        this.score = score;
        this.from = from;
        this.to = to;
        this.action = null;
      }
    }

    function moveUp(player) {
      const saved = floorBlockersCopy[player.floor];
      // Remove blocker if used(saved)
      if (saved) {
        newFloorBlockers[player.floor] = false;
      }
      const to = saved ? player.floor : player.floor - 1;

      const entry = new PlayerResult(player.nickname, player.score, player.floor, to, saved);

      if (entry.to === 0) {
        isGameOver = true;
        entry.action = RESULT_ACTION.GAME_OVER;
      } else if (entry.to === entry.from) {
        entry.action = saved ? RESULT_ACTION.SAVE : RESULT_ACTION.STAY;
      } else {
        entry.action = RESULT_ACTION.MOVE_UP;
      }

      result[entry.from][entry.name] = { ...entry };
    }

    function moveDown(player) {
      const to = player.floor === 6 ? player.floor : player.floor + 1;

      const entry = new PlayerResult(player.nickname, player.score, player.floor, to);

      if (entry.from === 6) {
        entry.action = RESULT_ACTION.STAY;
      } else {
        entry.action = RESULT_ACTION.MOVE_DOWN;
      }

      result[entry.from][entry.name] = { ...entry };
    }

    tiers.forEach((tier, index) => {
      // TurnType 0, move down (only when more than one tier)
      if (this.turnType === 0 && tiers.length > 1 && highestScoreIndex === index) {
        tier.forEach(moveDown);
        return;
      }

      // Add lowest scores
      if (index === 0 && highestScoreIndex !== index) {
        tier.forEach(moveUp);
        return;
      }

      // Add second lowest scores
      if (this.turnType >= 2 && index === 1) {
        tier.forEach(moveUp);
        return;
      }

      // Add third lowest scores
      if (this.turnType === 3 && index === 2) {
        tier.forEach(moveUp);
        return;
      }

      tier.forEach((player) => {
        const entry = new PlayerResult(player.nickname, player.score, player.floor, player.floor);
        entry.action = RESULT_ACTION.STAY;
        result[entry.from][entry.name] = { ...entry };
      });
    });

    this.unReadyPlayers();

    // Save
    this.save({
      lastUpdatedBy: this.me,
      players: this.players,
      floorBlockers: newFloorBlockers,
      result,
      phase: GAME_PHASES.RESULT,
      gameOver: isGameOver,
    });
  }

  // HELPERS

  /**
   * Ensures all 6 floors are present in the result object
   * @param {object} resultObj
   * @returns {object}
   */
  extendResult(resultObj) {
    return {
      1: {},
      2: {},
      3: {},
      4: {},
      5: {},
      6: {},
      ...resultObj,
    };
  }

  /**
   * Saves mock data to database
   * @param {string} phase
   */
  mock(phase) {
    this.print('Mocking...');
    this.save(mockTurns(phase));
  }

  print(message, data = '') {
    if (process.env.NODE_ENV === 'development') {
      let color = 'LavenderBlush';
      if (message.startsWith('Updating')) {
        color = 'GreenYellow';
      } else if (message.startsWith('Saving')) {
        color = 'LightCoral';
      } else if (message.startsWith('Going')) {
        color = 'LightPink';
      } else if (message.includes('player')) {
        color = 'LightSalmon';
      } else if (message.startsWith('Mock')) {
        color = 'Orange';
      }

      console.log(`%c${message}`, `background:${color}`, data);
    }
  }
}

export default new GameEngine();
