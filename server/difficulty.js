//
// classifyDifficulty(difficulty)
//
// Returns a string that rounds and classifies the difficulty level
// @param difficulty {Number} the difficulty of  > 0 < 10
//
function classifyDifficulty(difficulty) {
  if (difficulty < 4) { return 'easy'; }
  if (difficulty < 7) { return 'intermediate'; }
  return 'advanced';
}

module.exports = classifyDifficulty;