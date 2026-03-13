/* eslint-disable ember/no-classic-components */
import Component from "@ember/component";
import { on } from "@ember/modifier";
import { computed } from "@ember/object";
import { tagName } from "@ember-decorators/component";
import icon from "discourse/helpers/d-icon";

@tagName("")
export default class DocsCategory extends Component {
  @computed("category")
  get categoryName() {
    return this.site.categories.find((item) => item.id === this.category.id)
      ?.name;
  }

  <template>
    <a
      href
      {{on "click" this.selectCategory}}
      class="docs-item docs-category {{if this.category.active 'selected'}}"
    >
      {{icon (if this.category.active "circle-xmark" "far-circle")}}

      <span class="docs-item-id category-id">{{this.categoryName}}</span>
      <span
        class="docs-item-count category-count"
      >{{this.category.count}}</span>
    </a>
  </template>
}
