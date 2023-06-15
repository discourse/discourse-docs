import Component from "@ember/component";
import { RUNTIME_OPTIONS } from "discourse-common/lib/raw-handlebars-helpers";
import { findRawTemplate } from "discourse-common/lib/raw-templates";
import { htmlSafe } from "@ember/template";

export default Component.extend({
  tagName: "tr",
  classNameBindings: [":topic-list-item"],

  didInsertElement() {
    this._super(...arguments);
    this.renderTopicListItem();
  },

  renderTopicListItem() {
    const template = findRawTemplate("docs-topic-list-item");
    if (template) {
      this.set(
        "topicListItemContents",
        htmlSafe(template(this, RUNTIME_OPTIONS))
      );
    }
  },
});
