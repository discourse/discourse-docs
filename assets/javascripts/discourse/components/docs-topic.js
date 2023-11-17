import Component from "@ember/component";
import { reads } from "@ember/object/computed";
import discourseDebounce from "discourse-common/lib/debounce";
import computed, { bind } from "discourse-common/utils/decorators";

export default Component.extend({
  classNames: "docs-topic",

  originalPostContent: reads("post.cooked"),

  @computed("topic.post_stream")
  post(stream) {
    return this.store.createRecord("post", stream?.posts.firstObject);
  },

  @computed("post", "topic")
  model() {
    const post = this.post;

    if (!post.topic) {
      post.set("topic", this.topic);
    }

    return post;
  },

  @bind
  _emitScrollEvent() {
    this.appEvents.trigger("docs-topic:current-post-scrolled");
  },

  @bind
  debounceScrollEvent() {
    discourseDebounce(this, this._emitScrollEvent, 200);
  },

  didInsertElement() {
    this._super(...arguments);

    document.querySelector("body").classList.add("archetype-docs-topic");
    document.addEventListener("scroll", this.debounceScrollEvent);
  },

  willDestroyElement() {
    this._super(...arguments);

    document.querySelector("body").classList.remove("archetype-docs-topic");
    document.removeEventListener("scroll", this.debounceScrollEvent);
  },
});
