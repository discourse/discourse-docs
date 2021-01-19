import Component from "@ember/component";
import { reads } from "@ember/object/computed";
import { computed } from "@ember/object";

export default Component.extend({
  classNames: "docs-topic",

  originalPostContent: reads("post.cooked"),

  title: computed("topic", function() {
    const topic = this.topic;
    if (topic) {
      return topic.unicode_title || topic.title;
    }
  }),

  post: computed("topic", function () {
    return this.store.createRecord(
      "post",
      this.topic.post_stream.posts.firstObject
    );
  }),

  model: computed("post", "topic", function () {
    const post = this.post;

    if (!post.topic) {
      post.set("topic", this.topic);
    }

    return post;
  }),

  didInsertElement() {
    this._super(...arguments);

    document.querySelector("body").classList.add("archetype-docs-topic");
  },

  willDestroyElement() {
    this._super(...arguments);

    document.querySelector("body").classList.remove("archetype-docs-topic");
  },
});
