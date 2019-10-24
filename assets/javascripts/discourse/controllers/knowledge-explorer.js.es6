import {
  default as computed,
  observes
} from "ember-addons/ember-computed-decorators";
import KnowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  queryParams: {
    filterCategory: "category",
    filterTags: "tags",
    searchTerm: "search",
    selectedTopic: "topic"
  },
  isLoading: false,
  isLoadingMore: false,
  loadMoreUrl: Ember.computed.alias("model.topics.load_more_url"),
  @computed("loadMoreUrl")
  canLoadMore(loadMoreUrl) {
    if (loadMoreUrl === null || this.isLoadingMore) {
      return false;
    }
    return true;
  },
  isTopicLoading: false,
  topics: Ember.computed.alias("model.topics.topic_list.topics"),
  tags: Ember.computed.readOnly("model.tags"),
  filterTags: null,
  filterCategory: null,
  searchTerm: null,

  selectedTopic: null,
  topic: null,

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
    setSelectedTopic(topicId) {
      this.set("isTopicLoading", true);
      this.set("selectedTopic", topicId);
      KnowledgeExplorer.getTopic(topicId).then(result => {
        this.set("topic", result);
        this.set("isTopicLoading", false);
      });
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
      this.set("selectedTopic", null);
      this.send("refreshModel");
    },
    performSearch(term) {
      if (term === "") {
        this.set("searchTerm", null);
        this.send("refreshModel");
        return false;
      }

      if (term.length < this.siteSettings.min_search_term_length) {
        return false;
      }

      this.set("searchTerm", term);
      this.set("selectedTopic", null);
      this.send("refreshModel");
    },
    loadMore() {
      if (this.canLoadMore) {
        this.set("isLoadingMore", true);

        KnowledgeExplorer.loadMore(this.loadMoreUrl).then(result => {
          let topics = this.topics;

          topics = topics.concat(result.topics.topic_list.topics);

          this.set("topics", topics);
          this.set("loadMoreUrl", result.topics.load_more_url || null);
          this.set("isLoadingMore", false);
        });
      }
    },
    refreshModel() {
      this.set("isLoading", true);
      const params = this.getProperties(
        "filterCategory",
        "filterTags",
        "searchTerm"
      );
      KnowledgeExplorer.list(params).then(result => {
        this.set("model", result);
        this.set("isLoading", false);
      });
    }
  }
});
