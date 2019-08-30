import knowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";

export default Ember.Component.extend({
  classNames: "knowledge-explorer-search",

  performSearch(term) {
    if (term.length < this.siteSettings.min_search_term_length) {
      this.set("searchResults", null);
      return;
    }

    // query the search api
    knowledgeExplorer.search(this.get("filteredTags"), term).then(result => {
      this.set("searchResults", result.topics || []);
    });
  },

  actions: {
    onSearchTermChange(e) {
      const term = e.target.value;
      this.set("searchTerm", term);
      Ember.run.debounce(this, this.performSearch, term, 250);
    }
  }
});
