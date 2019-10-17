import { ajax } from "discourse/lib/ajax";

export default {
  list(params) {
    let filters = [];
    if (params.filterTags) filters.push(`tags=${params.filterTags}`);
    if (params.searchTerm) filters.push(`search=${params.searchTerm}`);

    return ajax(`/knowledge-explorer.json?${filters.join("&")}`);
  },
  getTopic(id) {
    return ajax(`/t/${id}.json`);
  }
};
