export const SCREENS = {
  HOME: 'HOME',
  GAME: 'GAME',
};

export const GAME_PHASES = {
  WAITING_ROOM: 'WAITING_ROOM',
  ANNOUNCEMENT: 'ANNOUNCEMENT',
  QUESTION: 'QUESTION',
  ANSWER: 'ANSWER',
  COMPARE: 'COMPARE',
  RESULT: 'RESULT',
  GAME_OVER: 'GAME_OVER',
  NONE: 'NONE',
};

export const COLORS = {
  PRIMARY: '#ffa500',
  SECONDARY: '#594A42',
  RED: '#a01d0b',
};

export const AVATARS = [
  'axolotl',
  'cardinal',
  'fox',
  'hedgehog',
  'lizard',
  'mole',
  'mouse',
  'otter',
  'owl',
  'platypus',
  'rat',
  'squirrel',
  'starling',
  'toad',
  'turtle',
];

export const ONE_MINUTE = 60000;

export const ONLINE_MINIUTE_THRESHOLD = 5;

export const DISCONNECT_MINIUTE_THRESHOLD = 15;

export const TEST_NOW = process.env.NODE_ENV === 'test' ? 1586640900000 : Date.now();

export const ENGINE_TIMEOUT = process.env.NODE_ENV === 'test' ? 0 : 1000;

export const NOOP = () => {};

export const RESULT_ACTION = {
  MOVE_UP: 'MOVE_UP',
  MOVE_DOWN: 'MOVE_DOWN',
  SAVE: 'SAVE',
  STAY: 'STAY',
  GAME_OVER: 'GAME_OVER',
};

export const TURN_TYPES = {
  0: 'The lowest scores move up, the highest scores move down!',
  1: 'The lowest scores move up!',
  2: 'The 2 lowest scores move up!',
  3: 'The 3 lowest scores move up!',
};

export const TURN_TYPES_FLAVOR_TEXT = {
  0: [
    'We found an old newspaper that can be used as toiler paper and whoever has the best score will be awared with it.',
    'I guess we can eat the pillows, so one person can stay.',
    'If we all eat 20% less, we can keep a person longer.',
    "We can't live like this anymore, last give someone a change.",
  ],
  1: [
    'Just one this time. Easy and simple.',
    'Last can of beans!',
    "It's the rules, someone has to go. Food is scarce.",
    "Since we can't tell who used the last drop of hand sanitizer, let's get over with this fast.",
  ],
  2: [
    "If Noah deal with things in pairs, why can't we?",
    'One, two, cha-cha-cha, one, two, cha-cha-cha, this round is like a tango.',
    'The rice is gone!',
    'I guess we could eat past for the 50th time, or... just an idea, move 2 people up.',
  ],
  3: [
    'Someone ate some spicy food and used 3 rolls of toiler paper, I guess we need to kick more people out this time.',
    'Chaos! The virus outside is so crazy, I heard you can get it by twearking.',
    "Uno, dos, tres! That's three people... in Spanish.",
    'Pandemic! Pandemic! Pandemic!',
  ],
};

export const LOSER_FLAVOR_TEXT = {
  lft1: 'died of the virus',
  lft2: 'is making a plan to destroy the bunker in vengeance',
  lft3: 'stole all the toilet paper left right before leaving',
  lft4: 'was murdered withing 2 minutes by wastelanders',
  lft5: 'became a zombie',
  lft6: 'has become immune to the virus',
  lft7: 'has done plastic surgery and switch places with someone here in the bunker. Gasp!',
  lft8: 'fled to the north and created a new society where is considered a God.',
  lft9: 'found the cure for the pandemic, healed the world, and never told you people about it',
  lft10: 'join the wastelanders, and soon became their leader',
  lft11: 'simply disappeard',
  lft12: 'cried',
  lft13: 'found love and lived a long life',
  lft14: 'is happy now',
  lft15: 'died of the virus',
  lft16: 'died of the virus',
  lft17: 'died of the virus',
  lft18: 'died of the virus',
  lft19: 'died of the virus',
  lft20: 'died of the virus',
};

export const MILITARY_ALPHABET = {
  A: 'alpha',
  B: 'bravo',
  C: 'charlie',
  D: 'delta',
  E: 'echo',
  F: 'foxtrot',
  G: 'golf',
  H: 'hotel',
  I: 'india',
  J: 'juliet',
  K: 'kilo',
  L: 'lima',
  M: 'mike',
  N: 'november',
  O: 'oscar',
  P: 'papa',
  Q: 'quebek',
  R: 'romeo',
  S: 'sierra',
  T: 'tango',
  U: 'uniform',
  V: 'victor',
  W: 'whiskey',
  X: 'x-ray',
  Y: 'yankee',
  Z: 'zulu',
};
