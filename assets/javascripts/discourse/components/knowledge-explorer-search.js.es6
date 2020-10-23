import Component from "@ember/component";
import debounce from "discourse/lib/debounce";

export default Component.extend({
  classNames: "knowledge-explorer-search",

  debouncedSearch: debounce(function (term) {
    this.onSearch(term);
  }, 500),

  actions: {
    onSearchTermChange(term) {
      this.debouncedSearch(term);
    },

    clearSearch() {
      this.set("searchTerm", "");
      this.onSearch("");
    },
  },
});
