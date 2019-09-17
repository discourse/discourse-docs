import { ajax } from "discourse/lib/ajax";

export default {
  //write as one liner
  //use + instead of space for query param
  search(filter, tags) {
    let params = [filter];
    if (tags) params.push(`tags:${tags}`);
    const endpoint = `/search.json?q=in:kb ${params.join(" ")}`;
    return ajax(endpoint);
  }
};
