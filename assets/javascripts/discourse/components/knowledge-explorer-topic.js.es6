import { reads } from "@ember/object/computed";
import { computed } from "@ember/object";

export default Ember.Component.extend({
  classNames: "knowledge-explorer-topic",

  originalPostContent: reads("post.cooked"),

  post: reads("topic.post_stream.posts.firstObject"),

  model: computed("post", "topic", function() {
    const post = this.post;
    post.topic = this.topic;
    return post;
  }),

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
