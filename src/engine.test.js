import { GameEngine } from './engine';

import { GAME_PHASES, TEST_NOW } from './utils/contants';

import { getPlayers } from './firebase/mock-turns';

describe('gameEngine', () => {
  let gameEngine;
  let NOOP = jest.fn();
  const TRUE = true;
  const FALSE = false;
  const NICKNAME = 'Tester';

  beforeAll(() => {
    gameEngine = new GameEngine();
  });

  beforeEach(() => {
    NOOP = jest.fn();

    gameEngine.me = null;

    gameEngine._dbRef = null;
    gameEngine._isAdmin = false;
    gameEngine._interval = null;
    gameEngine._tempSaveObj = null;

    gameEngine.gameID = null;
    gameEngine.avatars = [];
    gameEngine.players = {};
    gameEngine.isLocked = false;
    gameEngine.turnOrder = [];
    gameEngine.turn = 0;
    gameEngine.turnType = 1;
    gameEngine.phase = GAME_PHASES.NONE;
    gameEngine.usedQuestions = {};
    gameEngine.currentQuestionID = null;
    gameEngine.answersSet = [];
    gameEngine.compare = null;
  });

  it('works', () => {
    expect(gameEngine instanceof GameEngine).toBeTruthy();
  });

  describe('GETTERS', () => {
    beforeEach(() => {
      gameEngine.me = NICKNAME;
    });

    it('state', () => {
      expect(gameEngine.state).toStrictEqual({
        gameID: null,
        players: {},
        isLocked: false,
        turnOrder: [],
        turn: 0,
        phase: GAME_PHASES.NONE,
        turnType: 1,
        currentQuestionID: null,
        usedQuestions: {},
        answersSet: [],
        compare: null,
      });
    });

    it('activePlayer', () => {
      gameEngine.players = getPlayers({ number: 4 });
      gameEngine.turnOrder = ['Danny', 'Beth', 'Tester', 'Cam'];
      gameEngine.turn = 1;

      expect(gameEngine.activePlayer).toStrictEqual({
        avatar: 'hedgehog',
        isAdmin: false,
        lastUpdated: 1586640900000,
        nickname: 'Danny',
        floor: 6,
        isReady: false,
        score: 0,
        answers: {},
      });

      gameEngine.turn = 2;
      expect(gameEngine.activePlayer.nickname).toBe('Beth');

      gameEngine.turn = 3;
      expect(gameEngine.activePlayer.nickname).toBe('Tester');

      gameEngine.turn = 4;
      expect(gameEngine.activePlayer.nickname).toBe('Cam');

      gameEngine.turn = 5;
      expect(gameEngine.activePlayer.nickname).toBe('Danny');

      gameEngine.turn = 6;
      expect(gameEngine.activePlayer.nickname).toBe('Beth');

      gameEngine.turn = 11;
      expect(gameEngine.activePlayer.nickname).toBe('Tester');

      gameEngine.turn = 17;
      expect(gameEngine.activePlayer.nickname).toBe('Danny');
    });

    it('isEveryoneOnline', () => {
      expect(gameEngine.isEveryoneOnline).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 3, isOnline: true });

      expect(gameEngine.isEveryoneOnline).toBe(TRUE);

      gameEngine.players = getPlayers({ number: 3, isOnline: false });

      expect(gameEngine.isEveryoneOnline).toBe(FALSE);
    });

    it('isEveryoneReady', () => {
      expect(gameEngine.isEveryoneReady).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 3, isReady: true });

      expect(gameEngine.isEveryoneReady).toBe(TRUE);

      gameEngine.players = getPlayers({ number: 3, isReady: false });

      expect(gameEngine.isEveryoneReady).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 3, isReady: [true] });

      expect(gameEngine.isEveryoneReady).toBe(FALSE);
    });

    it('isGameFull', () => {
      gameEngine.players = getPlayers({ number: 1 });

      expect(gameEngine.isGameFull).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 12 });

      expect(gameEngine.isGameFull).toBe(FALSE);

      gameEngine.me = 'Other Name';

      expect(gameEngine.isGameFull).toBe(TRUE);
    });

    it('now', () => {
      expect(gameEngine.now).toBe(1586640900000);
    });

    it('isUserActivePlayer', () => {
      expect(gameEngine.isUserActivePlayer).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 4 });
      gameEngine.turnOrder = ['Danny', 'Beth', 'Tester', 'Cam'];

      gameEngine.turn = 7;
      expect(gameEngine.isUserActivePlayer).toBe(TRUE);

      gameEngine.turn = 4;
      expect(gameEngine.isUserActivePlayer).toBe(FALSE);
    });

    it('isUserOnline', () => {
      expect(gameEngine.isUserOnline).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 1 });

      expect(gameEngine.isUserOnline).toBe(TRUE);

      gameEngine.players = getPlayers({ number: 1, isOnline: false });

      expect(gameEngine.isUserOnline).toBe(FALSE);
    });

    it('isUserSet', () => {
      expect(gameEngine.isUserSet).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 1 });

      expect(gameEngine.isUserSet).toBe(TRUE);
    });

    it('isUserReady', () => {
      expect(gameEngine.isUserReady).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 1, isReady: true });

      expect(gameEngine.isUserReady).toBe(TRUE);

      gameEngine.players = getPlayers({ number: 1 });

      expect(gameEngine.isUserReady).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 1, isReady: undefined });

      expect(gameEngine.isUserReady).toBe(FALSE);
    });

    it('user', () => {
      gameEngine.players = getPlayers({ number: 1 });

      expect(gameEngine.user).toStrictEqual({
        avatar: 'axolotl',
        isAdmin: true,
        lastUpdated: TEST_NOW,
        nickname: NICKNAME,
        floor: 6,
        isReady: false,
        score: 0,
        answers: {},
      });
    });

    it('userAnswers', () => {
      expect(gameEngine.userAnswers).toStrictEqual({});

      gameEngine.players = getPlayers({ number: 3 });

      expect(gameEngine.userAnswers).toStrictEqual({});

      gameEngine.players = getPlayers({ number: 3, addAnswers: true });

      expect(Object.keys(gameEngine.userAnswers)).toStrictEqual([
        'q1;Tester;0',
        'q1;Tester;1',
        'q1;Tester;2',
      ]);

      expect(gameEngine.userAnswers['q1;Tester;0']).toBeTruthy();
      expect(gameEngine.userAnswers['q1;Tester;0'].text).toBeTruthy();
      expect(gameEngine.userAnswers['q1;Tester;0'].isMatch).toBe(FALSE);
    });

    it('userCompareMatchingAnswer', () => {
      expect(gameEngine.userCompareMatchingAnswer).toBe(undefined);

      gameEngine.compare = {
        matches: {
          Tester: {
            answer: 'CLIPS',
            answerId: 'q1;Tester;0',
            isLocked: true,
          },
        },
      };

      expect(gameEngine.userCompareMatchingAnswer).toBeTruthy();
      expect(gameEngine.userCompareMatchingAnswer).toStrictEqual({
        answer: 'CLIPS',
        answerId: 'q1;Tester;0',
        isLocked: true,
      });
    });

    it('whosReady', () => {
      expect(gameEngine.whosReady).toStrictEqual([]);

      gameEngine.players = getPlayers({ number: 3, isReady: [false, false, true] });

      expect(gameEngine.whosReady).toStrictEqual([
        {
          avatar: 'fox',
          isAdmin: false,
          lastUpdated: 1586640900000,
          nickname: 'Cam',
          floor: 6,
          isReady: true,
          score: 0,
          answers: {},
        },
      ]);

      gameEngine.players = getPlayers({ number: 3, isReady: true });

      expect(gameEngine.whosReady.length).toBe(3);

      gameEngine.players = getPlayers({ number: 3, isReady: [true, false, true] });

      expect(gameEngine.whosReady.length).toBe(2);
    });
  });
});
