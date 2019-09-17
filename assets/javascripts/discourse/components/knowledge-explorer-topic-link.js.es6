export default Ember.Component.extend({
  click() {
    this.selectTopic(this.topic.id);
    return false;
  }
});
