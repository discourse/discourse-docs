import discourseComputed from "discourse-common/utils/decorators";

export default Ember.Component.extend({
  classNames: "knowledge-explorer-topic-list",
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
    if (e.target.classList.contains("knowledge-explorer-topic-link")) {
      const topicId = e.target.dataset.topicId;
      this.selectTopic(topicId);
      return false;
    }
  },

  actions: {
    sortListActivity() {
      this.sortBy("activity");
      return false;
    },
    sortListTitle() {
      this.sortBy("title");
      return false;
    },
  },
});
