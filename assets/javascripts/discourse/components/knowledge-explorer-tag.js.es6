export default Ember.Component.extend({
  click() {
    this.selectTag(this.tag);
    return false;
  }
});
