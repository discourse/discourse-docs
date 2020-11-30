import Controller from "@ember/controller";
import { inject } from "@ember/controller";
import discourseComputed from "discourse-common/utils/decorators";
import { alias, readOnly, equal } from "@ember/object/computed";
import { on } from "discourse-common/utils/decorators";
import KnowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";
import { getOwner } from "@ember/application";

export default Controller.extend({
  queryParams: {
    ascending: "ascending",
    filterCategories: "category",
    filterTags: "tags",
    filterSolved: "solved",
    orderColumn: "order",
    searchTerm: "search",
    selectedTopic: "topic",
  },
  application: inject(),
  isLoading: false,
  isLoadingMore: false,
  loadMoreUrl: alias("model.topics.load_more_url"),
  isTopicLoading: false,
  categories: readOnly("model.categories"),
  topics: alias("model.topics.topic_list.topics"),
  tags: readOnly("model.tags"),
  filterTags: null,
  filterCategories: null,
  filterSolved: false,
  searchTerm: null,
  selectedTopic: null,
  topic: null,
  expandedFilters: false,
  ascending: null,
  orderColumn: null,
  topicCount: alias("model.topic_count"),

  @on("init")
  _setupFilters() {
    if (!this.site.mobileView) {
      this.set("expandedFilters", true);
    }
  },

  @discourseComputed("topics", "isSearching", "filterSolved")
  emptyTopics(topics, isSearching, filterSolved) {
    const filtered = isSearching || filterSolved;
    return this.topicCount === 0 && !filtered;
  },

  @discourseComputed("loadMoreUrl")
  canLoadMore(loadMoreUrl) {
    return loadMoreUrl === null ? false : true;
  },

  @discourseComputed("searchTerm")
  isSearching(searchTerm) {
    return !!searchTerm;
  },

  @discourseComputed("isSearching", "filterSolved")
  isSearchingOrFiltered(isSearching, filterSolved) {
    return isSearching || filterSolved;
  },

  emptyResults: equal("topicCount", 0),

  @discourseComputed
  canFilterSolved() {
    return (
      this.siteSettings.solved_enabled &&
      this.siteSettings.knowledge_explorer_add_solved_filter
    );
  },

  @discourseComputed("filterTags")
  filtered(filterTags) {
    return !!filterTags;
  },

  actions: {
    setSelectedTopic(topicId) {
      this.set("selectedTopic", topicId);

      window.scrollTo(0, 0);
    },

    onChangeFilterSolved(solvedFilter) {
      this.set("filterSolved", solvedFilter);
    },

    updateSelectedTags(tag) {
      let filter = this.filterTags;
      if (filter && filter.includes(tag.id)) {
        filter = filter.replace(tag.id, "").replace(/^\|+|\|+$/g, "");
      } else if (filter) {
        filter = `${filter}|${tag.id}`;
      } else {
        filter = tag.id;
      }

      this.setProperties({
        filterTags: filter,
        selectedTopic: null,
      });
    },

    updateSelectedCategories(category) {
      let filter = this.filterCategories;
      if (filter && filter.includes(category.id)) {
        filter = filter.replace(category.id, "").replace(/^\|+|\|+$/g, "");
      } else if (filter) {
        filter = `${filter}|${category.id}`;
      } else {
        filter = category.id;
      }

      this.setProperties({
        filterCategories: filter,
        selectedTopic: null,
      });
    },

    performSearch(term) {
      if (term === "") {
        this.set("searchTerm", null);
        return false;
      }

      if (term.length < this.siteSettings.min_search_term_length) {
        return false;
      }

      this.setProperties({
        searchTerm: term,
        selectedTopic: null,
      });
    },

    sortBy(column) {
      const order = this.orderColumn;
      const ascending = this.ascending;
      if (column === "title") {
        this.set("orderColumn", "title");
      } else if (column === "activity") {
        this.set("orderColumn", "activity");
      }

      if (!ascending && order) {
        this.set("ascending", true);
      } else {
        this.set("ascending", "");
      }
    },

    loadMore() {
      if (this.canLoadMore && !this.isLoadingMore) {
        this.set("isLoadingMore", true);

        KnowledgeExplorer.loadMore(this.loadMoreUrl).then((result) => {
          const topics = this.topics.concat(result.topics.topic_list.topics);

          this.setProperties({
            topics,
            loadMoreUrl: result.topics.load_more_url || null,
            isLoadingMore: false,
          });
        });
      }
    },

    toggleFilters() {
      if (!this.expandedFilters) {
        this.set("expandedFilters", true);
      } else {
        this.set("expandedFilters", false);
      }
    },

    returnToList() {
      this.set("selectedTopic", null);
      getOwner(this).lookup("router:main").transitionTo("knowledgeExplorer");
    },
  },
});
