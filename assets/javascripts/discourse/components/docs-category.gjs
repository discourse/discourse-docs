import Component from "@ember/component";
import { on } from "@ember/modifier";
import { tagName } from "@ember-decorators/component";
import icon from "discourse/helpers/d-icon";
import discourseComputed from "discourse/lib/decorators";

@tagName("")
export default class DocsCategory extends Component {
  @discourseComputed("category")
  categoryName(category) {
    return this.site.categories.findBy("id", category.id).name;
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
