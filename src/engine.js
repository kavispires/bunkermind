class GameEngine {
  constructor() {
    this._dbRef = null;

    this.gameID = null;
    this.phase = null;

    // Used by delay save
    this._interval = null;
    this._tempSaveObj = null;
  }

  /**
   * State to be used by the game global state
   * @type  {string}
   */
  get state() {
    return {
      gameID: this.gameID,
    };
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
      console.warn('There`s already a save interval running');
    }
  }

  save(dataObj = {}) {
    if (!this._dbRef) {
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

    return this.state;
  }

  reset() {
    // TO-DO reset all properties
  }
}

export default new GameEngine();
