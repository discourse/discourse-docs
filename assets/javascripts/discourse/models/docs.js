import EmberObject from "@ember/object";
import { ajax } from "discourse/lib/ajax";
import Topic from "discourse/models/topic";

const Docs = EmberObject.extend({});

Docs.reopenClass({
  list(params) {
    let filters = [];

    if (params.filterCategories) {
      filters.push(`category=${params.filterCategories}`);
    }
    if (params.filterTags) {
      filters.push(`tags=${params.filterTags}`);
    }
    if (params.filterGroups) {
      filters.push(`groups=${params.filterGroups}`);
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
    if (params.timeRange) {
      filters.push(`time=${params.timeRange}`);
    }

    return ajax(`/explorer.json?${filters.join("&")}`).then((data) => {
      data.topics.topic_list.topics = data.topics.topic_list.topics.map(
        (topic) => Topic.create(topic)
      );
      data.topic = Topic.create(data.topic);
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
});

export default Docs;
