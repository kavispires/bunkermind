import { shuffle } from './utils';
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
      this.print('Delaing save...');
      this._tempSaveObj = dataObj;
      return this.delaySave();
    }

    this.print('Saving...', dataObj);

    this._dbRef.update({
      ...dataObj,
    });

    if (this.me?.nickname) {
      this._dbRef.child('players').child(this.me.nickname).update({
        lastUpdated: Date.now(),
      });
    }
  }

  update(data) {
    this.print('Updating game...', data);

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
    });
  }

  goToAnswerPhase(questionID) {
    this.print('Going to ANSWER phase...');

    this.unReadyPlayers();

    this.save({
      phase: GAME_PHASES.ANSWER,
      currentQuestionID: questionID,
      usedQuestions: {
        ...this.usedQuestions,
        [questionID]: true,
      },
      players: this.players,
    });
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
