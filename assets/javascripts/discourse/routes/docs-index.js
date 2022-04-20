import DiscourseRoute from "discourse/routes/discourse";
import I18n from "I18n";
import Docs from "discourse/plugins/discourse-docs/discourse/models/docs";

export default DiscourseRoute.extend({
  queryParams: {
    ascending: { refreshModel: true },
    filterCategories: { refreshModel: true },
    filterTags: { refreshModel: true },
    filterGroups: { refreshModel: true },
    filterSolved: { refreshModel: true },
    orderColumn: { refreshModel: true },
    selectedTopic: { refreshModel: true },
    searchTerm: {
      replace: true,
      refreshModel: true,
    },
    timeRange: { refreshModel: true },
  },

  model(params) {
    this.controllerFor("docs.index").set("isLoading", true);
    return Docs.list(params).then((result) => {
      this.controllerFor("docs.index").set("isLoading", false);
      return result;
    });
  },

  titleToken() {
    const model = this.currentModel;
    const pageTitle = I18n.t("docs.title");
    if (model.topic.title && model.topic.category_id) {
      const title = model.topic.unicode_title || model.topic.title;
      const categoryName = this.site.categories.findBy(
        "id",
        model.topic.category_id
      ).name;
      return `${title} - ${categoryName} - ${pageTitle}`;
    } else {
      return pageTitle;
    }
  },

  setupController(controller, model) {
    controller.set("topic", model.topic);
    controller.set("model", model);
  },
});
