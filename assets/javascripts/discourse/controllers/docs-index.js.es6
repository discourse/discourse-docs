import Controller, { inject as controller } from "@ember/controller";
import discourseComputed, { on } from "discourse-common/utils/decorators";
import { action } from "@ember/object";
import { alias, equal, gt, readOnly } from "@ember/object/computed";
import Docs from "discourse/plugins/discourse-docs/discourse/models/docs";
import { getOwner } from "@ember/application";

const SHOW_FILTER_AT = 10;

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

  showCategoryFilter: gt("categories.length", SHOW_FILTER_AT),
  categoryFilter: "",
  categorySort: {},

  showTagFilter: gt("tags.length", SHOW_FILTER_AT),
  tagFilter: "",
  tagSort: {},

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
  _setupSorting() {
    this.setProperties({
      categorySort: {
        type: "numeric", // or alpha
        direction: "asc", // or desc
      },
      tagSort: {
        type: "numeric", // or alpha
        direction: "asc", // or desc
      },
    });
  },
  @discourseComputed("categories", "categorySort", "categoryFilter")
  sortedCategories(categories, categorySort, filter) {
    let { type, direction } = categorySort;
    if (type === "numeric") {
      categories = categories.sort((a, b) => {
        return direction === "asc" ? a.count < b.count : a.count > b.count;
      });
    } else {
      categories = categories.sort((a, b) => {
        return direction === "asc"
          ? this.site.categories.findBy("id", a.id).name.toLowerCase() <
              this.site.categories.findBy("id", b.id).name.toLowerCase()
          : this.site.categories.findBy("id", a.id).name.toLowerCase() >
              this.site.categories.findBy("id", b.id).name.toLowerCase();
      });
    }

    if (this.showCategoryFilter) {
      return categories.filter((category) => {
        let categoryData = this.site.categories.findBy("id", category.id);
        return (
          categoryData.name.toLowerCase().indexOf(filter.toLowerCase()) > -1 ||
          (categoryData.description_excerpt &&
            categoryData.description_excerpt
              .toLowerCase()
              .indexOf(filter.toLowerCase()) > -1)
        );
      });
    }

    return categories;
  },

  @discourseComputed("tags", "tagSort", "tagFilter")
  sortedTags(tags, tagSort, filter) {
    let { type, direction } = tagSort;
    if (type === "numeric") {
      tags = tags.sort((a, b) => {
        return direction === "asc" ? a.count < b.count : a.count > b.count;
      });
    } else {
      tags = tags.sort((a, b) => {
        return direction === "asc"
          ? a.id.toLowerCase() < b.id.toLowerCase()
          : a.id.toLowerCase() > b.id.toLowerCase();
      });
    }

    if (this.showTagFilter) {
      return tags.filter((tag) => {
        return tag.id.toLowerCase().indexOf(filter.toLowerCase()) > -1;
      });
    }

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
    let { type, direction } = this.categorySort;
    this.set("categorySort", {
      type: "alpha",
      direction:
        type === "alpha" ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
  },

  @action
  toggleCategoryNumericSort() {
    let { type, direction } = this.categorySort;
    this.set("categorySort", {
      type: "numeric",
      direction:
        type === "numeric" ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
  },

  @action
  toggleTagAlphaSort() {
    let { type, direction } = this.tagSort;
    this.set("tagSort", {
      type: "alpha",
      direction:
        type === "alpha" ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
  },

  @action
  toggleTagNumericSort() {
    let { type, direction } = this.tagSort;
    this.set("tagSort", {
      type: "numeric",
      direction:
        type === "numeric" ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
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
