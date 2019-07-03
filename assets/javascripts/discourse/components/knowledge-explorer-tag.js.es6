import computed from "ember-addons/ember-computed-decorators";
import DiscourseURL from "discourse/lib/url";

export default Ember.Component.extend({
  @computed("category", "tag")
  href(category, tag) {
    return "/knowledge-explorer";
  },

  click() {
    DiscourseURL.routeTo(this.href, { replaceURL: true });
  }
});
