import { getOwner } from "@ember/application";
import Controller, { inject as controller } from "@ember/controller";
import { action } from "@ember/object";
import { alias, equal, gt, readOnly } from "@ember/object/computed";
import { htmlSafe } from "@ember/template";
import { on } from "@ember-decorators/object";
import discourseComputed from "discourse/lib/decorators";
import getURL from "discourse/lib/get-url";
import { i18n } from "discourse-i18n";
import Docs from "discourse/plugins/discourse-docs/discourse/models/docs";

const SHOW_FILTER_AT = 10;

export default class DocsIndexController extends Controller {
  @controller application;

  queryParams = [
    {
      ascending: "ascending",
      filterCategories: "category",
      filterTags: "tags",
      filterSolved: "solved",
      orderColumn: "order",
      searchTerm: "search",
      selectedTopic: "topic",
    },
  ];

  isLoading = false;
  isLoadingMore = false;
  isTopicLoading = false;
  filterTags = null;
  filterCategories = null;
  filterSolved = false;
  searchTerm = null;
  selectedTopic = null;
  topic = null;
  expandedFilters = false;
  ascending = null;
  orderColumn = null;

  @gt("categories.length", SHOW_FILTER_AT) showCategoryFilter;
  categoryFilter = "";
  categorySort = {};

  @gt("tags.length", SHOW_FILTER_AT) showTagFilter;
  tagFilter = "";
  tagSort = {};

  @alias("model.topics.load_more_url") loadMoreUrl;
  @readOnly("model.categories") categories;
  @alias("model.topics.topic_list.topics") topics;
  @readOnly("model.tags") tags;
  @readOnly("model.meta.show_topic_excerpts") showExcerpts;
  @readOnly("model.tag_groups") tagGroups;
  @alias("model.topic_count") topicCount;
  @equal("topicCount", 0) emptyResults;

  @on("init")
  _setupFilters() {
    if (!this.site.mobileView) {
      this.set("expandedFilters", true);
    }
    this.setProperties({
      categorySort: {
        type: "numeric", // or alpha
        direction: "desc", // or asc
      },
      tagSort: {
        type: "numeric", // or alpha
        direction: "desc", // or asc
      },
    });
  }

  @discourseComputed("categories", "categorySort", "categoryFilter")
  sortedCategories(categories, categorySort, filter) {
    let { type, direction } = categorySort;
    if (type === "numeric") {
      categories = categories.sort((a, b) => a.count - b.count);
    } else {
      categories = categories.sort((a, b) => {
        const first = this.site.categories
            .findBy("id", a.id)
            .name.toLowerCase(),
          second = this.site.categories.findBy("id", b.id).name.toLowerCase();
        return first.localeCompare(second);
      });
    }

    if (direction === "desc") {
      categories = categories.reverse();
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
  }

  @discourseComputed("categorySort")
  categorySortNumericIcon(catSort) {
    if (catSort.type === "numeric" && catSort.direction === "asc") {
      return "arrow-down-1-9";
    }
    return "arrow-up-1-9";
  }

  @discourseComputed("categorySort")
  categorySortAlphaIcon(catSort) {
    if (catSort.type === "alpha" && catSort.direction === "asc") {
      return "arrow-down-a-z";
    }
    return "arrow-up-a-z";
  }

  @discourseComputed("tags", "tagSort", "tagFilter")
  sortedTags(tags, tagSort, filter) {
    let { type, direction } = tagSort;
    if (type === "numeric") {
      tags = tags.sort((a, b) => a.count - b.count);
    } else {
      tags = tags.sort((a, b) => {
        return a.id.toLowerCase().localeCompare(b.id.toLowerCase());
      });
    }

    if (direction === "desc") {
      tags = tags.reverse();
    }

    if (this.showTagFilter) {
      return tags.filter((tag) => {
        return tag.id.toLowerCase().indexOf(filter.toLowerCase()) > -1;
      });
    }

    return tags;
  }

  @discourseComputed("tagGroups", "tagSort", "tagFilter")
  sortedTagGroups(tagGroups, tagSort, filter) {
    let { type, direction } = tagSort;
    let sortedTagGroups = [...tagGroups];

    if (type === "numeric") {
      sortedTagGroups.forEach((group) => {
        group.totalCount = group.tags.reduce(
          (acc, curr) => acc + curr.count,
          0
        );
      });

      sortedTagGroups.sort((a, b) => b.totalCount - a.totalCount);
    } else {
      sortedTagGroups.sort((a, b) =>
        a.name.toLowerCase().localeCompare(b.name.toLowerCase())
      );
    }

    if (direction === "desc") {
      sortedTagGroups.reverse();
    }

    if (this.showTagFilter) {
      return sortedTagGroups.filter((tag) =>
        tag.id.toLowerCase().includes(filter.toLowerCase())
      );
    }

    return sortedTagGroups;
  }

  @discourseComputed("tagSort")
  tagSortNumericIcon(tagSort) {
    if (tagSort.type === "numeric" && tagSort.direction === "asc") {
      return "arrow-down-1-9";
    }
    return "arrow-up-1-9";
  }

  @discourseComputed("tagSort")
  tagSortAlphaIcon(tagSort) {
    if (tagSort.type === "alpha" && tagSort.direction === "asc") {
      return "arrow-down-a-z";
    }
    return "arrow-up-a-z";
  }

  @discourseComputed("topics", "isSearching", "filterSolved")
  noContent(topics, isSearching, filterSolved) {
    const filtered = isSearching || filterSolved;
    return this.topicCount === 0 && !filtered;
  }

  @discourseComputed("loadMoreUrl")
  canLoadMore(loadMoreUrl) {
    return loadMoreUrl === null ? false : true;
  }

  @discourseComputed("searchTerm")
  isSearching(searchTerm) {
    return !!searchTerm;
  }

  @discourseComputed("isSearching", "filterSolved")
  isSearchingOrFiltered(isSearching, filterSolved) {
    return isSearching || filterSolved;
  }

  @discourseComputed
  canFilterSolved() {
    return (
      this.siteSettings.solved_enabled &&
      this.siteSettings.docs_add_solved_filter
    );
  }

  @discourseComputed("filterTags")
  filtered(filterTags) {
    return !!filterTags;
  }

  @discourseComputed("siteSettings.tagging_enabled", "shouldShowTagsByGroup")
  shouldShowTags(tagging_enabled, shouldShowTagsByGroup) {
    return tagging_enabled && !shouldShowTagsByGroup;
  }

  @discourseComputed(
    "siteSettings.show_tags_by_group",
    "siteSettings.docs_tag_groups"
  )
  shouldShowTagsByGroup(show_tags_by_group, docs_tag_groups) {
    return show_tags_by_group && Boolean(docs_tag_groups);
  }

  @discourseComputed()
  emptyState() {
    let body = i18n("docs.no_docs.body");
    if (this.docsCategoriesAndTags.length) {
      body += i18n("docs.no_docs.to_include_topic_in_docs");
      body += ` (${this.docsCategoriesAndTags.join(", ")}).`;
    } else if (this.currentUser.staff) {
      const setUpPluginMessage = i18n("docs.no_docs.setup_the_plugin", {
        settingsUrl: getURL(
          "/admin/site_settings/category/plugins?filter=plugin:discourse-docs"
        ),
      });
      body += ` ${setUpPluginMessage}`;
    }

    return {
      title: i18n("docs.no_docs.title"),
      body: htmlSafe(body),
    };
  }

  @discourseComputed("docsCategories", "docsTags")
  docsCategoriesAndTags(docsCategories, docsTags) {
    return docsCategories.concat(docsTags);
  }

  @discourseComputed()
  docsCategories() {
    if (!this.siteSettings.docs_categories) {
      return [];
    }

    return this.siteSettings.docs_categories
      .split("|")
      .map((c) => this.site.categories.findBy("id", parseInt(c, 10))?.name)
      .filter(Boolean);
  }

  @discourseComputed()
  docsTags() {
    if (!this.siteSettings.docs_tags) {
      return [];
    }

    return this.siteSettings.docs_tags.split("|").map((t) => `#${t}`);
  }

  @action
  toggleCategorySort(newType) {
    let { type, direction } = this.categorySort;
    this.set("categorySort", {
      type: newType,
      direction:
        type === newType ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
  }

  @action
  toggleTagSort(newType) {
    let { type, direction } = this.tagSort;
    this.set("tagSort", {
      type: newType,
      direction:
        type === newType ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
  }

  @action
  onChangeFilterSolved(event) {
    this.set("filterSolved", event.target.checked);
  }

  @action
  updateSelectedTags(tag) {
    let filter = this.filterTags;
    if (filter && filter.includes(tag.id)) {
      filter = filter
        .split("|")
        .filter((f) => f !== tag.id)
        .join("|");
    } else if (filter) {
      filter = `${filter}|${tag.id}`;
    } else {
      filter = tag.id;
    }

    this.setProperties({
      filterTags: filter,
      selectedTopic: null,
    });
  }

  @action
  updateSelectedCategories(category) {
    const filterCategories =
      category.id === parseInt(this.filterCategories, 10) ? null : category.id;
    this.setProperties({
      filterCategories,
      selectedTopic: null,
    });

    return false;
  }

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
  }

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
  }

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
  }

  @action
  toggleFilters() {
    if (!this.expandedFilters) {
      this.set("expandedFilters", true);
    } else {
      this.set("expandedFilters", false);
    }
  }

  @action
  returnToList() {
    this.set("selectedTopic", null);
    getOwner(this).lookup("service:router").transitionTo("docs");
  }
}
