import Controller from "@ember/controller";

export default Controller.extend({
  indexController: Ember.inject.controller("knowledgeExplorer.index"),
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
