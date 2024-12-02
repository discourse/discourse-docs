import Component from "@ember/component";
import { action } from "@ember/object";
import { classNames } from "@ember-decorators/component";

@classNames("docs-search")
export default class DocsSearch extends Component {
  @action
  onKeyDown(event) {
    if (event.key === "Enter") {
      this.set("searchTerm", event.target.value);
      this.onSearch(event.target.value);
    }
  }

  @action
  clearSearch() {
    this.set("searchTerm", "");
    this.onSearch("");
  }
}
