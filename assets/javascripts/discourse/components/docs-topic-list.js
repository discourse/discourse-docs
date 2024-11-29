import Component from "@ember/component";
import { action } from "@ember/object";
import { classNames } from "@ember-decorators/component";
import discourseComputed from "discourse-common/utils/decorators";
import { getDocs } from "../../lib/get-docs";

@classNames("docs-topic-list")
export default class DocsTopicList extends Component {
  urlPath = getDocs();

  @discourseComputed("order")
  sortTitle(order) {
    return order === "title";
  }

  @discourseComputed("order")
  sortActivity(order) {
    return order === "activity";
  }

  @action
  sortListActivity() {
    this.sortBy("activity");
    return false;
  }

  @action
  sortListTitle() {
    this.sortBy("title");
    return false;
  }
}
