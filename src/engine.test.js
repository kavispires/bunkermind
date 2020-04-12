import { GameEngine } from './engine';

import { deepCopy } from './utils';
import { AVATARS, GAME_PHASES, TEST_NOW } from './utils/contants';

import {
  mockPlayersComparePhase,
  mockCompare,
  mockPlayersRemoveMatch,
  mockCompareUpvote,
  mockCompareDownvote,
  mockResultsScore3PlayersUpvoted,
  mockResultsScore3PlayersDownvoted,
} from './utils/engine-mock';

import { getPlayers } from './firebase/mock-turns';
import mockFirebaseDbRef from './firebase/mock-firebase';

describe('gameEngine', () => {
  let gameEngine;
  let NOOP = jest.fn();
  const TRUE = true;
  const FALSE = false;
  const NICKNAME = 'Tester';
  const GAME_ID = 'TEST';

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
        floorBlockers: {
          1: true,
          2: true,
          3: true,
        },
        result: {},
        gameOver: false,
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

    it('orderedResults', () => {
      gameEngine.result = {
        '1': {},
        '2': {},
        '3': {},
        '4': {},
        '5': {
          Beth: { action: 'STAY', from: 5, name: 'Beth', score: 4, to: 6 },
          Cam: { action: 'GAME_OVER', from: 5, name: 'Cam', score: 3, to: 5 },
          Danny: { action: 'MOVE_UP', from: 5, name: 'Danny', score: 2, to: 4 },
          Evan: { action: 'MOVE_DOWN', from: 5, name: 'Evan', score: 4, to: 6 },
          Tester: { action: 'SAVE', from: 5, name: 'Tester', score: 4, to: 6 },
        },
        '6': {},
      };

      expect(gameEngine.orderedResults).toStrictEqual({
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [
          { action: 'SAVE', from: 5, name: 'Tester', score: 4, to: 6 },
          { action: 'GAME_OVER', from: 5, name: 'Cam', score: 3, to: 5 },
          { action: 'MOVE_UP', from: 5, name: 'Danny', score: 2, to: 4 },
          { action: 'MOVE_DOWN', from: 5, name: 'Evan', score: 4, to: 6 },
          { action: 'STAY', from: 5, name: 'Beth', score: 4, to: 6 },
        ],
        '6': [],
      });
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

  describe('DYNAMIC GETTERS', () => {
    beforeEach(() => {
      gameEngine.me = NICKNAME;
    });

    it('getPlayerAvatar', () => {
      gameEngine.players = getPlayers({ number: 3 });

      expect(gameEngine.getPlayerAvatar(NICKNAME)).toBe('axolotl');

      expect(gameEngine.getPlayerAvatar('Beth')).toBe('cardinal');

      expect(gameEngine.getPlayerAvatar('Cam')).toBe('fox');
    });
  });

  describe('MAIN METHODS', () => {
    beforeEach(() => {
      gameEngine.me = NICKNAME;
      gameEngine._dbRef = mockFirebaseDbRef();
    });

    it('init', () => {
      const result = gameEngine.init(GAME_ID);

      expect(result.gameID).toBe(GAME_ID);
      expect(result.avatars.length).toBe(15);
    });

    it('setup', () => {
      expect(gameEngine.avatars.length).toBe(0);

      gameEngine.setup();

      expect(gameEngine.avatars.length).toBe(15);
    });

    it('save', () => {
      gameEngine.save({ test: 'testing' });

      expect(gameEngine._dbRef.update).toHaveBeenCalledWith({
        lastUpdatedBy: NICKNAME,
        test: 'testing',
      });

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
    });

    it('update', () => {
      gameEngine.update({
        gameID: 'UUUU',
        turn: 10,
        turnType: 1,
        phase: GAME_PHASES.WAITING_ROOM,
        floorBlockers: {
          1: true,
          2: true,
          3: true,
        },
        gameOver: false,
      });

      expect(gameEngine.state).toStrictEqual({
        gameID: 'UUUU',
        players: {},
        isLocked: false,
        turnOrder: [],
        turn: 10,
        phase: 'WAITING_ROOM',
        turnType: 1,
        currentQuestionID: null,
        usedQuestions: {},
        answersSet: [],
        compare: null,
        floorBlockers: {
          1: true,
          2: true,
          3: true,
        },
        result: {},
        gameOver: false,
      });

      gameEngine.update({
        gameID: 'UUUU',
        avatars: ['elephant'],
        players: getPlayers({ number: 1 }),
        isLocked: true,
        turnOrder: ['Beth', NICKNAME],
        turn: 10,
        turnType: 1,
        phase: GAME_PHASES.COMPARE,
        currentQuestionID: 'q100',
        usedQuestions: { q1: true, q2: true },
        answerSet: ['ARC', 'BALL'],
        compare: {
          matches: {},
        },
        floorBlockers: {
          1: false,
          2: true,
          3: true,
        },
        result: {
          '1': {},
          '2': {},
          '3': {},
          '4': {},
          '5': {},
          '6': {},
        },
        gameOver: true,
      });

      expect(gameEngine.state).toStrictEqual({
        gameID: 'UUUU',
        players: {
          Tester: {
            avatar: 'axolotl',
            isAdmin: true,
            lastUpdated: 1586640900000,
            nickname: 'Tester',
            floor: 6,
            isReady: false,
            score: 0,
            answers: {},
          },
        },
        isLocked: true,
        turnOrder: ['Beth', 'Tester'],
        turn: 10,
        phase: 'COMPARE',
        turnType: 1,
        currentQuestionID: 'q100',
        usedQuestions: { q1: true, q2: true },
        answersSet: [],
        compare: { matches: {} },
        floorBlockers: {
          1: false,
          2: true,
          3: true,
        },
        result: {
          '1': {},
          '2': {},
          '3': {},
          '4': {},
          '5': {},
          '6': {},
        },
        gameOver: true,
      });
    });

    it('reset', () => {
      // Add properties
      gameEngine.gameID = GAME_ID;
      gameEngine.players = {
        Tester: {
          avatar: 'axolotl',
          isAdmin: true,
          lastUpdated: 1586640900000,
          nickname: NICKNAME,
          floor: 6,
          isReady: false,
          score: 0,
          answers: {},
        },
      };
      gameEngine.isLocked = true;
      gameEngine.turnOrder = ['Beth', NICKNAME];
      gameEngine.turn = 10;
      gameEngine.phase = GAME_PHASES.COMPARE;
      gameEngine.turnType = 1;
      gameEngine.currentQuestionID = 'q100';
      gameEngine.usedQuestions = { q1: true, q2: true };
      gameEngine.answersSet = [];
      gameEngine.compare = { matches: {} };
      gameEngine.floorBlockers = {
        '4': false,
        '5': true,
        '6': true,
      };
      gameEngine.gameOver = true;

      gameEngine.reset();

      expect(gameEngine.state).toStrictEqual({
        gameID: null,
        players: {},
        isLocked: false,
        turnOrder: [],
        turn: 0,
        phase: 'NONE',
        turnType: 1,
        currentQuestionID: null,
        usedQuestions: {},
        answersSet: [],
        compare: null,
        floorBlockers: {
          1: true,
          2: true,
          3: true,
        },
        result: {},
        gameOver: false,
      });

      expect(gameEngine._dbRef).toBeFalsy();
    });
  });

  describe('SETTERS', () => {
    beforeEach(() => {
      gameEngine.me = NICKNAME;
    });

    it('setDbRef', () => {
      expect(gameEngine._dbRef).toBe(null);

      gameEngine.setDbRef('HAHAHA');

      expect(gameEngine._dbRef).toBe('HAHAHA');

      gameEngine.setDbRef('HOHOHO');

      expect(gameEngine._dbRef).toBe('HAHAHA');
    });

    it('setGameID', () => {
      expect(gameEngine.gameID).toBe(null);

      gameEngine.setGameID(GAME_ID);

      expect(gameEngine.gameID).toBe(GAME_ID);

      gameEngine.setGameID('ABCD');

      expect(gameEngine.gameID).toBe('ABCD');
    });

    it('unReadyPlayers', () => {
      expect(gameEngine.isEveryoneReady).toBe(FALSE);

      gameEngine.players = getPlayers({ number: 3, isReady: true });

      expect(gameEngine.isEveryoneReady).toBe(TRUE);

      gameEngine.unReadyPlayers();

      expect(gameEngine.isEveryoneReady).toBe(FALSE);
    });
  });

  describe('SAVERS', () => {
    beforeEach(() => {
      gameEngine.me = NICKNAME;
      gameEngine._dbRef = mockFirebaseDbRef();
      gameEngine.avatars = [...AVATARS];
      gameEngine._isAdmin = false;
    });

    it('setPlayer for the first time', () => {
      gameEngine.setPlayer(NICKNAME);

      expect(gameEngine._dbRef.update2).toHaveBeenCalledWith({
        Tester: {
          answers: {},
          avatar: 'axolotl',
          floor: 6,
          isReady: false,
          lastUpdated: 1586640900000,
          nickname: 'Tester',
          score: 0,
        },
      });
    });

    it('setPlayer for admin', () => {
      gameEngine._isAdmin = true;
      gameEngine.setPlayer(NICKNAME);

      expect(gameEngine._dbRef.update2).toHaveBeenCalledWith({
        Tester: {
          answers: {},
          avatar: 'axolotl',
          floor: 6,
          isAdmin: true,
          isReady: false,
          lastUpdated: 1586640900000,
          nickname: 'Tester',
          score: 0,
        },
      });
    });

    it('setPlayer for returning player', () => {
      gameEngine.players = getPlayers({ number: 2 });
      gameEngine.setPlayer('Beth');

      expect(gameEngine._dbRef.update2).toHaveBeenCalledWith({
        Beth: {
          answers: {},
          avatar: 'cardinal',
          floor: 6,
          isReady: false,
          isAdmin: false,
          lastUpdated: 1586640900000,
          nickname: 'Beth',
          score: 0,
        },
      });
    });

    it('setPlayer errors when game is full', () => {
      gameEngine.players = getPlayers({ number: 12 });

      function catcher() {
        gameEngine.setPlayer('John');
      }

      expect(catcher).toThrowError('Game is full, try a different game ID');

      expect(gameEngine._dbRef.update2).not.toHaveBeenCalled();
    });

    it('setPlayer errors when game is lock and is new player', () => {
      gameEngine.players = getPlayers({ number: 3 });
      gameEngine.isLocked = true;

      function catcher() {
        gameEngine.setPlayer('John');
      }

      expect(catcher).toThrowError('Game is locked, you can not join this time');

      expect(gameEngine._dbRef.update2).not.toHaveBeenCalled();
    });

    it('lockAndStart', () => {
      gameEngine.players = getPlayers({ number: 3 });

      gameEngine.lockAndStart();

      const args = gameEngine._dbRef.update.mock.calls[0][0];

      expect(gameEngine._dbRef.update).toHaveBeenCalledWith({
        isLocked: true,
        lastUpdatedBy: 'Tester',
        phase: GAME_PHASES.ANNOUNCEMENT,
        turn: 1,
        turnOrder: args.turnOrder,
        turnType: 1,
      });
    });

    it('refresh', () => {
      gameEngine.players = getPlayers({ number: 1, isOnline: false });

      gameEngine.refresh();

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({ lastUpdated: 1586640900000 });
    });

    it('setUserReady', () => {
      gameEngine.setUserReady();

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        isReady: true,
        lastUpdated: 1586640900000,
      });
    });

    it('goToQuestionPhase', () => {
      gameEngine.save = jest.fn();

      gameEngine.goToQuestionPhase();

      expect(gameEngine.save).toHaveBeenCalledWith({
        phase: GAME_PHASES.QUESTION,
        lastUpdatedBy: NICKNAME,
      });
    });

    it('goToAnswerPhase', () => {
      gameEngine.save = jest.fn();
      gameEngine.usedQuestions = { q1: true, q2: true };

      gameEngine.goToAnswerPhase('q3');

      expect(gameEngine.save).toHaveBeenCalledWith({
        currentQuestionID: 'q3',
        lastUpdatedBy: 'Tester',
        phase: 'ANSWER',
        players: {},
        usedQuestions: { q1: true, q2: true, q3: true },
      });
    });

    it('submitAnswers', () => {
      gameEngine.currentQuestionID = 'q1';

      gameEngine.submitAnswers(['ALPHA', 'BRAVO', 'CHARLIE']);

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        answers: {
          'q1;Tester;0': { isMatch: false, text: 'ALPHA' },
          'q1;Tester;1': { isMatch: false, text: 'BRAVO' },
          'q1;Tester;2': { isMatch: false, text: 'CHARLIE' },
        },
        isReady: true,
        lastUpdated: 1586640900000,
      });
    });

    it('goToComparePhase', () => {
      // jest doesn't test Array.flat
      // gameEngine.save = jest.fn();
      // gameEngine.players = deepCopy(mockPlayersComparePhase);
      // gameEngine.goToComparePhase();
      // expect(gameEngine.save).toHaveBeenCalledWith({});
    });

    it('prepareCompare', () => {
      gameEngine.save = jest.fn();
      gameEngine.players = deepCopy(mockPlayersComparePhase);
      gameEngine.answersSet = ['FOXTROT', 'ECHO', 'DELTA', 'CHARLIE', 'BRAVO', 'ALPHA'];

      gameEngine.prepareCompare();

      expect(gameEngine.save).toHaveBeenCalledWith({
        answersSet: ['FOXTROT', 'ECHO', 'DELTA', 'CHARLIE', 'BRAVO'],
        compare: {
          currentAnswer: 'ALPHA',
          matches: {
            Beth: { answer: 'ALPHA', answerId: 'q1;Beth;0', isLocked: true },
            Cam: { answer: 'ALPHA', answerId: 'q1;Cam;2', isLocked: true },
          },
        },
        lastUpdatedBy: 'Tester',
        phase: 'COMPARE',
        players: {
          Beth: {
            answers: {
              'q1;Beth;0': { isMatch: true, text: 'ALPHA' },
              'q1;Beth;1': { isMatch: false, text: 'DELTA' },
              'q1;Beth;2': { isMatch: false, text: 'ECHO' },
            },
            avatar: 'cardinal',
            floor: 6,
            isAdmin: false,
            isReady: false,
            lastUpdated: 1586640900000,
            nickname: 'Beth',
            score: 0,
          },
          Cam: {
            answers: {
              'q1;Cam;0': { isMatch: false, text: 'ECHO' },
              'q1;Cam;1': { isMatch: false, text: 'CHARLIE' },
              'q1;Cam;2': { isMatch: true, text: 'ALPHA' },
            },
            avatar: 'fox',
            floor: 6,
            isAdmin: false,
            isReady: false,
            lastUpdated: 1586640900000,
            nickname: 'Cam',
            score: 0,
          },
          Tester: {
            answers: {
              'q1;Tester;0': { isMatch: false, text: 'FOXTROT' },
              'q1;Tester;1': { isMatch: false, text: 'BRAVO' },
              'q1;Tester;2': { isMatch: false, text: 'CHARLIE' },
            },
            avatar: 'axolotl',
            floor: 6,
            isAdmin: true,
            isReady: false,
            lastUpdated: 1586640900000,
            nickname: 'Tester',
            score: 0,
          },
        },
      });
    });

    it('addMatch', () => {
      gameEngine.save = jest.fn();
      gameEngine.players = deepCopy(mockPlayersComparePhase);
      gameEngine.compare = deepCopy(mockCompare);

      gameEngine.addMatch('q1;Tester;0', NICKNAME);

      expect(gameEngine.save).toHaveBeenCalledWith({
        compare: {
          currentAnswer: 'ALPHA',
          matches: {
            Beth: { answer: 'ALPHA', answerId: 'q1;Beth;0', isLocked: true },
            Tester: {
              answer: 'FOXTROT',
              answerId: 'q1;Tester;0',
              downvotes: { Tester: true },
              isLocked: false,
            },
          },
        },
        lastUpdatedBy: 'Tester',
        players: {
          Beth: {
            answers: {
              'q1;Beth;0': { isMatch: false, text: 'ALPHA' },
              'q1;Beth;1': { isMatch: false, text: 'DELTA' },
              'q1;Beth;2': { isMatch: false, text: 'ECHO' },
            },
            avatar: 'cardinal',
            floor: 6,
            isAdmin: false,
            isReady: false,
            lastUpdated: 1586640900000,
            nickname: 'Beth',
            score: 0,
          },
          Cam: {
            answers: {
              'q1;Cam;0': { isMatch: false, text: 'ECHO' },
              'q1;Cam;1': { isMatch: false, text: 'CHARLIE' },
              'q1;Cam;2': { isMatch: false, text: 'ALPHA' },
            },
            avatar: 'fox',
            floor: 6,
            isAdmin: false,
            isReady: false,
            lastUpdated: 1586640900000,
            nickname: 'Cam',
            score: 0,
          },
          Tester: {
            answers: {
              'q1;Tester;0': { isMatch: true, text: 'FOXTROT' },
              'q1;Tester;1': { isMatch: false, text: 'BRAVO' },
              'q1;Tester;2': { isMatch: false, text: 'CHARLIE' },
            },
            avatar: 'axolotl',
            floor: 6,
            isAdmin: true,
            isReady: false,
            lastUpdated: 1586640900000,
            nickname: 'Tester',
            score: 0,
          },
        },
      });

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        answers: {
          'q1;Tester;0': { isMatch: true, text: 'FOXTROT' },
          'q1;Tester;1': { isMatch: false, text: 'BRAVO' },
          'q1;Tester;2': { isMatch: false, text: 'CHARLIE' },
        },
        lastUpdated: 1586640900000,
      });
    });

    it('removeMatch', () => {
      gameEngine.save = jest.fn();
      gameEngine.players = deepCopy(mockPlayersRemoveMatch);
      gameEngine.compare = deepCopy(mockCompare);

      gameEngine.removeMatch('q1;Tester;0', NICKNAME);

      expect(gameEngine.save).toHaveBeenCalledWith({
        compare: {
          currentAnswer: 'ALPHA',
          matches: { Beth: { answer: 'ALPHA', answerId: 'q1;Beth;0', isLocked: true }, Tester: {} },
        },
        lastUpdatedBy: 'Tester',
      });

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        answers: {
          'q1;Tester;0': { isMatch: false, text: 'FOXTROT' },
          'q1;Tester;1': { isMatch: false, text: 'BRAVO' },
          'q1;Tester;2': { isMatch: false, text: 'CHARLIE' },
        },
        lastUpdated: 1586640900000,
      });
    });

    it('voteForAnswer to add downvote', () => {
      gameEngine.save = jest.fn();
      gameEngine.compare = deepCopy(mockCompareUpvote);

      gameEngine.voteForAnswer('Cam', NICKNAME);

      expect(gameEngine.save).toHaveBeenCalledWith({
        compare: {
          ...deepCopy(mockCompareDownvote),
        },
        lastUpdatedBy: 'Tester',
      });
    });

    it('voteForAnswer to remove downvote', () => {
      gameEngine.save = jest.fn();
      gameEngine.compare = deepCopy(mockCompareDownvote);

      gameEngine.voteForAnswer('Cam', NICKNAME);

      expect(gameEngine.save).toHaveBeenCalledWith({
        compare: {
          ...deepCopy(mockCompareUpvote),
        },
        lastUpdatedBy: 'Tester',
      });
    });

    it('doneComparing', () => {
      gameEngine.doneComparing();

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        isReady: true,
        lastUpdated: 1586640900000,
      });
    });

    describe('score', () => {
      beforeEach(() => {
        gameEngine.save = jest.fn();
        gameEngine.answersSet = ['ALPHA', 'BRAVO', 'CHARLIE', 'FOXTROT'];
      });

      it('for 3 players with little downvote', () => {
        gameEngine.players = deepCopy(mockPlayersRemoveMatch);
        gameEngine.compare = deepCopy(mockCompareUpvote);

        gameEngine.score();

        expect(gameEngine.save).toHaveBeenCalledWith({
          answersSet: ['BRAVO', 'CHARLIE'],
          compare: {
            currentAnswer: 'ALPHA',
            matches: {
              Beth: { answer: 'ALPHA', answerId: 'q1;Beth;0', isLocked: true },
              Cam: {
                answer: 'FOXTROT',
                answerId: 'q1;Cam;0',
                downvotes: { Cam: true },
                isLocked: false,
              },
            },
          },
          lastUpdatedBy: 'Tester',
          players: {
            Beth: {
              answers: {
                'q1;Beth;0': { isMatch: false, text: 'ALPHA' },
                'q1;Beth;1': { isMatch: false, text: 'DELTA' },
                'q1;Beth;2': { isMatch: false, text: 'ECHO' },
              },
              avatar: 'cardinal',
              floor: 6,
              isAdmin: false,
              isReady: false,
              lastUpdated: 1586640900000,
              nickname: 'Beth',
              score: 2,
            },
            Cam: {
              answers: {
                'q1;Cam;0': { isMatch: false, text: 'ECHO' },
                'q1;Cam;1': { isMatch: false, text: 'CHARLIE' },
                'q1;Cam;2': { isMatch: false, text: 'ALPHA' },
              },
              avatar: 'fox',
              floor: 6,
              isAdmin: false,
              isReady: false,
              lastUpdated: 1586640900000,
              nickname: 'Cam',
              score: 2,
            },
            Tester: {
              answers: {
                'q1;Tester;0': { isMatch: true, text: 'FOXTROT' },
                'q1;Tester;1': { isMatch: false, text: 'BRAVO' },
                'q1;Tester;2': { isMatch: false, text: 'CHARLIE' },
              },
              avatar: 'axolotl',
              floor: 6,
              isAdmin: true,
              isReady: false,
              lastUpdated: 1586640900000,
              nickname: 'Tester',
              score: 0,
            },
          },
        });
      });

      it('for 3 players with large downvote', () => {
        gameEngine.players = deepCopy(mockPlayersRemoveMatch);
        gameEngine.compare = deepCopy(mockCompareDownvote);

        gameEngine.score();

        expect(gameEngine.save).toHaveBeenCalledWith({
          answersSet: ['BRAVO', 'CHARLIE', 'FOXTROT'],
          compare: {
            currentAnswer: 'ALPHA',
            matches: { Beth: { answer: 'ALPHA', answerId: 'q1;Beth;0', isLocked: true } },
          },
          lastUpdatedBy: 'Tester',
          players: {
            Beth: {
              answers: {
                'q1;Beth;0': { isMatch: false, text: 'ALPHA' },
                'q1;Beth;1': { isMatch: false, text: 'DELTA' },
                'q1;Beth;2': { isMatch: false, text: 'ECHO' },
              },
              avatar: 'cardinal',
              floor: 6,
              isAdmin: false,
              isReady: false,
              lastUpdated: 1586640900000,
              nickname: 'Beth',
              score: 1,
            },
            Cam: {
              answers: {
                'q1;Cam;0': { isMatch: false, text: 'ECHO' },
                'q1;Cam;1': { isMatch: false, text: 'CHARLIE' },
                'q1;Cam;2': { isMatch: false, text: 'ALPHA' },
              },
              avatar: 'fox',
              floor: 6,
              isAdmin: false,
              isReady: false,
              lastUpdated: 1586640900000,
              nickname: 'Cam',
              score: 0,
            },
            Tester: {
              answers: {
                'q1;Tester;0': { isMatch: true, text: 'FOXTROT' },
                'q1;Tester;1': { isMatch: false, text: 'BRAVO' },
                'q1;Tester;2': { isMatch: false, text: 'CHARLIE' },
              },
              avatar: 'axolotl',
              floor: 6,
              isAdmin: true,
              isReady: false,
              lastUpdated: 1586640900000,
              nickname: 'Tester',
              score: 0,
            },
          },
        });
      });
    });

    describe('turnResult', () => {
      beforeEach(() => {
        gameEngine.save = jest.fn();
        gameEngine.floorBlockers = {
          1: true,
          2: true,
          3: true,
        };
      });

      describe('turnType 1: one up', () => {
        beforeEach(() => {
          gameEngine.turnType = 1;
        });

        it('single lowest', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [5, 6, 4, 3, 4],
            floor: [6, 6, 6, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': {},
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Cam: { action: 'STAY', from: 6, name: 'Cam', score: 4, to: 6 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 3, to: 5 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                  Tester: { action: 'STAY', from: 6, name: 'Tester', score: 5, to: 6 },
                },
              },
            })
          );
        });

        it('multiple lowest', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 3, 3, 4],
            floor: [6, 6, 6, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': {},
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Cam: { action: 'MOVE_UP', from: 6, name: 'Cam', score: 3, to: 5 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 3, to: 5 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                  Tester: { action: 'MOVE_UP', from: 6, name: 'Tester', score: 3, to: 5 },
                },
              },
            })
          );
        });

        it('single lowest, removing blocker', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 4, 5, 4],
            floor: [3, 3, 4, 6, 3],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {
                  Beth: { action: 'STAY', from: 3, name: 'Beth', score: 6, to: 3 },
                  Evan: { action: 'STAY', from: 3, name: 'Evan', score: 4, to: 3 },
                  Tester: { action: 'SAVE', from: 3, name: 'Tester', score: 3, to: 3 },
                },
                '4': { Cam: { action: 'STAY', from: 4, name: 'Cam', score: 4, to: 4 } },
                '5': {},
                '6': { Danny: { action: 'STAY', from: 6, name: 'Danny', score: 5, to: 6 } },
              },
            })
          );
        });

        it('multiple lowest, removing blockers', () => {
          gameEngine.floorBlockers = {
            1: true,
            2: false,
            3: false,
          };
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 3, 5, 3],
            floor: [2, 3, 4, 6, 3],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': false, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': { Tester: { action: 'MOVE_UP', from: 2, name: 'Tester', score: 3, to: 1 } },
                '3': {
                  Beth: { action: 'STAY', from: 3, name: 'Beth', score: 6, to: 3 },
                  Evan: { action: 'MOVE_UP', from: 3, name: 'Evan', score: 3, to: 2 },
                },
                '4': { Cam: { action: 'MOVE_UP', from: 4, name: 'Cam', score: 3, to: 3 } },
                '5': {},
                '6': { Danny: { action: 'STAY', from: 6, name: 'Danny', score: 5, to: 6 } },
              },
            })
          );
        });

        it('single lowest, game over', () => {
          gameEngine.floorBlockers = {
            1: false,
            2: false,
            3: false,
          };
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 4, 2, 4],
            floor: [1, 6, 6, 1, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': false, '2': false, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: TRUE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {
                  Danny: { action: 'GAME_OVER', from: 1, name: 'Danny', score: 2, to: 0 },
                  Tester: { action: 'STAY', from: 1, name: 'Tester', score: 3, to: 1 },
                },
                '2': {},
                '3': {},
                '4': {},
                '5': {},
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Cam: { action: 'STAY', from: 6, name: 'Cam', score: 4, to: 6 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                },
              },
            })
          );
        });

        it('multiple lowest, game over', () => {
          gameEngine.floorBlockers = {
            1: false,
            2: false,
            3: false,
          };
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 3, 3, 4],
            floor: [1, 6, 5, 2, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': false, '2': false, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: TRUE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': { Tester: { action: 'GAME_OVER', from: 1, name: 'Tester', score: 3, to: 0 } },
                '2': { Danny: { action: 'MOVE_UP', from: 2, name: 'Danny', score: 3, to: 1 } },
                '3': {},
                '4': {},
                '5': { Cam: { action: 'MOVE_UP', from: 5, name: 'Cam', score: 3, to: 4 } },
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                },
              },
            })
          );
        });
      });

      describe('turnType 2: two up', () => {
        beforeEach(() => {
          gameEngine.turnType = 2;
        });

        it('one each for lowest', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 4, 2, 4],
            floor: [6, 6, 5, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': { Cam: { action: 'STAY', from: 5, name: 'Cam', score: 4, to: 5 } },
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 2, to: 5 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                  Tester: { action: 'MOVE_UP', from: 6, name: 'Tester', score: 3, to: 5 },
                },
              },
            })
          );
        });

        it('multiple for second lowest', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 3, 2, 4],
            floor: [6, 6, 5, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': { Cam: { action: 'MOVE_UP', from: 5, name: 'Cam', score: 3, to: 4 } },
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 2, to: 5 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                  Tester: { action: 'MOVE_UP', from: 6, name: 'Tester', score: 3, to: 5 },
                },
              },
            })
          );
        });

        it('multiple for second lowest removing blockers', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 3, 2, 4],
            floor: [3, 6, 4, 3, 4],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {
                  Danny: { action: 'SAVE', from: 3, name: 'Danny', score: 2, to: 3 },
                  Tester: { action: 'SAVE', from: 3, name: 'Tester', score: 3, to: 3 },
                },
                '4': {
                  Cam: { action: 'MOVE_UP', from: 4, name: 'Cam', score: 3, to: 3 },
                  Evan: { action: 'STAY', from: 4, name: 'Evan', score: 4, to: 4 },
                },
                '5': {},
                '6': { Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 } },
              },
            })
          );
        });

        it('with game over', () => {
          gameEngine.floorBlockers = {
            1: false,
            2: false,
            3: false,
          };
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 3, 2, 4],
            floor: [1, 6, 5, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': false, '2': false, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: TRUE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': { Tester: { action: 'GAME_OVER', from: 1, name: 'Tester', score: 3, to: 0 } },
                '2': {},
                '3': {},
                '4': {},
                '5': { Cam: { action: 'MOVE_UP', from: 5, name: 'Cam', score: 3, to: 4 } },
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 2, to: 5 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                },
              },
            })
          );
        });
      });

      describe('turnType 3: three up', () => {
        beforeEach(() => {
          gameEngine.turnType = 3;
        });

        it('one each for lowest', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 4, 2, 6],
            floor: [6, 6, 5, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': { Cam: { action: 'MOVE_UP', from: 5, name: 'Cam', score: 4, to: 4 } },
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 2, to: 5 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 6, to: 6 },
                  Tester: { action: 'MOVE_UP', from: 6, name: 'Tester', score: 3, to: 5 },
                },
              },
            })
          );
        });

        it('multiple for third lowest', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [4, 4, 3, 2, 4],
            floor: [6, 6, 5, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': { Cam: { action: 'MOVE_UP', from: 5, name: 'Cam', score: 3, to: 4 } },
                '6': {
                  Beth: { action: 'MOVE_UP', from: 6, name: 'Beth', score: 4, to: 5 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 2, to: 5 },
                  Evan: { action: 'MOVE_UP', from: 6, name: 'Evan', score: 4, to: 5 },
                  Tester: { action: 'MOVE_UP', from: 6, name: 'Tester', score: 4, to: 5 },
                },
              },
            })
          );
        });

        it('multiple for third lowest removing blockers', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 4, 2, 4],
            floor: [6, 6, 3, 6, 4],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': { Cam: { action: 'SAVE', from: 3, name: 'Cam', score: 4, to: 3 } },
                '4': { Evan: { action: 'MOVE_UP', from: 4, name: 'Evan', score: 4, to: 3 } },
                '5': {},
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 2, to: 5 },
                  Tester: { action: 'MOVE_UP', from: 6, name: 'Tester', score: 3, to: 5 },
                },
              },
            })
          );
        });

        it('with game over', () => {
          gameEngine.floorBlockers = {
            1: false,
            2: false,
            3: false,
          };
          gameEngine.players = getPlayers({
            number: 5,
            scores: [4, 6, 3, 2, 4],
            floor: [1, 6, 5, 6, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': false, '2': false, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: TRUE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': { Tester: { action: 'GAME_OVER', from: 1, name: 'Tester', score: 4, to: 0 } },
                '2': {},
                '3': {},
                '4': {},
                '5': { Cam: { action: 'MOVE_UP', from: 5, name: 'Cam', score: 3, to: 4 } },
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Danny: { action: 'MOVE_UP', from: 6, name: 'Danny', score: 2, to: 5 },
                  Evan: { action: 'MOVE_UP', from: 6, name: 'Evan', score: 4, to: 5 },
                },
              },
            })
          );
        });
      });

      describe('turnType 0: one up, one down', () => {
        beforeEach(() => {
          gameEngine.turnType = 0;
        });

        it('one up, one down', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 4, 2, 5],
            floor: [5, 5, 5, 5, 5],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': {
                  Beth: { action: 'MOVE_DOWN', from: 5, name: 'Beth', score: 6, to: 6 },
                  Cam: { action: 'STAY', from: 5, name: 'Cam', score: 4, to: 5 },
                  Danny: { action: 'MOVE_UP', from: 5, name: 'Danny', score: 2, to: 4 },
                  Evan: { action: 'STAY', from: 5, name: 'Evan', score: 5, to: 5 },
                  Tester: { action: 'STAY', from: 5, name: 'Tester', score: 3, to: 5 },
                },
                '6': {},
              },
            })
          );
        });

        it('multiple moving down', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [4, 4, 3, 2, 4],
            floor: [5, 5, 5, 5, 5],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': true },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': {},
                '4': {},
                '5': {
                  Beth: { action: 'MOVE_DOWN', from: 5, name: 'Beth', score: 4, to: 6 },
                  Cam: { action: 'STAY', from: 5, name: 'Cam', score: 3, to: 5 },
                  Danny: { action: 'MOVE_UP', from: 5, name: 'Danny', score: 2, to: 4 },
                  Evan: { action: 'MOVE_DOWN', from: 5, name: 'Evan', score: 4, to: 6 },
                  Tester: { action: 'MOVE_DOWN', from: 5, name: 'Tester', score: 4, to: 6 },
                },
                '6': {},
              },
            })
          );
        });

        it('one moving down, one moving up removing blockers', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 4, 2, 4],
            floor: [5, 5, 5, 3, 5],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': { Danny: { action: 'SAVE', from: 3, name: 'Danny', score: 2, to: 3 } },
                '4': {},
                '5': {
                  Beth: { action: 'MOVE_DOWN', from: 5, name: 'Beth', score: 6, to: 6 },
                  Cam: { action: 'STAY', from: 5, name: 'Cam', score: 4, to: 5 },
                  Evan: { action: 'STAY', from: 5, name: 'Evan', score: 4, to: 5 },
                  Tester: { action: 'STAY', from: 5, name: 'Tester', score: 3, to: 5 },
                },
                '6': {},
              },
            })
          );
        });

        it('saved from game over', () => {
          gameEngine.floorBlockers = {
            1: false,
            2: false,
            3: false,
          };
          gameEngine.players = getPlayers({
            number: 5,
            scores: [7, 6, 3, 2, 4],
            floor: [1, 5, 5, 5, 5],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': false, '2': false, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': { Tester: { action: 'MOVE_DOWN', from: 1, name: 'Tester', score: 7, to: 2 } },
                '2': {},
                '3': {},
                '4': {},
                '5': {
                  Beth: { action: 'STAY', from: 5, name: 'Beth', score: 6, to: 5 },
                  Cam: { action: 'STAY', from: 5, name: 'Cam', score: 3, to: 5 },
                  Danny: { action: 'MOVE_UP', from: 5, name: 'Danny', score: 2, to: 4 },
                  Evan: { action: 'STAY', from: 5, name: 'Evan', score: 4, to: 5 },
                },
                '6': {},
              },
            })
          );
        });

        it('with game over', () => {
          gameEngine.floorBlockers = {
            1: false,
            2: false,
            3: false,
          };
          gameEngine.players = getPlayers({
            number: 5,
            scores: [2, 6, 3, 2, 4],
            floor: [1, 5, 5, 5, 5],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': false, '2': false, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: TRUE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': { Tester: { action: 'GAME_OVER', from: 1, name: 'Tester', score: 2, to: 0 } },
                '2': {},
                '3': {},
                '4': {},
                '5': {
                  Beth: { action: 'MOVE_DOWN', from: 5, name: 'Beth', score: 6, to: 6 },
                  Cam: { action: 'STAY', from: 5, name: 'Cam', score: 3, to: 5 },
                  Danny: { action: 'MOVE_UP', from: 5, name: 'Danny', score: 2, to: 4 },
                  Evan: { action: 'STAY', from: 5, name: 'Evan', score: 4, to: 5 },
                },
                '6': {},
              },
            })
          );
        });

        it('can not go over 6', () => {
          gameEngine.players = getPlayers({
            number: 5,
            scores: [3, 6, 3, 2, 4],
            floor: [4, 6, 5, 3, 6],
          });

          gameEngine.turnResult();

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              floorBlockers: { '1': true, '2': true, '3': false },
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              phase: GAME_PHASES.RESULT,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              gameOver: FALSE,
            })
          );

          expect(gameEngine.save).toHaveBeenCalledWith(
            expect.objectContaining({
              result: {
                '1': {},
                '2': {},
                '3': { Danny: { action: 'SAVE', from: 3, name: 'Danny', score: 2, to: 3 } },
                '4': { Tester: { action: 'STAY', from: 4, name: 'Tester', score: 3, to: 4 } },
                '5': { Cam: { action: 'STAY', from: 5, name: 'Cam', score: 3, to: 5 } },
                '6': {
                  Beth: { action: 'STAY', from: 6, name: 'Beth', score: 6, to: 6 },
                  Evan: { action: 'STAY', from: 6, name: 'Evan', score: 4, to: 6 },
                },
              },
            })
          );
        });
      });
    });

    // it.only('saver', () => {
    //   gameEngine.save = jest.fn();
    //   // Prepare

    //   gameEngine.saver();

    //   expect(gameEngine._dbRef.update).toHaveBeenCalledWith({});

    //   expect(gameEngine.state).toStrictEqual({});
    // });
  });
});
