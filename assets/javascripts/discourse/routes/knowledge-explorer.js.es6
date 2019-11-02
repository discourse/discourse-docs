import KnowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";

export default Ember.Route.extend({
  queryParams: {
    searchTerm: {
      replace: true
    }
  },

  model(params) {
    return KnowledgeExplorer.list(params);
  }
});
