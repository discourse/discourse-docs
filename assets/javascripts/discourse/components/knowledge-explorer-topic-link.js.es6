export default Ember.Component.extend({
  click() {
    const topic = this.get("topic");

    this.set("selectedTopic", topic.id);
  }
});
