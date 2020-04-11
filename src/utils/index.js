import { ONE_MINUTE, ONLINE_MINIUTE_THRESHOLD, TURN_TYPES_FLAVOR_TEXT } from './contants';
import QUESTIONS from './questions.json';

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
 * Gets random item from list of items
 * @param {array} items the list of items
 * @returns {any} a random item from list of items
 */
export const getRandomItem = (items) => {
  return items[Math.floor(Math.random() * items.length)];
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

/**
 * Returns a random flavor text for the round
 * @param {number} turnType the current turn type
 * @param {number} turn the current turn
 * @return {string} the flavor text
 */
export const getTurnTypeFlavorText = (turnType, turn) => {
  const flavorTexts = TURN_TYPES_FLAVOR_TEXT[turnType];
  return flavorTexts[(turn - 1) % flavorTexts.length];
};

/**
 * Selects 4 random unique questions
 * @param {object} usedQuestions an object containing questions previously used
 * @returns array with the selected questions
 */
export const getUniqueQuestions = (usedQuestions) => {
  const selectedQuestions = {};

  while (Object.keys(selectedQuestions).length !== 4) {
    const currentQuestion = getRandomItem(Object.values(QUESTIONS));

    // Use question only if it has not been used or selected yet
    if (!usedQuestions[currentQuestion.id] && !selectedQuestions[currentQuestion.id]) {
      selectedQuestions[currentQuestion.id] = currentQuestion;
    }
  }
  return Object.values(selectedQuestions);
};

/**
 * Gets the question from the questions json file that matches given id
 * @param {string} questionID the unique question id
 * @returns {object} the question object with question, id, and answers
 */
export const getQuestion = (questionID) => {
  return QUESTIONS[questionID];
};

/**
 * Cheaply deep copyes object
 * @param {object} obj
 * @returns deep copied object
 */
export const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};
