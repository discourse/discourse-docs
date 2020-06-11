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

  didInsertElement() {
    document
      .querySelector(".knowledge-explorer-topic-link")
      .addEventListener("click", e => {
        const topicId = e.currentTarget.attributes["data-topic-id"].value;
        this.selectTopic(topicId);
      });
  },

  actions: {
    sortListActivity() {
      this.sortBy("activity");
      return false;
    },
    sortListTitle() {
      this.sortBy("title");
      return false;
    }
  }
});
