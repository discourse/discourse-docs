import Component from "@ember/component";
import { debounce } from "@ember/runloop";
import { action } from "@ember/object";
import discourseDebounce from "discourse-common/lib/debounce";

export default Component.extend({
  classNames: "docs-search",

  debouncedSearch(term) {
    // TODO: Use discouseDebounce when discourse 2.7 gets released.
    const debounceFunc = discourseDebounce || debounce;

    debounceFunc(this, "onSearch", term, 500);
  },

  @action
  onSearchTermChange(term) {
    this.debouncedSearch(term);
  },

  @action
  clearSearch() {
    this.set("searchTerm", "");
    this.onSearch("");
  },
});
