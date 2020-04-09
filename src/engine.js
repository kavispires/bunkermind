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
    };
  }

  /**
   * Flag indicating if me property is set and included in players
   * @type  {boolean}
   */
  get amISet() {
    return this.me && this.players[this.me?.nickname];
  }

  /**
   * Flag indicating if game has already two players set
   * @type  {boolean}
   */
  get isGameFull() {
    return !this.amISet && Object.keys(this.players).length === 12;
  }

  /**
   * Flag indicating if every player is online
   * @type  {boolean}
   */
  get amIOnline() {
    return this.amISet && Date.now() - this.me.lastUpdated < ONE_MINUTE * ONLINE_MINIUTE_THRESHOLD;
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
      console.warn('Delaying save');
      this._tempSaveObj = dataObj;
      return this.delaySave();
    }

    console.log('%cSaving...', 'background:LightSalmon', dataObj);

    this._dbRef.update({
      ...dataObj,
    });
  }

  update(data) {
    console.log('%cUpdating game...', 'background:GreenYellow', data);

    this.gameID = data.gameID;
    this.avatars = data.avatars || [];
    this.players = data.players || {};
    this.isLocked = data.isLocked || false;
    this.turnOrder = data.turnOrder || [];
    this.turn = data.turn;
    this.turnType = data.turnType;
    this.phase = data.phase;

    return this.state;
  }

  reset() {
    // TO-DO reset all properties
  }

  // SETTERS

  setDbRef(dbRef) {
    if (!this._dbRef) {
      this._dbRef = dbRef;
    }
    return this._dbRef;
  }

  setGameID(gameID) {
    this.gameID = gameID;
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
      };
    }

    if (this.isGameFull) {
      throw Error('Game is full, try a different game ID');
    }

    if (!this.players[nickname] && this.isLocked) {
      throw Error('Game is locked, you can not join this time');
    }

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
   * Saves new typestamp to user
   */
  refresh() {
    console.log('refreshing...');
    if (!this.amIOnline) {
      this._dbRef.child('players').child(this.me?.nickname).update({
        lastUpdated: Date.now(),
      });
    }
  }

  /**
   * Saves mock data to database
   * @param {string} phase
   */
  mock(phase) {
    this.save(mockTurns(phase));
  }
}

export default new GameEngine();
