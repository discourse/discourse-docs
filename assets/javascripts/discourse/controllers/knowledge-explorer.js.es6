import {
  default as computed,
  observes
} from "ember-addons/ember-computed-decorators";

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  queryParams: {
    filterCategory: "category",
    filterTags: "tags",
    searchTerm: "search",
    selectedTopic: "topic"
  },
  topics: Ember.computed.readOnly("model.topics.topic_list.topics"),
  tags: Ember.computed.readOnly("model.tags"),
  filterTags: null,
  filterCategory: null,
  searchTerm: null,

  selectedTopic: null,

  @computed("searchTerm")
  isSearching(searchTerm) {
    return !!searchTerm;
  },

  @computed("isSearching", "topics")
  searchCount(isSearching, topics) {
    if (isSearching) return topics.length;
  },
  emptySearchResults: Ember.computed.equal("searchCount", 0),

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
        filter = filter.replace("|", "|");
        filter = filter.replace(/^\|+|\|+$/g, "");
      } else if (filter) {
        filter = `${filter}|${tag.id}`;
      } else {
        filter = tag.id;
      }

      this.set("filterTags", filter);
    },
    performSearch(term) {
      if (term.length < this.siteSettings.min_search_term_length) {
        return false;
      }

      this.set("searchTerm", term);
      this.send("refreshRoute");
    }
  }
});
