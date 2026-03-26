import Controller, { inject as controller } from "@ember/controller";
import { action, computed } from "@ember/object";
import { alias, equal, gt, readOnly } from "@ember/object/computed";
import { getOwner } from "@ember/owner";
import { trustHTML } from "@ember/template";
import { on } from "@ember-decorators/object";
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
    if (this.site.desktopView) {
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

  @computed("categories", "categorySort", "categoryFilter")
  get sortedCategories() {
    let { type, direction } = this.categorySort;
    let categories;

    if (type === "numeric") {
      categories = this.categories.sort((a, b) => a.count - b.count);
    } else {
      categories = this.categories.sort((a, b) => {
        const first = this.site.categories
            .find((item) => item.id === a.id)
            .name.toLowerCase(),
          second = this.site.categories
            .find((item) => item.id === b.id)
            ?.name.toLowerCase();
        return first.localeCompare(second);
      });
    }

    if (direction === "desc") {
      categories = categories.reverse();
    }

    if (this.showCategoryFilter) {
      return categories.filter((category) => {
        let categoryData = this.site.categories.find(
          (item) => item.id === category.id
        );
        return (
          categoryData.name
            .toLowerCase()
            .includes(this.categoryFilter.toLowerCase()) ||
          categoryData.description_excerpt
            ?.toLowerCase()
            .includes(this.categoryFilter.toLowerCase())
        );
      });
    }

    return categories;
  }

  @computed("categorySort")
  get categorySortNumericIcon() {
    if (
      this.categorySort.type === "numeric" &&
      this.categorySort.direction === "asc"
    ) {
      return "arrow-down-1-9";
    }
    return "arrow-up-1-9";
  }

  @computed("categorySort")
  get categorySortAlphaIcon() {
    if (
      this.categorySort.type === "alpha" &&
      this.categorySort.direction === "asc"
    ) {
      return "arrow-down-a-z";
    }
    return "arrow-up-a-z";
  }

  @computed("tags", "tagSort", "tagFilter")
  get sortedTags() {
    let { type, direction } = this.tagSort;
    let tags;

    if (type === "numeric") {
      tags = this.tags.sort((a, b) => a.count - b.count);
    } else {
      tags = this.tags.sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    }

    if (direction === "desc") {
      tags = tags.reverse();
    }

    if (this.showTagFilter) {
      return tags.filter((tag) => {
        return tag.name.toLowerCase().includes(this.tagFilter.toLowerCase());
      });
    }

    return tags;
  }

  @computed("tagGroups", "tagSort", "tagFilter")
  get sortedTagGroups() {
    let { type, direction } = this.tagSort;
    let sortedTagGroups = [...(this.tagGroups || [])];

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
      return sortedTagGroups.filter((tagGroup) =>
        tagGroup.name.toLowerCase().includes(this.tagFilter.toLowerCase())
      );
    }

    return sortedTagGroups;
  }

  @computed("tagSort")
  get tagSortNumericIcon() {
    if (this.tagSort.type === "numeric" && this.tagSort.direction === "asc") {
      return "arrow-down-1-9";
    }
    return "arrow-up-1-9";
  }

  @computed("tagSort")
  get tagSortAlphaIcon() {
    if (this.tagSort.type === "alpha" && this.tagSort.direction === "asc") {
      return "arrow-down-a-z";
    }
    return "arrow-up-a-z";
  }

  @computed("topics", "isSearching", "filterSolved")
  get noContent() {
    const filtered = this.isSearching || this.filterSolved;
    return this.topicCount === 0 && !filtered;
  }

  @computed("loadMoreUrl")
  get canLoadMore() {
    return this.loadMoreUrl === null ? false : true;
  }

  @computed("searchTerm")
  get isSearching() {
    return !!this.searchTerm;
  }

  @computed("isSearching", "filterSolved")
  get isSearchingOrFiltered() {
    return this.isSearching || this.filterSolved;
  }

  @computed
  get canFilterSolved() {
    return (
      this.siteSettings.solved_enabled &&
      this.siteSettings.docs_add_solved_filter
    );
  }

  @computed("filterTags")
  get filtered() {
    return !!this.filterTags;
  }

  @computed("siteSettings.tagging_enabled", "shouldShowTagsByGroup")
  get shouldShowTags() {
    return this.siteSettings?.tagging_enabled && !this.shouldShowTagsByGroup;
  }

  @computed("siteSettings.show_tags_by_group", "siteSettings.docs_tag_groups")
  get shouldShowTagsByGroup() {
    return (
      this.siteSettings?.show_tags_by_group &&
      Boolean(this.siteSettings?.docs_tag_groups)
    );
  }

  @computed()
  get emptyState() {
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
      body: trustHTML(body),
    };
  }

  @computed("docsCategories", "docsTags")
  get docsCategoriesAndTags() {
    return this.docsCategories.concat(this.docsTags);
  }

  @computed()
  get docsCategories() {
    if (!this.siteSettings.docs_categories) {
      return [];
    }

    return this.siteSettings.docs_categories
      .split("|")
      .map(
        (c) =>
          this.site.categories.find((item) => item.id === parseInt(c, 10))?.name
      )
      .filter(Boolean);
  }

  @computed()
  get docsTags() {
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
  updateSelectedTags(tag, event) {
    event?.preventDefault();

    let filter = this.filterTags;
    if (filter && filter.includes(tag.name)) {
      filter = filter
        .split("|")
        .filter((f) => f !== tag.name)
        .join("|");
    } else if (filter) {
      filter = `${filter}|${tag.name}`;
    } else {
      filter = tag.name;
    }

    this.setProperties({
      filterTags: filter,
      selectedTopic: null,
    });
  }

  @action
  updateSelectedCategories(category, event) {
    event?.preventDefault();

    const filterCategories =
      category.id === parseInt(this.filterCategories, 10) ? null : category.id;
    this.setProperties({
      filterCategories,
      selectedTopic: null,
    });
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
