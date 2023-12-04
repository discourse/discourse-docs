import Component from "@ember/component";
import { action } from "@ember/object";

export default Component.extend({
  classNames: "docs-search",

  @action
  onKeyDown(event) {
    if (event.key === "Enter") {
      this.set("searchTerm", event.target.value);
      this.onSearch(event.target.value);
    }
  },

  @action
  clearSearch() {
    this.set("searchTerm", "");
    this.onSearch("");
  },
});
