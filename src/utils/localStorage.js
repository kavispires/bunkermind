class LocalStorageService {
  constructor() {
    this.store = {
      nickname: '',
      gameID: '',
    };
    this.isLoaded = false;
    this.appName = 'bunkermind';

    this.init();
  }

  init() {
    this.load();
    return this.get();
  }

  get(key) {
    if (!this.isLoaded) {
      this.load();
    }

    if (key) {
      return this.store[key] || null;
    }

    return this.store;
  }

  load() {
    const localStorage = JSON.parse(window.localStorage.getItem(this.appName));

    if (localStorage) {
      this.store = localStorage;
      this.isLoaded = true;
    }
  }

  set(value) {
    if (!this.isLoaded) {
      this.load();
    }

    const type = typeof value;
    if (type !== 'string' && type !== 'object') {
      console.error('localStorage set value must be a string or a key-value object');
      return;
    }

    // When value is a string, use as a property toggle
    if (typeof value === 'string') {
      this.store[value] = !this.store[value];
    } else {
      // Remove any null or undefined property
      Object.entries(value).forEach(([key, item]) => {
        if (item === null || item === undefined) {
          delete value[key];
        }
      });

      this.store = {
        ...this.store,
        ...value,
      };
    }

    this.save();
  }

  save() {
    if (this.notLoaded) {
      this.load();
    }

    window.localStorage.setItem(this.appName, JSON.stringify(this.store));
    this.load();
  }

  getDefaults() {
    return [this.store.gameID, this.store.nickname];
  }

  setDefaults(gameID, nickname) {
    this.set({
      gameID,
      nickname,
    });
  }

  resetGameID() {
    this.set({
      nickname: this.store.nickname,
      gameID: null,
    });
  }
}

export default new LocalStorageService();
