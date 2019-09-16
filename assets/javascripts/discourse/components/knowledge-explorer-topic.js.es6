import { default as computed } from "ember-addons/ember-computed-decorators";

export default Ember.Component.extend({
  classNames: "knowledge-explorer-topic",
  @computed("topic")
  originalPostContent(topic) {
    return topic.post_stream.posts[0].cooked;
  }
});
