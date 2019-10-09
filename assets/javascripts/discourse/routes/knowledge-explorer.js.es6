import { ajax } from "discourse/lib/ajax";

export default Ember.Route.extend({
  queryParams: {
    filterTags: {
      refreshModel: true
    },
    searchTerm: {
      replace: true
    },
    selectedTopic: {
      refreshModel: true
    }
  },
  model(params) {
    let filters = [];
    if (params.filterTags) filters.push(`tags=${params.filterTags}`);
    if (params.searchTerm) filters.push(`search=${params.searchTerm}`);

    return ajax(`/knowledge-explorer.json?${filters.join("&")}`);
  },

  actions: {
    refreshRoute() {
      this.refresh();
    }
  }
});
