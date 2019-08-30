import {
  default as computed,
  observes
} from "ember-addons/ember-computed-decorators";

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

  filteredTags: null,
  filteredTopics: null,

  searchTerm: null,
  searchResults: null,

  @computed("searchResults")
  hasSearchResults(results) {
    return !!results;
  },

  @computed("searchResults")
  emptySearchResults(results) {
    return results.length === 0;
  },

  @observes("filterTags")
  filterByTags() {
    const filterTags = this.get("filterTags");
    if (filterTags != null) {
      const filter = filterTags.split(" ");
      const topics = this.get("topics");
      const tags = this.get("tags");

      if (filter != "") {
        const filteredTopics = topics.filter(topic =>
          arrayContainsArray(topic.tags, filter)
        );

        debugger;
        const filteredTags = [];

        // add active tags
        filter.forEach(tag => {
          let t = {
            id: tag,
            count: 0,
            active: true
          };

          filteredTags.push(t);
        });

        filteredTopics.forEach(topic => {
          let topicTags = topic.tags;
          topicTags.forEach(tag => {
            if (filterTags.includes(tag)) {
              //increment count for active tags
              let index = filteredTags.findIndex(t => t.id === tag);
              filteredTags[index].count++;
            } else if (filteredTags.findIndex(t => t.id === tag) != -1) {
              //increment count for seen subtags
              let index = filteredTags.findIndex(t => t.id === tag);
              filteredTags[index].count++;
            } else {
              //add entry for unseen subtag
              let t = {
                id: tag,
                count: 1
              };
              filteredTags.push(t);
            }
          });
        });

        this.set("filteredTags", filteredTags);
        this.set("filteredTopics", filteredTopics);
        this.set("filtered", true);
      } else {
        this.set("filteredTags", null);
        this.set("filteredTopics", null);
        this.set("filterTags", null);
        this.set("filtered", false);
      }
    }
  }
});
