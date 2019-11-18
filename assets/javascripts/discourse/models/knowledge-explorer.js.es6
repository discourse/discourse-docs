import { ajax } from "discourse/lib/ajax";

function getTopic(id) {
  return ajax(`/t/${id}.json`);
}

export default {
  list(params) {
    let filters = [];
    if (params.filterCategories)
      filters.push(`category=${params.filterCategories}`);
    if (params.filterTags) filters.push(`tags=${params.filterTags}`);
    if (params.searchTerm) filters.push(`search=${params.searchTerm}`);
    if (params.ascending) filters.push("ascending=true");
    if (params.orderColumn) filters.push(`order=${params.orderColumn}`);
    if (params.page) filters.push(`page=${params.page}`);

    let promise = ajax(`/knowledge-explorer.json?${filters.join("&")}`);

    if (params.selectedTopic) {
      promise = promise.then(data => {
        return getTopic(params.selectedTopic).then(topic => {
          data.topic = topic;
          return data;
        });
      });
    }

    return promise;
  },

  loadMore(loadMoreUrl) {
    return ajax(loadMoreUrl);
  },

  getTopic
};
