import Component from "@ember/component";
import { reads } from "@ember/object/computed";
import { service } from "@ember/service";
import { classNames } from "@ember-decorators/component";
import discourseDebounce from "discourse/lib/debounce";
import computed, { bind } from "discourse/lib/decorators";
import transformPost from "discourse/lib/transform-post";
import { currentUser } from "discourse/tests/helpers/qunit-helpers";

@classNames("docs-topic")
export default class DocsTopic extends Component {
  @service currentUser;
  @service site;

  @reads("post.cooked") originalPostContent;

  @computed("currentUser", "model")
  post(stream) {
    return transformPost(this.currentUser, this.site, this.model);
  }

  @computed("topic", "topic.post_stream")
  model() {
    const post = this.store.createRecord(
      "post",
      this.topic.post_stream?.posts.firstObject
    );

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
