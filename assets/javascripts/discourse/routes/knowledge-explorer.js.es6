import { ajax } from "discourse/lib/ajax";

export default Ember.Route.extend({
  model() {
    return ajax("/knowledge-explorer.json");
  },

  setupController(controller, model) {
    controller.setProperties({
      tags: model.tags,
      topics: model.topics
    });
  },

});
