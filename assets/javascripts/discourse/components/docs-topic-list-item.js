import Component from "@ember/component";
import { htmlSafe } from "@ember/template";
import { classNameBindings, tagName } from "@ember-decorators/component";
import { RUNTIME_OPTIONS } from "discourse-common/lib/raw-handlebars-helpers";
import { findRawTemplate } from "discourse-common/lib/raw-templates";

@tagName("tr")
@classNameBindings(":topic-list-item")
export default class DocsTopicListItem extends Component {
  didInsertElement() {
    super.didInsertElement(...arguments);
    this.renderTopicListItem();
  }

  renderTopicListItem() {
    const template = findRawTemplate("docs-topic-list-item");
    if (template) {
      this.set(
        "topicListItemContents",
        htmlSafe(template(this, RUNTIME_OPTIONS))
      );
    }
  }
}
