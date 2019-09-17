export default Ember.Component.extend({
  classNames: "knowledge-explorer-search",

  actions: {
    onSearchTermChange(event) {
      const term = event.target.value;
      Ember.run.debounce(this, this.onSearch, term, 250);
    }
  }
});
