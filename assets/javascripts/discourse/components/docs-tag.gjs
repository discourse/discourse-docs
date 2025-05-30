import Component from "@ember/component";
import { on } from "@ember/modifier";
import { tagName } from "@ember-decorators/component";
import icon from "discourse/helpers/d-icon";

@tagName("")
export default class DocsTag extends Component {
  <template>
    <a
      href
      {{on "click" this.selectTag}}
      class="docs-item docs-tag
        {{if this.tag.active 'selected'}}{{if this.subtag 'subtag'}}"
    >
      {{icon (if this.tag.active "circle-xmark" "plus")}}

      <span class="docs-item-id tag-id">{{this.tag.id}}</span>
      <span class="docs-item-count tag-count">{{this.tag.count}}</span>
    </a>
  </template>
}
