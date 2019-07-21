export default Ember.Component.extend({
  click() {
    const tag = this.get("tag");
    let filter = this.get("filterTags");
    if (filter && filter.includes(tag.id)) {
      filter = filter.replace(tag.id, "");
      filter = filter.replace("  ", " ");
      filter = filter.replace(/^\s+|\s+$/g, "");
    } else if (filter) {
      filter = `${filter} ${tag.id}`;
    } else {
      filter = tag.id;
    }

    this.set("filterTags", filter);
    this.send("refreshRoute");
  }
});
