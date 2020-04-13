import { shuffle, getRandomItems } from '../utils';
import { AVATARS, GAME_PHASES, ONE_MINUTE, TEST_NOW } from '../utils/contants';

const playersNames = [
  'Adam',
  'Beth',
  'Cam',
  'Danny',
  'Evan',
  'Fred',
  'Gabi',
  'Helen',
  'Ian',
  'Jack',
  'Kelly',
  'Lin',
];

if (process.env.NODE_ENV === 'test') {
  playersNames[0] = 'Tester';
}

export const getAnswers = (nickname) => {
  const answers = getRandomItems(
    ['keys', 'money', 'coin', 'coins', 'hand', 'wallet', 'clips', 'lint', 'fabric'],
    3
  );

  return answers.reduce((acc, answer, index) => {
    const id = `q1;${nickname};${index}`;
    acc[id] = {
      text: answer.toUpperCase(),
      isMatch: false,
    };
    return acc;
  }, {});
};

export const getPlayers = ({
  number,
  floor = 6,
  isReady = false,
  addAnswers = false,
  isOnline = true,
  scores,
}) => {
  const result = {};

  for (let i = 0; i < number; i++) {
    result[playersNames[i]] = {
      avatar: AVATARS[i],
      isAdmin: i === 0,
      lastUpdated: isOnline ? TEST_NOW : TEST_NOW - ONE_MINUTE * 300,
      nickname: playersNames[i],
      floor: typeof floor === 'number' ? floor : floor[i] || 6,
      isReady: Array.isArray(isReady) ? isReady[i] || false : isReady,
      score: scores ? scores[i] || 0 : 0,
      answers: addAnswers ? getAnswers(playersNames[i]) : {},
    };
  }
  return result;
};

export const basics = {
  gameID: 'ABCD',
  avatars: [...AVATARS],
  phase: GAME_PHASES.WAITING_ROOM,
  turn: 0,
  isLocked: true,
  gameOver: false,
  floorBlockers: {
    1: true,
    2: true,
    3: true,
  },
};

const mockTurns = (set) => {
  let players;

  switch (set) {
    case 'waiting.incomplete':
      return {
        ...basics,
        players: getPlayers({ number: 2 }),
        isLocked: false,
      };
    case 'waiting.sufficient':
      return {
        ...basics,
        players: getPlayers({ number: 4 }),
        isLocked: false,
      };
    case 'waiting.full':
      return {
        ...basics,
        players: getPlayers({ number: 12 }),
        isLocked: false,
      };
    case 'announcement':
      players = getPlayers({
        number: 12,
        floor: [6, 6, 6, 6, 6, 5, 4, 4, 6, 2, 2, 6],
        isReady: [false, true, true, true],
      });
      return {
        ...basics,
        phase: GAME_PHASES.ANNOUNCEMENT,
        turn: 1,
        turnType: 1,
        players,
        turnOrder: shuffle(Object.keys(players)),
      };
    case 'announcement.ready':
      players = getPlayers({
        number: 12,
        floor: [6, 6, 6, 6, 6, 5, 4, 4, 6, 2, 2, 6],
        isReady: true,
      });
      return {
        ...basics,
        phase: GAME_PHASES.ANNOUNCEMENT,
        turn: 1,
        turnType: 1,
        players,
        floorBlockers: { 1: true, 2: true, 3: false },
        turnOrder: shuffle(Object.keys(players)),
      };
    case 'question.active':
      players = getPlayers({
        number: 12,
        floor: 6,
        isReady: true,
      });
      return {
        ...basics,
        phase: GAME_PHASES.QUESTION,
        turn: 1,
        turnType: 1,
        players,
        turnOrder: [...playersNames],
      };
    case 'question.passive':
      players = getPlayers({
        number: 12,
        floor: 6,
        isReady: true,
      });
      return {
        ...basics,
        phase: GAME_PHASES.QUESTION,
        turn: 1,
        turnType: 1,
        players,
        turnOrder: [...playersNames].reverse(),
      };
    case 'answer.ready':
      players = getPlayers({
        number: 12,
        floor: 6,
        isReady: true,
        addAnswers: true,
      });
      return {
        ...basics,
        currentQuestionID: 'q1',
        phase: GAME_PHASES.ANSWER,
        turn: 1,
        turnType: 1,
        players,
        turnOrder: [...playersNames],
      };
    case 'answer.ready3':
      players = getPlayers({
        number: 3,
        floor: 6,
        isReady: true,
        addAnswers: true,
      });
      return {
        ...basics,
        currentQuestionID: 'q1',
        phase: GAME_PHASES.ANSWER,
        turn: 1,
        turnType: 1,
        players,
        turnOrder: [...playersNames].slice(0, 3),
      };
    case 'answer.ready4':
      players = getPlayers({
        number: 4,
        floor: 6,
        isReady: true,
        addAnswers: true,
      });
      return {
        ...basics,
        currentQuestionID: 'q1',
        phase: GAME_PHASES.ANSWER,
        turn: 1,
        turnType: 1,
        players,
        turnOrder: [...playersNames].slice(0, 4),
      };
    case 'compare.ready':
      players = getPlayers({
        number: 4,
        floor: 5,
        isReady: [false, true, true, true],
        addAnswers: true,
        score: [5, 3, 6, 4],
      });
      return {
        ...basics,
        currentQuestionID: 'q1',
        phase: GAME_PHASES.COMPARE,
        turn: 1,
        turnType: 1,
        players,
        turnOrder: [...playersNames].slice(0, 4),
      };
    case 'compare.result.animation':
      players = getPlayers({
        number: 12,
        floor: [6, 6, 6, 6, 6, 6, 5, 4, 4, 3, 2, 1],
        isReady: [false, true, true, true, true, true, true, true, true, true, true, true],
        addAnswers: true,
        score: [5, 1, 6, 1, 5, 5, 7, 7, 1, 1, 5, 1],
      });
      return {
        ...basics,
        currentQuestionID: 'q1',
        phase: GAME_PHASES.COMPARE,
        turn: 1,
        turnType: 0,
        players,
        turnOrder: [...playersNames],
        floorBlockers: { 1: false, 2: false, 3: true }, // not possible, only to check anymation
      };
    case 'result':
      players = getPlayers({
        number: 12,
        floor: [6, 6, 6, 6, 6, 6, 5, 4, 4, 3, 2, 1],
        isReady: [false, true, true, true, true, true, true, true, true, true, true, true],
        addAnswers: true,
        score: [5, 1, 6, 1, 5, 5, 7, 7, 1, 1, 5, 1],
      });
      return {
        ...basics,
        currentQuestionID: 'q1',
        phase: GAME_PHASES.RESULT,
        turn: 1,
        turnType: 0,
        players,
        turnOrder: [...playersNames],
        floorBlockers: { 1: false, 2: false, 3: true }, // not possible, only to check anymation
        result: [
          null,
          {
            Lin: {
              action: 'GAME_OVER',
              flavorTextID: 'lft16',
              from: 1,
              name: 'Lin',
              score: 0,
              to: 0,
            },
          },
          {
            Kelly: {
              action: 'MOVE_UP',
              from: 2,
              name: 'Kelly',
              score: 0,
              to: 1,
            },
          },
          {
            Jack: {
              action: 'SAVE',
              from: 3,
              name: 'Jack',
              score: 0,
              to: 3,
            },
          },
          {
            Helen: {
              action: 'MOVE_UP',
              from: 4,
              name: 'Helen',
              score: 0,
              to: 3,
            },
            Ian: {
              action: 'MOVE_UP',
              from: 4,
              name: 'Ian',
              score: 0,
              to: 3,
            },
          },
          {
            Gabi: {
              action: 'MOVE_UP',
              from: 5,
              name: 'Gabi',
              score: 0,
              to: 4,
            },
          },
          {
            Adam: {
              action: 'STAY',
              from: 6,
              name: 'Adam',
              score: 1,
              to: 6,
            },
            Beth: {
              action: 'MOVE_UP',
              from: 6,
              name: 'Beth',
              score: 0,
              to: 5,
            },
            Cam: {
              action: 'MOVE_UP',
              from: 6,
              name: 'Cam',
              score: 0,
              to: 5,
            },
            Danny: {
              action: 'MOVE_UP',
              from: 6,
              name: 'Danny',
              score: 0,
              to: 5,
            },
            Evan: {
              action: 'MOVE_UP',
              from: 6,
              name: 'Evan',
              score: 0,
              to: 5,
            },
            Fred: {
              action: 'MOVE_UP',
              from: 6,
              name: 'Fred',
              score: 0,
              to: 5,
            },
          },
        ],
        gameOver: true,
      };
    default:
      return {
        ...basics,
      };
  }
};

export default mockTurns;
