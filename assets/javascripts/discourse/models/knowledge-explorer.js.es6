import { ajax } from "discourse/lib/ajax";

export default {
  list(params) {
    let filters = [];
    if (params.filterCategories)
      filters.push(`category=${params.filterCategories}`);
    if (params.filterTags) filters.push(`tags=${params.filterTags}`);
    if (params.searchTerm) filters.push(`search=${params.searchTerm}`);
    if (params.page) filters.push(`page=${params.page}`);

    return ajax(`/knowledge-explorer.json?${filters.join("&")}`);
  },

  loadMore(loadMoreUrl) {
    return ajax(loadMoreUrl);
  },

  getTopic(id) {
    return ajax(`/t/${id}.json`);
  }
};
