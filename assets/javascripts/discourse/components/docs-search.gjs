import Component, { Input } from "@ember/component";
import { on } from "@ember/modifier";
import { action } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import DButton from "discourse/components/d-button";
import icon from "discourse/helpers/d-icon";
import { i18n } from "discourse-i18n";

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

  <template>
    <span class="docs-search-wrapper">
      <Input
        @type="text"
        @value={{readonly this.searchTerm}}
        class="no-blur docs-search-bar"
        autocorrect="off"
        placeholder={{i18n "docs.search.placeholder"}}
        autocapitalize="off"
        {{on "keydown" this.onKeyDown}}
      />

      {{#if this.searchTerm}}
        <DButton
          @action={{this.clearSearch}}
          class="clear-search"
          @label="docs.search.clear"
        />
      {{else}}
        {{icon "magnifying-glass"}}
      {{/if}}
    </span>
  </template>
}
