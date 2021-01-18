import Component from "@ember/component";
export default Component.extend({
  tagName: "",
  actions: {
    selectTag() {
      this.selectTag(this.tag);
      return false;
    },
  },
});
