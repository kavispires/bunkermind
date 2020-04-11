import { deepCopy, shuffle } from './utils';
import { AVATARS, GAME_PHASES, ONE_MINUTE, ONLINE_MINIUTE_THRESHOLD } from './utils/contants';

import mockTurns from './firebase/mock-turns';

class GameEngine {
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
    this.phase = GAME_PHASES.WAITING_ROOM;
    this.usedQuestions = {};
    this.currentQuestionID = null;
    this.answersSet = [];
    this.compare = null;

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
    };
  }

  /**
   * Flag indicating if me property is set and included in players
   * @type  {boolean}
   */
  get isUserSet() {
    return this.me && this.players[this.me?.nickname];
  }

  /**
   * Flag indicating if game has already two players set
   * @type  {boolean}
   */
  get isGameFull() {
    return !this.isUserSet && Object.keys(this.players).length === 12;
  }

  /**
   * Flag indicating if player is online
   * @type  {boolean}
   */
  get isUserOnline() {
    return (
      this.isUserSet && Date.now() - this.me?.lastUpdated < ONE_MINUTE * ONLINE_MINIUTE_THRESHOLD
    );
  }

  /**
   * Flag indicating if player is ready
   * @type  {boolean}
   */
  get isUserReady() {
    return Boolean(this.players[this.me?.nickname]?.isReady);
  }

  /**
   * Gets user (me) from the live players object
   */
  get user() {
    return this.players[this.me?.nickname];
  }

  /**
   * Get user's answers
   * @type  {boolean}
   */
  get userAnswers() {
    return this.players[this.me?.nickname]?.answers || {};
  }

  /**
   * Get user answer in the compare matches object
   */
  get userCompareMatchingAnswer() {
    return this.compare?.matches?.[this?.me?.nickname];
  }

  /**
   * Flag indicating if every player is online
   * @type  {boolean}
   */
  get isEveryoneOnline() {
    return Object.values(this.players).every(
      (p) => Date.now() - p.lastUpdated < ONE_MINUTE * ONLINE_MINIUTE_THRESHOLD
    );
  }

  /**
   * Flag indicating if every player is ready (and online)
   * @type  {boolean}
   */
  get isEveryoneReady() {
    return this.isEveryoneOnline && Object.values(this.players).every((p) => p.isReady);
  }

  /**
   * Get every player that is ready
   * @type  {array}
   */
  get whosReady() {
    return Object.values(this.players).filter((p) => p.isReady);
  }

  /**
   * Return active player object based on turn and turnOrder
   * @type  {object}
   */
  get activePlayer() {
    const index = (this.turn - 1) % this.turnOrder.length;
    return this.players[this.turnOrder[index]];
  }

  /**
   * Flag indicating if user is the active player
   * @type  {boolean}
   */
  get isUserActivePlayer() {
    return this.me?.nickname === this.activePlayer.nickname;
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
      lastUpdatedBy: this.me.nickname,
    });

    if (this.me?.nickname) {
      this._dbRef.child('players').child(this.me.nickname).update({
        lastUpdated: Date.now(),
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

    return this.state;
  }

  reset() {
    // TO-DO reset all properties
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
   * Gets given players avatar
   * @param {string} playerNickname
   * @returns {string} the avatar
   */
  getPlayerAvatar(playerNickname) {
    return this.players[playerNickname].avatar;
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
    if (this.players[nickname]) {
      this.me = {
        ...this.players[nickname],
        lastUpdated: Date.now(),
      };
    } else {
      this.me = {
        lastUpdated: Date.now(),
        nickname,
        avatar: this.avatars[Object.keys(this.players).length],
        isAdmin: this._isAdmin,
        floor: 6,
        isReady: false,
        score: 0,
        answers: {},
      };
    }

    if (this.isGameFull) {
      throw Error('Game is full, try a different game ID');
    }

    if (!this.players[nickname] && this.isLocked) {
      throw Error('Game is locked, you can not join this time');
    }

    this.print('Adding player...');

    this._dbRef.child('players').update({
      [nickname]: this.me,
    });
  }

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
    if (!this.isUserOnline && this.me?.nickname) {
      this.print('Refreshing player...');

      this._dbRef.child('players').child(this.me.nickname).update({
        lastUpdated: Date.now(),
      });
    }
  }

  /**
   * Set user's/player's isReady to true with new timestamp
   */
  setUserReady() {
    if (this.me?.nickname) {
      this.print('Reading player...');

      this._dbRef.child('players').child(this.me?.nickname).update({
        isReady: true,
        lastUpdated: Date.now(),
      });
    }
  }

  goToQuestionPhase() {
    this.print('Going to QUESTION phase...');

    this.save({
      phase: GAME_PHASES.QUESTION,
      lastUpdatedBy: this.me?.nickname,
    });
  }

  goToAnswerPhase(questionID) {
    this.print('Going to ANSWER phase...');

    this.unReadyPlayers();

    this.save({
      lastUpdatedBy: this.me?.nickname,
      phase: GAME_PHASES.ANSWER,
      currentQuestionID: questionID,
      usedQuestions: {
        ...this.usedQuestions,
        [questionID]: true,
      },
      players: this.players,
    });
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
      lastUpdatedBy: this.me?.nickname,
      phase: GAME_PHASES.COMPARE,
      answersSet: this.answersSet,
    });

    setTimeout(() => {
      // After a second, prepare
      this.prepareCompare();
    }, 1000);
  }

  submitAnswers(answers) {
    if (this.me?.nickname) {
      // Set answers, uppercase
      const userAnswers = answers.reduce((acc, answer, index) => {
        const id = `${this.currentQuestionID};${this.me.nickname};${index}`;
        acc[id] = {
          text: answer.toUpperCase(),
          isMatch: false,
        };
        return acc;
      }, {});

      this._dbRef.child('players').child(this.me.nickname).update({
        isReady: true,
        lastUpdated: Date.now(),
        answers: userAnswers,
      });

      setTimeout(() => {
        // If everybody is ready, trigger next phase
        if (this.isEveryoneReady && this.phase !== GAME_PHASES.COMPARE) {
          this.goToComparePhase();
        }
      }, 1000);
    }
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
      lastUpdatedBy: this.me?.nickname,
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
      lastUpdatedBy: this.me?.nickname,
      compare: this.compare,
      players: this.players,
    });

    this._dbRef.child('players').child(name).update({
      lastUpdated: Date.now(),
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
      lastUpdatedBy: this.me?.nickname,
      compare: this.compare,
    });

    this._dbRef.child('players').child(name).update({
      lastUpdated: Date.now(),
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
      lastUpdatedBy: this.me?.nickname,
      compare: this.compare,
    });
  }

  doneComparing() {
    this._dbRef.child('players').child(this.me.nickname).update({
      isReady: true,
      lastUpdated: Date.now(),
    });

    setTimeout(() => {
      // If everybody is ready, run score then (prepare or results)
      if (this.isEveryoneReady && this.phase === GAME_PHASES.COMPARE) {
        this.score();
      }
    }, 1000);
  }

  score() {
    // Build invalid dictionary
    const invalidDict = Object.values(this.compare.matches).reduce((acc, matchEntry) => {
      const numPlayers = Object.keys(this.players).length;
      const numDownvotes = Object.keys(matchEntry).length;

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
          this.answersSet[toRemoveIndex] = '';
        }
      }
    });

    // Score
    const totalPointsForAnswer = Object.keys(this.compare.matches).length;

    Object.keys(this.compare.matches).forEach((playerName) => {
      this.players[playerName].score += totalPointsForAnswer;
    });

    // Reset set
    this.answersSet = [...new Set(this.answersSet)];

    // Save
    this.save({
      lastUpdatedBy: this.me?.nickname,
      players: this.players,
      answersSet: this.answersSet,
      compare: this.compare,
    });

    setTimeout(() => {
      console.log(this.answersSet);
      // Call prepare or result if no more words in set
      if (this.answersSet.length > 0) {
        console.log('PREPARE!!!');
        this.prepareCompare();
      } else {
        console.log('RESULTS!!!');
        this.turnResult();
      }
    }, 1000);
  }

  turnResult() {
    console.log('turnResult!');
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