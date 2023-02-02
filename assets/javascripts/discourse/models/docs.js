import EmberObject from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";
import User from "discourse/models/user";
import { getDocs } from "../../lib/get-docs";

const Docs = EmberObject.extend({});
const docsPath = getDocs();

Docs.reopenClass({
  list(params) {
    let filters = [];

    if (params.filterCategories) {
      filters.push(`category=${params.filterCategories}`);
    }
    if (params.filterTags) {
      filters.push(`tags=${params.filterTags}`);
    }
    if (params.filterSolved) {
      filters.push(`solved=${params.filterSolved}`);
    }
    if (params.searchTerm) {
      filters.push(`search=${params.searchTerm}`);
    }
    if (params.ascending) {
      filters.push("ascending=true");
    }
    if (params.orderColumn) {
      filters.push(`order=${params.orderColumn}`);
    }
    if (params.page) {
      filters.push(`page=${params.page}`);
    }
    if (params.selectedTopic) {
      filters.push(`topic=${params.selectedTopic}`);
      filters.push("track_visit=true");
    }

    return ajax(`/${docsPath}.json?${filters.join("&")}`).then((data) => {
      data.topics.topic_list.topics = data.topics.topic_list.topics.map(
        (topic) => Topic.create(topic)
      );
      data.topic = Topic.create(data.topic);
      data.topic.post_stream?.posts.forEach((post) =>
        this._initUserModels(post)
      );
      return data;
    });
  },

  loadMore(loadMoreUrl) {
    return ajax(loadMoreUrl).then((data) => {
      data.topics.topic_list.topics = data.topics.topic_list.topics.map(
        (topic) => Topic.create(topic)
      );
      return data;
    });
  },

  _initUserModels(post) {
    if (post.mentioned_users) {
      post.mentioned_users = post.mentioned_users.map((u) => User.create(u));
    }
  },
});

export default Docs;
