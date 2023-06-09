import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";
import { getDocs } from "../../lib/get-docs";

export default Component.extend({
  classNames: "docs-topic-list",
  urlPath: getDocs(),

  @discourseComputed("order")
  sortTitle(order) {
    return order === "title";
  },

  @discourseComputed("order")
  sortActivity(order) {
    return order === "activity";
  },

  showExcerpt() {
    return this.siteSettings.docs_show_topic_excerpts;
  },

  @action
  sortListActivity() {
    this.sortBy("activity");
    return false;
  },

  @action
  sortListTitle() {
    this.sortBy("title");
    return false;
  },
});
