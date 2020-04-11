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
      score: 0,
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
        turnOrder: [...playersNames],
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
        turnOrder: [...playersNames],
      };
    default:
      return {
        ...basics,
      };
  }
};

export default mockTurns;
