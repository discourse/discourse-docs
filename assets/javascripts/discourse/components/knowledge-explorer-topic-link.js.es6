export default Ember.Component.extend({
  click() {
    this.set("selectedTopic", this.topic.id);
  }
});
