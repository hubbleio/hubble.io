function sortReposByDifficulty(a, b) {
  return (a.meta.difficulty || 0) - (b.meta.difficulty || 0);
}

module.exports = {
  repos: {
    byDifficulty: sortReposByDifficulty
  }
}