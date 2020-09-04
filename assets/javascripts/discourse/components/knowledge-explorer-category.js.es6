import discourseComputed from "discourse-common/utils/decorators";

export default Ember.Component.extend({
  tagName: "",
  @discourseComputed("category")
  categoryName(category) {
    return this.site.categories.findBy("id", category.id).name;
  },
  actions: {
    selectCategory() {
      this.selectCategory(this.category);
      return false;
    },
  },
});
