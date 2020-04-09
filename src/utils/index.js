import { ONE_MINUTE, ONLINE_MINIUTE_THRESHOLD } from './contants';

/**
 * Generates a 4-digit game ID
 * @returns {string}
 */
export const generateID = () => {
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  let id = '';

  while (id.length < 4) {
    id += LETTERS[Math.floor(Math.random() * LETTERS.length)];
  }

  return id;
};

/**
 * Shuffles list returning a new shuffled instance
 * @param {array} list
 * @returns {array}
 */
export const shuffle = (list) => {
  const res = [...list];
  res.sort(() => Math.random() - 0.5);
  return res;
};

/**
 * Get n number of items from an array
 * @param {array} list the array where items should be fetched from
 * @param {number} quantity the number of items to be returned
 * @returns {array}
 */
export const getRandomItems = (list, quantity) => {
  const shuffledList = shuffle(list);
  const res = new Array(quantity).fill(null);
  for (let i = 0; i < res.length; i++) {
    const item = shuffledList[i];
    res[i] = item;
  }
  return res;
};

/**
 * Determines if current timestamp is considered online
 * @param {number} timestamp
 * @returns {boolean}
 */
export const isOnline = (timestamp) =>
  Date.now() - timestamp < ONE_MINUTE * ONLINE_MINIUTE_THRESHOLD;

/**
 * Outputs a random number within range
 * @param {number} min the start of the range (default 1)
 * @param {number} max the end of the range (default 10)
 * @returns {number}
 */
export const randomNumber = (min = 1, max = 10) => Math.floor(Math.random() * (max - min) + min);

/**
 * Returns a turn type number based of the turn
 * @param {number} turn the current turn
 * @returns {number} a turn type number (0, 1, 2, 3)
 */
export const getTurnType = (turn) => {
  if (turn < 4) return 1;

  if (turn < 6) return getRandomItems([1, 1, 1, 1, 1, 2, 2, 0], 1)[0];

  return getRandomItems([0, 1, 2, 2, 3, 3], 1)[0];
};
