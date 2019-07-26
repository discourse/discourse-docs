import { observes } from "ember-addons/ember-computed-decorators";

function arrayContainsArray(superset, subset) {
  if (0 === subset.length) {
    return false;
  }
  return subset.every(v => superset.indexOf(v) >= 0);
}

export default Ember.Controller.extend({
  application: Ember.inject.controller(),
  queryParams: {
    filterCategory: "category",
    filterTags: "tags"
  },
  filtered: false,
  filterTags: null,
  filterCategory: null,

  filteredTopics: null,

  @observes("filterTags")
  filterByTags() {
    debugger;
    const filterTags = this.get("filterTags");
    if (filterTags != null) {
      const filter = filterTags.split(" ");
      const topics = this.get("topics");
      const tags = this.get("tags");

      if (filter != "") {
        const filteredTopics = topics.filter(topic =>
          arrayContainsArray(topic.tags, filter)
        );
        this.set("filteredTopics", filteredTopics);
        this.set("filtered", true);
      } else {
        this.set("filteredTopics", null);
        this.set("filterTags", null);
        this.set("filtered", false);
      }
    }
  }
});
