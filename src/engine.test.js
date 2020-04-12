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
        lastUpdatedBy: NICKNAME,
        phase: GAME_PHASES.ANSWER,
        currentQuestionID: 'q3',
        usedQuestions: {
          q1: true,
          q2: true,
          q3: true,
        },
        players: {},
      });
    });

    it('submitAnswers', () => {
      gameEngine.currentQuestionID = 'q1';

      gameEngine.submitAnswers(['ALPHA', 'BRAVO', 'CHARLIE']);

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        isReady: true,
        lastUpdated: 1586640900000,
        answers: {
          'q1;Tester;0': {
            isMatch: false,
            text: 'ALPHA',
          },
          'q1;Tester;1': {
            isMatch: false,
            text: 'BRAVO',
          },
          'q1;Tester;2': {
            isMatch: false,
            text: 'CHARLIE',
          },
        },
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
        lastUpdatedBy: NICKNAME,
        phase: GAME_PHASES.COMPARE,
        players: gameEngine.players,
        answersSet: ['FOXTROT', 'ECHO', 'DELTA', 'CHARLIE', 'BRAVO'],
        compare: {
          currentAnswer: 'ALPHA',
          matches: {
            Beth: {
              answer: 'ALPHA',
              answerId: 'q1;Beth;0',
              isLocked: true,
            },
            Cam: {
              answer: 'ALPHA',
              answerId: 'q1;Cam;2',
              isLocked: true,
            },
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
        lastUpdatedBy: 'Tester',
        compare: {
          currentAnswer: 'ALPHA',
          matches: {
            Beth: {
              answer: 'ALPHA',
              answerId: 'q1;Beth;0',
              isLocked: true,
            },
            Tester: {
              answer: 'FOXTROT',
              answerId: 'q1;Tester;0',
              downvotes: {
                Tester: true,
              },
              isLocked: false,
            },
          },
        },
        players: {
          Tester: {
            avatar: 'axolotl',
            isAdmin: true,
            lastUpdated: 1586640900000,
            nickname: 'Tester',
            floor: 6,
            isReady: false,
            score: 0,
            answers: {
              'q1;Tester;0': {
                isMatch: true,
                text: 'FOXTROT',
              },
              'q1;Tester;1': {
                isMatch: false,
                text: 'BRAVO',
              },
              'q1;Tester;2': {
                isMatch: false,
                text: 'CHARLIE',
              },
            },
          },
          Beth: {
            avatar: 'cardinal',
            isAdmin: false,
            lastUpdated: 1586640900000,
            nickname: 'Beth',
            floor: 6,
            isReady: false,
            score: 0,
            answers: {
              'q1;Beth;0': {
                isMatch: false,
                text: 'ALPHA',
              },
              'q1;Beth;1': {
                isMatch: false,
                text: 'DELTA',
              },
              'q1;Beth;2': {
                isMatch: false,
                text: 'ECHO',
              },
            },
          },
          Cam: {
            avatar: 'fox',
            isAdmin: false,
            lastUpdated: 1586640900000,
            nickname: 'Cam',
            floor: 6,
            isReady: false,
            score: 0,
            answers: {
              'q1;Cam;0': {
                isMatch: false,
                text: 'ECHO',
              },
              'q1;Cam;1': {
                isMatch: false,
                text: 'CHARLIE',
              },
              'q1;Cam;2': {
                isMatch: false,
                text: 'ALPHA',
              },
            },
          },
        },
      });

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        answers: {
          'q1;Tester;0': {
            isMatch: true,
            text: 'FOXTROT',
          },
          'q1;Tester;1': {
            isMatch: false,
            text: 'BRAVO',
          },
          'q1;Tester;2': {
            isMatch: false,
            text: 'CHARLIE',
          },
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
        lastUpdatedBy: 'Tester',
        compare: {
          currentAnswer: 'ALPHA',
          matches: {
            Beth: {
              answer: 'ALPHA',
              answerId: 'q1;Beth;0',
              isLocked: true,
            },
            Tester: {},
          },
        },
      });

      expect(gameEngine._dbRef.child).toHaveBeenCalledWith('players');
      expect(gameEngine._dbRef.child2).toHaveBeenCalledWith(NICKNAME);
      expect(gameEngine._dbRef.update3).toHaveBeenCalledWith({
        answers: {
          'q1;Tester;0': {
            isMatch: false,
            text: 'FOXTROT',
          },
          'q1;Tester;1': {
            isMatch: false,
            text: 'BRAVO',
          },
          'q1;Tester;2': {
            isMatch: false,
            text: 'CHARLIE',
          },
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
              Beth: {
                answer: 'ALPHA',
                answerId: 'q1;Beth;0',
                isLocked: true,
              },
              Cam: {
                answer: 'FOXTROT',
                answerId: 'q1;Cam;0',
                downvotes: {
                  Cam: true,
                },
                isLocked: false,
              },
            },
          },
          lastUpdatedBy: 'Tester',
          players: mockResultsScore3PlayersUpvoted,
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
            matches: {
              Beth: {
                answer: 'ALPHA',
                answerId: 'q1;Beth;0',
                isLocked: true,
              },
            },
          },
          lastUpdatedBy: 'Tester',
          players: mockResultsScore3PlayersDownvoted,
        });
      });
    });

    describe('turnResult', () => {
      beforeEach(() => {
        gameEngine.save = jest.fn();
      });

      describe('turnType 1: one up', () => {
        beforeEach(() => {
          gameEngine.save = jest.fn();
        });

        // it('single lowest', () => {
        //   gameEngine.players = getPlayers({ number: 5, scores: [5, 6, 4, 3, 4] });

        //   gameEngine.turnResult();

        //   expect(gameEngine.save).toHaveBeenCalledWith({});
        // });
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
