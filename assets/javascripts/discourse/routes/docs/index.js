import DiscourseRoute from "discourse/routes/discourse";
import { i18n } from "discourse-i18n";
import Docs from "discourse/plugins/discourse-docs/discourse/models/docs";

export default class DocsIndex extends DiscourseRoute {
  queryParams = {
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
  };

  model(params) {
    this.controllerFor("docs.index").set("isLoading", true);
    return Docs.list(params).then((result) => {
      this.controllerFor("docs.index").set("isLoading", false);
      return result;
    });
  }

  titleToken() {
    const model = this.currentModel;
    const pageTitle = i18n("docs.title");
    if (model.topic.title && model.topic.category_id) {
      const title = model.topic.unicode_title || model.topic.title;
      const categoryName = this.site.categories.find(
        (item) => item.id === model.topic.category_id
      )?.name;
      return `${title} - ${categoryName} - ${pageTitle}`;
    } else {
      return pageTitle;
    }
  }

  setupController(controller, model) {
    controller.set("topic", model.topic);
    controller.set("model", model);
  }
}
