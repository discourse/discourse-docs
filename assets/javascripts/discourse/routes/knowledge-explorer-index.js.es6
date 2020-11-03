import Route from "@ember/routing/route";
import Category from "discourse/models/category";
import KnowledgeExplorer from "discourse/plugins/discourse-knowledge-explorer/discourse/models/knowledge-explorer";

export default Route.extend({
  queryParams: {
    ascending: { refreshModel: true },
    filterCategories: { refreshModel: true },
    filterTags: { refreshModel: true },
    filterSolved: { refreshModel: true },
    orderColumn: { refreshModel: true },
    selectedTopic: { refreshModel: true },
    searchTerm: {
      replace: true,
      refreshModel: true,
    },
  },
  model(params) {
    this.controllerFor("knowledgeExplorer.index").set("isLoading", true);
    return KnowledgeExplorer.list(params).then((result) => {
      this.controllerFor("knowledgeExplorer.index").set("isLoading", false);
      return result;
    });
  },

  setupController(controller, model) {
    const categories = Category.list();

    let topics = model.topics.topic_list.topics;

    topics = topics.map((t) => {
      t.category = categories.findBy("id", t.category_id);
      return t;
    });

    model.topics.topic_list.topics = topics;

    controller.set("topic", model.topic);
    controller.set("model", model);
  },
});
