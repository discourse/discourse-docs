import { ajax } from "discourse/lib/ajax";
import knowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";

export default Ember.Route.extend({
  model(params) {
    return knowledgeExplorer.get(params);
  },
});
