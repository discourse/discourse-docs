export default Ember.Component.extend({
  tagName: "",
  actions: {
    selectTag() {
      this.selectTag(this.tag);
      return false;
    },
  },
});
