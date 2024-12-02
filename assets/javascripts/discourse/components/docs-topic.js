import Component from "@ember/component";
import { reads } from "@ember/object/computed";
import { classNames } from "@ember-decorators/component";
import discourseDebounce from "discourse-common/lib/debounce";
import computed, { bind } from "discourse-common/utils/decorators";

@classNames("docs-topic")
export default class DocsTopic extends Component {
  @reads("post.cooked") originalPostContent;

  @computed("topic.post_stream")
  post(stream) {
    return this.store.createRecord("post", stream?.posts.firstObject);
  }

  @computed("post", "topic")
  model() {
    const post = this.post;

    if (!post.topic) {
      post.set("topic", this.topic);
    }

    return post;
  }

  @bind
  _emitScrollEvent() {
    this.appEvents.trigger("docs-topic:current-post-scrolled");
  }

  @bind
  debounceScrollEvent() {
    discourseDebounce(this, this._emitScrollEvent, 200);
  }

  didInsertElement() {
    super.didInsertElement(...arguments);

    document.body.classList.add("archetype-docs-topic");
    document.addEventListener("scroll", this.debounceScrollEvent);
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);

    document.body.classList.remove("archetype-docs-topic");
    document.removeEventListener("scroll", this.debounceScrollEvent);
  }
}
