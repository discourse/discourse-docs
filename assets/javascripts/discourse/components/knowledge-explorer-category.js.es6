import { default as computed } from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({
  tagName: "",
  @computed("category")
  categoryName(category) {
    return this.site.categories.findBy("id", category.id).name;
  },
  actions: {
    selectCategory() {
      this.selectCategory(this.category);
      return false;
    }
  }
});
