import Controller, { inject as controller } from "@ember/controller";
import discourseComputed, { on } from "discourse-common/utils/decorators";
import { action } from "@ember/object";
import { alias, equal, readOnly } from "@ember/object/computed";
import Docs from "discourse/plugins/discourse-docs/discourse/models/docs";
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

  application: controller(),

  isLoading: false,
  isLoadingMore: false,
  isTopicLoading: false,
  filterTags: null,
  filterCategories: null,
  filterSolved: false,
  searchTerm: null,
  selectedTopic: null,
  topic: null,
  expandedFilters: false,
  ascending: null,
  orderColumn: null,

  categorySortAlpha: 0,
  categorySortNumeric: 1,
  categorySort: "numeric",
  categoryFilter: "",

  tagSortAlpha: 0,
  tagSortNumeric: 1,
  tagSort: "numeric",
  tagFilter: "",

  loadMoreUrl: alias("model.topics.load_more_url"),
  categories: readOnly("model.categories"),
  topics: alias("model.topics.topic_list.topics"),
  tags: readOnly("model.tags"),
  topicCount: alias("model.topic_count"),
  emptyResults: equal("topicCount", 0),

  @on("init")
  _setupFilters() {
    if (!this.site.mobileView) {
      this.set("expandedFilters", true);
    }
  },
  @discourseComputed(
    "categories",
    "categorySortAlpha",
    "categorySortNumeric",
    "categorySort",
    "categoryFilter"
  )
  sortedCategories(categories, sortAlpha, sortNumeric, sortBy, filter) {
    if (sortBy === "numeric") {
      if (sortNumeric === 1) {
        categories = categories.sort((a, b) => {
          return b.count > a.count;
        });
      } else {
        categories = categories.sort((a, b) => {
          return a.count > b.count;
        });
      }
    } else {
      if (sortAlpha === 1) {
        categories = categories.sort((a, b) => {
          return (
            this.site.categories.findBy("id", a.id).name.toLowerCase() <
            this.site.categories.findBy("id", b.id).name.toLowerCase()
          );
        });
      } else {
        categories = categories.sort((a, b) => {
          return (
            this.site.categories.findBy("id", a.id).name.toLowerCase() >
            this.site.categories.findBy("id", b.id).name.toLowerCase()
          );
        });
      }
    }

    categories = categories.filter((category) => {
      let categoryData = this.site.categories.findBy("id", category.id);
      return (
        categoryData.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
        (categoryData.description_excerpt &&
          categoryData.description_excerpt
            .toLowerCase()
            .indexOf(filter.toLowerCase()) > -1)
      );
    });

    return categories;
  },

  @discourseComputed(
    "tags",
    "tagSortAlpha",
    "tagSortNumeric",
    "tagSort",
    "tagFilter"
  )
  sortedTags(tags, sortAlpha, sortNumeric, sortBy, filter) {
    if (sortBy === "numeric") {
      if (sortNumeric === 1) {
        tags = tags.sort((a, b) => {
          return b.count > a.count;
        });
      } else {
        tags = tags.sort((a, b) => {
          return a.count > b.count;
        });
      }
    } else {
      if (sortAlpha === 1) {
        tags = tags.sort((a, b) => {
          return a.id.toLowerCase() < b.id.toLowerCase();
        });
      } else {
        tags = tags.sort((a, b) => {
          return a.id.toLowerCase() > b.id.toLowerCase();
        });
      }
    }

    tags = tags.filter((tag) => {
      return tag.id.toLowerCase().indexOf(filter.toLowerCase()) > -1;
    });

    return tags;
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

  @discourseComputed
  canFilterSolved() {
    return (
      this.siteSettings.solved_enabled &&
      this.siteSettings.docs_add_solved_filter
    );
  },

  @discourseComputed("filterTags")
  filtered(filterTags) {
    return !!filterTags;
  },

  @action
  toggleCategoryAlphaSort() {
    this.set("categorySort", "alpha");
    if (this.categorySortAlpha === -1 || this.categorySortAlpha === 0) {
      this.set("categorySortAlpha", 1);
    } else {
      this.set("categorySortAlpha", -1);
    }
  },

  @action
  toggleCategoryNumericSort() {
    this.set("categorySort", "numeric");
    if (this.categorySortNumeric === -1 || this.categorySortNumeric === 0) {
      this.set("categorySortNumeric", 1);
    } else {
      this.set("categorySortNumeric", -1);
    }
  },

  @action
  toggleTagAlphaSort() {
    this.set("tagSort", "alpha");
    if (this.tagSortAlpha === -1 || this.tagSortAlpha === 0) {
      this.set("tagSortAlpha", 1);
    } else {
      this.set("tagSortAlpha", -1);
    }
  },

  @action
  toggleTagNumericSort() {
    this.set("tagSort", "numeric");
    if (this.tagSortNumeric === -1 || this.tagSortNumeric === 0) {
      this.set("tagSortNumeric", 1);
    } else {
      this.set("tagSortNumeric", -1);
    }
  },

  @action
  setSelectedTopic(topicId) {
    this.set("selectedTopic", topicId);

    window.scrollTo(0, 0);
  },

  @action
  onChangeFilterSolved(solvedFilter) {
    this.set("filterSolved", solvedFilter);
  },

  @action
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

  @action
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

    return false;
  },

  @action
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

  @action
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

  @action
  loadMore() {
    if (this.canLoadMore && !this.isLoadingMore) {
      this.set("isLoadingMore", true);

      Docs.loadMore(this.loadMoreUrl).then((result) => {
        const topics = this.topics.concat(result.topics.topic_list.topics);

        this.setProperties({
          topics,
          loadMoreUrl: result.topics.load_more_url || null,
          isLoadingMore: false,
        });
      });
    }
  },

  @action
  toggleFilters() {
    if (!this.expandedFilters) {
      this.set("expandedFilters", true);
    } else {
      this.set("expandedFilters", false);
    }
  },

  @action
  returnToList() {
    this.set("selectedTopic", null);
    getOwner(this).lookup("router:main").transitionTo("docs");
  },
});
