import debounce from "discourse/lib/debounce";

export default Ember.Component.extend({
  classNames: "knowledge-explorer-search",

  didUpdateAttrs() {
    this._super(...arguments);

    Ember.run.schedule("afterRender", () => {
      document.querySelector(".knowledge-explorer-search-bar").focus();
    });
  },

  debouncedSearch: debounce(function(term) {
    this.onSearch(term);
  }, 500),

  actions: {
    onSearchTermChange(term) {
      this.debouncedSearch(term);
    }
  }
});
