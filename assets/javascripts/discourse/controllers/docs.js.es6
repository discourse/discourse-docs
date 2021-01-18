import Controller from "@ember/controller";
import { inject } from "@ember/controller";

export default Controller.extend({
  indexController: inject("docs.index"),
  actions: {
    updateSelectedCategories(category) {
      this.indexController.send("updateSelectedCategories", category);
      return false;
    },
    performSearch(term) {
      this.indexController.send("performSearch", term);
      return false;
    },
  },
});
