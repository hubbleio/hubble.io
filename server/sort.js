function sortReposByDifficulty(a, b) {
  return (a.meta && a.meta.difficulty || 0) - (b.meta && b.meta.difficulty || 0);
}

function sortReposByRecency(a, b) {
 return (b.github && b.github.updated_at || 0) - (a.github && a.github.updated_at || 0); 
}

module.exports = {
  repos: {
    byDifficulty: sortReposByDifficulty,
    byRecency: sortReposByRecency,
  }
}