import { ajax } from "discourse/lib/ajax";

export default Ember.Route.extend({
  queryParams: {
    filterTags: {
      refreshModel: true
    },
    selectedTopic: {
      refreshModel: true
    }
  },
  model(params) {
    if (params.filterTags) {
      const tags = params.filterTags;
      return ajax(`/knowledge-explorer.json?tags=${tags}`);
    } else if (params.selectedTopic) {
      return ajax(`/t/${params.selectedTopic}.json`);
    } else {
      return ajax("/knowledge-explorer.json");
    }
  },

  setupController(controller, model) {
    if (model.tags && model.topics) {
      controller.setProperties({
        tags: model.tags,
        topics: model.topics
      });
    } else {
      controller.setProperties({
        tags: [],
        topics: [],
        topic: model
      });
    }
  }
});
