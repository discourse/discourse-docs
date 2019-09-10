import {
  default as computed,
  observes
} from "ember-addons/ember-computed-decorators";

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  queryParams: {
    filterCategory: "category",
    filterTags: "tags"
  },
  filterTags: null,
  filterCategory: null,

  searchTerm: null,
  searchResults: null,

  @computed("searchResults")
  hasSearchResults(results) {
    return !!results;
  },

  @computed("searchResults")
  emptySearchResults(results) {
    return results.length === 0;
  },

  @computed("searchResults")
  searchCount(results) {
    return results.length;
  },

  @computed("filterTags")
  filtered(filterTags) {
    return !!filterTags;
  }
});
