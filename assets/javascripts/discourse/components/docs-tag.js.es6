import Component from "@ember/component";
import { action } from "@ember/object";

export default Component.extend({
  tagName: "",

  @action
  selectTag() {
    this.selectTag(this.tag);
    return false;
  },
});
