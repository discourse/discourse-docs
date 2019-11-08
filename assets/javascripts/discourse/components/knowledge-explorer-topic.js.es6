export default Ember.Component.extend({
  classNames: "knowledge-explorer-topic",

  originalPostContent: Ember.computed.readOnly(
    "topic.post_stream.posts.firstObject.cooked"
  ),

  didInsertElement() {
    this._super(...arguments);
    document
      .querySelector("body")
      .classList.add("archetype-knowledge-explorer-topic");
  },

  willDestroyElement() {
    this._super(...arguments);
    document
      .querySelector("body")
      .classList.remove("archetype-knowledge-explorer-topic");
  }
});
