export default Ember.Component.extend({
  classNames: "knowledge-explorer-search",

  performSearch(term) {
    if (term.length < this.siteSettings.min_search_term_length) {
      this.set("searchResults", null);
      return;
    }

    // set search filters

    // query the search api
  },

  actions: {
    onSearchTermChange(e) {
      const term = e.target.value;
      this.set("searchTerm", term);
      Ember.run.debounce(this, this.performSearch, term, 250);
    }
  }
});
