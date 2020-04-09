import { shuffle } from '../utils';
import { AVATARS, GAME_PHASES } from '../utils/contants';

const getPlayers = (number, avatars, floor = 6) => {
  const result = {};
  const names = [
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

  for (let i = 0; i < number; i++) {
    result[names[i]] = {
      avatar: avatars[i],
      isAdmin: i === 0,
      lastUpdated: Date.now(),
      nickname: names[i],
      floor: typeof floor === 'number' ? floor : floor[i] || 6,
    };
  }
  return result;
};

const basics = {
  gameID: 'ABCD',
  avatars: shuffle(AVATARS),
  phase: GAME_PHASES.WAITING_ROOM,
  turn: 0,
};

const mockTurns = (set) => {
  switch (set) {
    case 'waiting.incomplete':
      return {
        ...basics,
        players: getPlayers(2, basics.avatars),
      };
    case 'waiting.sufficient':
      return {
        ...basics,
        players: getPlayers(4, basics.avatars),
      };
    case 'waiting.full':
      return {
        ...basics,
        players: getPlayers(12, basics.avatars),
      };
    default:
      return {
        ...basics,
      };
  }
};

export default mockTurns;
