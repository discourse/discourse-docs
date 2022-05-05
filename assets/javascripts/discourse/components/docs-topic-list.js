import Component from "@ember/component";
import { action } from "@ember/object";
import discourseComputed from "discourse-common/utils/decorators";

export default Component.extend({
  classNames: "docs-topic-list",

  @discourseComputed("order")
  sortTitle(order) {
    return order === "title";
  },

  @discourseComputed("order")
  sortActivity(order) {
    return order === "activity";
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
