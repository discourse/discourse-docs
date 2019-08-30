import { ajax } from "discourse/lib/ajax";

export default {
  search(tags, filter) {
    if (tags) {
      return ajax(
        `/search.json?q=in:kb tags:${tags.replace(/ /g, "+")} ${filter}`
      );
    } else {
      return ajax(`/search.json?q=in:kb ${filter}`);
    }
  }
};
