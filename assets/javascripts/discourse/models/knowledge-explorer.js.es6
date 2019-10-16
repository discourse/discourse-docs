import { ajax } from "discourse/lib/ajax";

export default {
  get(params) {
    let filters = [];
    if (params.filterTags) filters.push(`tags=${params.filterTags}`);
    if (params.searchTerm) filters.push(`search=${params.searchTerm}`);

    return ajax(`/knowledge-explorer.json?${filters.join("&")}`);
  }
};
