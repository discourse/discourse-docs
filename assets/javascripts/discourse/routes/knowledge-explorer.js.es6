import { ajax } from "discourse/lib/ajax";

export default Ember.Route.extend({
  queryParams: {
    filterTags: {
      refreshModel: true
    }
  },
  model(params) {
    if (params.filterTags) {
      const tags = params.filterTags;
      return ajax(`/knowledge-explorer.json?tags=${tags}`);
    } else {
      return ajax("/knowledge-explorer.json");
    }
  },

  setupController(controller, model) {
    controller.setProperties({
      tags: model.tags,
      topics: model.topics
    });
  }
});
