const { nanoid } = require('nanoid');

/**
 * Generates a unique team code like BB-X7K2P
 */
const generateTeamCode = () => {
  const prefix = 'BB';
  const unique = nanoid(5).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
  return `${prefix}-${unique}`;
};

module.exports = { generateTeamCode };