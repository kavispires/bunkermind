import { shuffle } from './utils';
import { AVATARS } from './utils/contants';

class GameEngine {
  constructor() {
    this._dbRef = null;
    this._isAdmin = false;
    this.me = null;

    // Saved on Firebase
    this.gameID = null;
    this.avatars = [];
    this.players = {};

    this.turnOrder = [];
    this.phase = null;
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
    };
  }

  /**
   * Flag indicating if me property is set and included in players
   * @type  {boolean}
   */
  get amISet() {
    return this.me && this.players[this.me.nickname];
  }

  /**
   * Flag indicating if game has already two players set
   * @type  {boolean}
   */
  get isGameFull() {
    return !this.amISet && Object.keys(this.players).length === 12;
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

    // this._dbRef.update({
    //   test: true,
    // });

    this._dbRef.update({
      ...dataObj,
    });
  }

  update(data) {
    console.log('%cUpdating game...', 'background:GreenYellow', data);
    console.log(data.gameID);
    this.gameID = data.gameID;
    this.avatars = data.avatars || [];
    this.players = data.players || {};

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
  setPlayer(nickname) {
    if (this.players[nickname]) {
      this.me = {
        ...this.players[nickname],
        lastUpdated: Date.now(),
      };
    } else {
      this.me = {
        nickname,
        avatar: this.avatars[Object.keys(this.players).length],
        lastUpdated: Date.now(),
        isAdmin: this._isAdmin,
      };
    }

    if (this.isGameFull) {
      throw Error('Game is full, try a different game ID');
    }

    this._dbRef.child('players').update({
      [nickname]: this.me,
    });
  }
}

export default new GameEngine();
