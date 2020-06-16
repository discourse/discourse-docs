import discourseComputed from "discourse-common/utils/decorators";
import Category from "discourse/models/category";
import Topic from "discourse/models/topic";
import { on } from "discourse-common/utils/decorators";
import KnowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";

function mergeCategories(results) {
  const categories = Category.list();
  const topics = results.topics.topic_list.topics.map(t => {
    t.category = categories.findBy("id", t.category_id);
    return t;
  });

  results.topics.topic_list.topics = topics;

  return results;
}

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  queryParams: {
    ascending: "ascending",
    filterCategories: "category",
    filterTags: "tags",
    filterSolved: "solved",
    orderColumn: "order",
    searchTerm: "search",
    selectedTopic: "topic"
  },
  isLoading: false,
  isLoadingMore: false,
  loadMoreUrl: Ember.computed.alias("model.topics.load_more_url"),
  isTopicLoading: false,
  categories: Ember.computed.readOnly("model.categories"),
  topics: Ember.computed.alias("model.topics.topic_list.topics"),
  tags: Ember.computed.readOnly("model.tags"),
  filterTags: null,
  filterCategories: null,
  filterSolved: false,
  searchTerm: null,
  selectedTopic: null,
  topic: null,
  expandedFilters: false,
  ascending: null,
  orderColumn: null,

  @on("init")
  _setupFilters() {
    if (!this.site.mobileView) {
      this.set("expandedFilters", true);
    }
  },

  @discourseComputed("topics", "isSearching")
  emptyTopics(topics, isSearching) {
    return topics.length === 0 && !isSearching ? true : false;
  },

  @discourseComputed("loadMoreUrl")
  canLoadMore(loadMoreUrl) {
    return loadMoreUrl === null ? false : true;
  },

  @discourseComputed("searchTerm")
  isSearching(searchTerm) {
    return !!searchTerm;
  },

  @discourseComputed("isSearching", "topics")
  searchCount(isSearching, topics) {
    if (isSearching) return topics.length;
  },

  emptySearchResults: Ember.computed.equal("searchCount", 0),

  @discourseComputed
  canFilterSolved() {
    return this.siteSettings.solved_enabled;
  },

  @discourseComputed("filterTags")
  filtered(filterTags) {
    return !!filterTags;
  },

  actions: {
    setSelectedTopic(topicId) {
      this.setProperties({
        isTopicLoading: true,
        selectedTopic: topicId
      });

      KnowledgeExplorer.getTopic(topicId).then(result => {
        this.setProperties({
          topic: Topic.create(result),
          isTopicLoading: false
        });
      });
    },

    onChangeFilterSolved(solvedFilter) {
      this.set("filterSolved", solvedFilter);
      this.send("refreshModel");
    },

    updateSelectedTags(tag) {
      let filter = this.filterTags;
      if (filter && filter.includes(tag.id)) {
        filter = filter
          .replace(tag.id, "")
          .replace("|", "|")
          .replace(/^\|+|\|+$/g, "");
      } else if (filter) {
        filter = `${filter}|${tag.id}`;
      } else {
        filter = tag.id;
      }

      this.setProperties({
        filterTags: filter,
        selectedTopic: null
      });

      this.send("refreshModel");
    },
    updateSelectedCategories(category) {
      let filter = this.filterCategories;
      if (filter && filter.includes(category.id)) {
        filter = filter
          .replace(category.id, "")
          .replace("|", "|")
          .replace(/^\|+|\|+$/g, "");
      } else if (filter) {
        filter = `${filter}|${category.id}`;
      } else {
        filter = category.id;
      }

      this.setProperties({
        filterCategories: filter,
        selectedTopic: null
      });

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

      this.setProperties({
        searchTerm: term,
        selectedTopic: null
      });

      this.send("refreshModel");
    },

    sortBy(column) {
      const order = this.orderColumn;
      const ascending = this.ascending;
      if (column === "title") {
        this.set("orderColumn", "title");
      } else if (column === "activity") {
        this.set("orderColumn", "activity");
      }

      if (!ascending && order) this.set("ascending", true);
      else this.set("ascending", "");

      this.send("refreshModel");
    },

    loadMore() {
      if (this.canLoadMore && !this.isLoadingMore) {
        this.set("isLoadingMore", true);

        KnowledgeExplorer.loadMore(this.loadMoreUrl).then(result => {
          result = mergeCategories(result);
          const topics = this.topics.concat(result.topics.topic_list.topics);

          this.setProperties({
            topics,
            loadMoreUrl: result.topics.load_more_url || null,
            isLoadingMore: false
          });
        });
      }
    },

    refreshModel() {
      this.set("isLoading", true);

      const params = this.getProperties(
        "filterCategories",
        "filterTags",
        "filterSolved",
        "searchTerm",
        "ascending",
        "orderColumn"
      );

      KnowledgeExplorer.list(params).then(result => {
        result = mergeCategories(result);
        this.setProperties({
          model: result,
          isLoading: false
        });
      });
    },

    toggleFilters() {
      if (!this.expandedFilters) {
        this.set("expandedFilters", true);
      } else {
        this.set("expandedFilters", false);
      }
    }
  }
});
