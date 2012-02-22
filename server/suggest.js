var _ = require('underscore');

module.exports = function(repos, tags, index) {

	function tagBasedSuggestion(repo) {
		return (repo.meta && repo.meta.tags || []).map(function(tag) {
			if (tags[tag] && tags[tag].repos) { return tags[tag].repos; }
		});
	}

	function indexBasedSuggestion(repo) {
		return (repo.meta && repo.meta.categories || []).map(function(categoryChain) {
			if (! Array.isArray(categoryChain)) { categoryChain = [categoryChain]; }
			var currentNode = {children: index};
			categoryChain.forEach(function(catNode) {
				currentNode = currentNode.children && currentNode.children[catNode];
			});
			if (currentNode) { return currentNode.repos; }
		});
	}

	function reduce() {
		return _.uniq(_.compact(_.flatten(Array.prototype.slice.call(arguments))));
	}

  function suggest(repo, max) {
  	return _.first(_.without(reduce(
  		tagBasedSuggestion(repo),
  		indexBasedSuggestion(repo)
  	), repo), max);
  }

	return suggest;
};