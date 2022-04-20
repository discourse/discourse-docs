import Controller, { inject as controller } from "@ember/controller";
import discourseComputed, { on } from "discourse-common/utils/decorators";
import { action } from "@ember/object";
import { alias, equal, gt, readOnly } from "@ember/object/computed";
import Docs from "discourse/plugins/discourse-docs/discourse/models/docs";
import { getOwner } from "@ember/application";
import getURL from "discourse-common/lib/get-url";
import I18n from "I18n";

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
    timeRange: "time",
    filterGroups: "groups",
  },

  application: controller(),

  isLoading: false,
  isLoadingMore: false,
  isTopicLoading: false,
  filterTags: null,
  filterGroups: null,
  filterCategories: null,
  filterSolved: false,
  searchTerm: null,
  selectedTopic: null,
  topic: null,
  expandedFilters: false,
  ascending: null,
  orderColumn: null,
  timeRange: null,

  showCategoryFilter: gt("categories.length", SHOW_FILTER_AT),
  categoryFilter: "",
  categorySort: {},

  showTagFilter: gt("tags.length", SHOW_FILTER_AT),
  tagFilter: "",
  tagSort: {},

  showGroupFilter: gt("groups.length", SHOW_FILTER_AT),
  groupFilter: "",
  groupSort: {},

  loadMoreUrl: alias("model.topics.load_more_url"),
  categories: readOnly("model.categories"),
  topics: alias("model.topics.topic_list.topics"),
  tags: readOnly("model.tags"),
  topicCount: alias("model.topic_count"),
  emptyResults: equal("topicCount", 0),
  groups: readOnly("model.groups"),

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
      groupSort: {
        type: "numeric", // or alpha
        direction: "desc", // or asc
      }
    });
  },
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
  },

  @discourseComputed("categorySort")
  categorySortNumericIcon(catSort) {
    if (catSort.type === "numeric" && catSort.direction === "asc") {
      return "sort-numeric-down";
    }
    return "sort-numeric-up";
  },

  @discourseComputed("categorySort")
  categorySortAlphaIcon(catSort) {
    if (catSort.type === "alpha" && catSort.direction === "asc") {
      return "sort-alpha-down";
    }
    return "sort-alpha-up";
  },

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
  },

  @discourseComputed("tagSort")
  tagSortNumericIcon(tagSort) {
    if (tagSort.type === "numeric" && tagSort.direction === "asc") {
      return "sort-numeric-down";
    }
    return "sort-numeric-up";
  },

  @discourseComputed("tagSort")
  tagSortAlphaIcon(tagSort) {
    if (tagSort.type === "alpha" && tagSort.direction === "asc") {
      return "sort-alpha-down";
    }
    return "sort-alpha-up";
  },

  @discourseComputed("groups", "groupSort", "groupFilter")
  sortedGroups(groups, groupSort, filter) {
    console.log(this.title);
    let { type, direction } = groupSort;
    if (type === "numeric") {
      groups = groups.sort((a, b) => a.count - b.count);
    } else {
      groups = groups.sort((a, b) => {
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
      });
    }

    if (direction === "desc") {
      groups = groups.reverse();
    }

    if (this.showGroupFilter) {
      return groups.filter((group) => {
        return group.name.toLowerCase().indexOf(filter.toLowerCase()) > -1;
      });
    }

    return groups;
  },

  @discourseComputed("groupSort")
  groupSortNumericIcon(groupSort) {
    if (groupSort.type === "numeric" && groupSort.direction === "asc") {
      return "sort-numeric-down";
    }
    return "sort-numeric-up";
  },

  @discourseComputed("groupSort")
  groupSortAlphaIcon(groupSort) {
    if (groupSort.type === "alpha" && groupSort.direction === "asc") {
      return "sort-alpha-down";
    }
    return "sort-alpha-up";
  },

  @discourseComputed("groups")
  listUserGroups(groups) {
    return groups
  },

  @discourseComputed("topics", "isSearching", "filterSolved")
  noContent(topics, isSearching, filterSolved) {
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

  @discourseComputed()
  shouldShowTags() {
    return this.siteSettings.tagging_enabled;
  },

  @discourseComputed()
  emptyState() {
    let body = I18n.t("docs.no_docs.body");
    if (this.docsCategoriesAndTags.length) {
      body += I18n.t("docs.no_docs.to_include_topic_in_docs");
      body += ` (${this.docsCategoriesAndTags.join(", ")}).`;
    } else if (this.currentUser.staff) {
      const setUpPluginMessage = I18n.t("docs.no_docs.setup_the_plugin", {
        settingsUrl: getURL(
          "/admin/site_settings/category/plugins?filter=plugin:discourse-docs"
        ),
      });
      body += ` ${setUpPluginMessage}`;
    }

    return {
      title: I18n.t("docs.no_docs.title"),
      body: body.htmlSafe(),
    };
  },

  @discourseComputed("docsCategories", "docsTags")
  docsCategoriesAndTags(docsCategories, docsTags) {
    return docsCategories.concat(docsTags);
  },

  @discourseComputed()
  docsCategories() {
    if (!this.siteSettings.docs_categories) {
      return [];
    }

    return this.siteSettings.docs_categories.split("|").map((c) => {
      const id = parseInt(c, 10);
      return this.site.categories.findBy("id", id).name;
    });
  },

  @discourseComputed()
  docsTags() {
    if (!this.siteSettings.docs_tags) {
      return [];
    }

    return this.siteSettings.docs_tags.split("|").map((t) => `#${t}`);
  },

  @action
  toggleCategorySort(newType) {
    let { type, direction } = this.categorySort;
    this.set("categorySort", {
      type: newType,
      direction:
        type === newType ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
  },

  @action
  toggleTagSort(newType) {
    let { type, direction } = this.tagSort;
    this.set("tagSort", {
      type: newType,
      direction:
        type === newType ? (direction === "asc" ? "desc" : "asc") : "asc",
    });
  },

  @action
  toggleGroupSort(newType) {
    let { type, direction } = this.groupSort;
    this.set("groupSort", {
      type: newType,
      direction:
        type === newType ? (direction === "asc" ? "desc" : "asc") : "asc",
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
    let filter = this.filterTags && this.filterTags.split('|');

    if (!filter) filter = tag.id
    else {
      if (filter.includes(tag.id)) filter = filter.filter((currTag) => currTag !== tag.id)
      else filter.push(tag.id)
      filter = filter.join('|')
    }

    this.setProperties({
      filterTags: filter,
      selectedTopic: null,
    });
  },

  @action
  updateSelectedGroups(group) {
    let filter = this.filterGroups && this.filterGroups.split('|');

    if (!filter) filter = group.name
    else {
      if (filter.includes(group.name)) filter = filter.filter((currGroup) => currGroup !== group.name)
      else filter.push(group.name)
      filter = filter.join('|')
    }

    this.setProperties({
      filterGroups: filter,
      selectedTopic: null,
    });
  },

  @action
  updateSelectedCategories(category) {
    let filter = this.filterCategories && this.filterCategories.split(',').map((cat) => +cat)

    if (!filter) filter = category.id
    else {
      if (filter.includes(category.id)) filter = filter.filter((currCat) => currCat !== category.id)
      else filter.push(category.id)
      filter = filter.join(',')
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
