/**
 * Generates a 4-digit game ID
 */
export const generadeID = () => {
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
