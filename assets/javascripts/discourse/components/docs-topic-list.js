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

  // need to handle clicks here since links are in a raw view
  click(e) {
    if (e.target.classList.contains("docs-topic-link")) {
      const topicId = e.target.dataset.topicId;
      this.selectTopic(topicId);
      return false;
    }
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
