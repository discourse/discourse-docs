import {
  default as computed,
  observes
} from "ember-addons/ember-computed-decorators";
import knowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  queryParams: {
    filterCategory: "category",
    filterTags: "tags",
    selectedTopic: "topic"
  },
  filterTags: null,
  filterCategory: null,

  searchTerm: null,
  searchResults: null,

  selectedTopic: null,

  searchCount: Ember.computed.readOnly("searchResults.length"),
  emptySearchResults: Ember.computed.equal("searchCount", 0),

  @computed("searchResults")
  hasSearchResults(results) {
    return !!results;
  },

  @computed("filterTags")
  filtered(filterTags) {
    return !!filterTags;
  },

  actions: {
    setSelectedTopic(topicID) {
      this.set("selectedTopic", topicID);
    },
    updateSelectedTags(tag) {
      let filter = this.filterTags;
      if (filter && filter.includes(tag.id)) {
        filter = filter.replace(tag.id, "");
        filter = filter.replace("++", "+");
        filter = filter.replace(/^\++|\++$/g, "");
      } else if (filter) {
        filter = `${filter}+${tag.id}`;
      } else {
        filter = tag.id;
      }

      this.set("filterTags", filter);
    },
    performSearch(term) {
      if (term.length < this.siteSettings.min_search_term_length) {
        this.set("searchResults", null);
        return false;
      }

      const tags = this.get("filterTags") || null;

      knowledgeExplorer.search(term, tags).then(result => {
        this.set("searchResults", result.topics || []);
      });
    }
  }
});
