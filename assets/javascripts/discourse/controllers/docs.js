import Controller, { inject as controller } from "@ember/controller";
import { action } from "@ember/object";

export default Controller.extend({
  indexController: controller("docs.index"),

  @action
  updateSelectedCategories(category) {
    this.indexController.send("updateSelectedCategories", category);
    return false;
  },

  @action
  updateSelectedTags(tag) {
    this.indexController.send("updateSelectedTags", tag);
    return false;
  },

  @action
  updateSelectedGroups(group) {
    this.indexController.send("updateSelectedGroups", group);
    return false;
  },

  @action
  performSearch(term) {
    this.indexController.send("performSearch", term);
    return false;
  },
});
