import Controller, { inject } from "@ember/controller";
import { action } from "@ember/object";

export default Controller.extend({
  indexController: inject("docs.index"),

  @action
  updateSelectedCategories(category) {
    this.indexController.send("updateSelectedCategories", category);
    return false;
  },

  @action
  performSearch(term) {
    this.indexController.send("performSearch", term);
    return false;
  },
});
