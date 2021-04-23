import Component from "@ember/component";
import { reads } from "@ember/object/computed";
import { computed } from "@ember/object";

export default Component.extend({
  classNames: "docs-topic",

  originalPostContent: reads("post.cooked"),

  @computed("topic")
  post() {
    return this.store.createRecord(
      "post",
      this.topic.post_stream.posts.firstObject
    );
  },

  @computed("post", "topic")
  model() {
    const post = this.post;

    if (!post.topic) {
      post.set("topic", this.topic);
    }

    return post;
  },

  didInsertElement() {
    this._super(...arguments);

    document.querySelector("body").classList.add("archetype-docs-topic");
  },

  willDestroyElement() {
    this._super(...arguments);

    document.querySelector("body").classList.remove("archetype-docs-topic");
  },
});
