function toString(l) {
  if (l === undefined) {
    throw new Error('Undefined level');
  }
  if (l < 4) {
    return 'beginner';
  }
  if (l < 7) {
    return 'intermediate';
  }
  return 'expert';
}

module.exports = {
  max: 10,
  min: 1,
  strings: ['beginner', 'intermediate', 'expert'],
  beginner: [1, 2, 3],
  intermediate: [4, 5, 6],
  expert: [7, 8, 9],
  toString: toString
};