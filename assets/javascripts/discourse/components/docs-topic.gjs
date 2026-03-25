/* eslint-disable ember/no-classic-components, ember/require-tagless-components */
import Component from "@ember/component";
import { computed } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import DButton from "discourse/components/d-button";
import PluginOutlet from "discourse/components/plugin-outlet";
import Post from "discourse/components/post";
import icon from "discourse/helpers/d-icon";
import { trustHTML } from "@ember/template";
import discourseDebounce from "discourse/lib/debounce";
import { bind } from "discourse/lib/decorators";
import { i18n } from "discourse-i18n";

@classNames("docs-topic")
export default class DocsTopic extends Component {
  @computed("topic", "topic.post_stream")
  get model() {
    const post = this.store.createRecord(
      "post",
      this.topic.post_stream?.posts[0]
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

  <template>
    <DButton
      @label="docs.topic.back"
      class="docs-nav-link return"
      @action={{this.return}}
    />

    <div class="topic-content">
      <h1>{{trustHTML this.topic.fancyTitle}}</h1>
      <Post @post={{this.model}} />
    </div>

    <a class="docs-nav-link more" href="/t/{{this.topic.id}}">
      {{icon "far-comment"}}
      {{i18n "docs.topic.navigate_to_topic"}}
    </a>

    <span>
      <PluginOutlet @name="after-docs-topic" @connectorTagName="div" />
    </span>
  </template>
}
