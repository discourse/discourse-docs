import { setupTest } from "ember-qunit";
import { module, test } from "qunit";
import { getOwner } from "discourse-common/lib/get-owner";

module("Unit | Controller | docs-index", function (hooks) {
  setupTest(hooks);

  test("docsCategories ignores invalid category ids", function (assert) {
    const siteSettings = getOwner(this).lookup("service:site-settings");
    siteSettings.docs_categories = "1|2|3|333|999";

    const controller = getOwner(this).lookup("controller:docs-index");
    assert.deepEqual(controller.docsCategories, ["bug", "feature", "meta"]);
  });

  test("updateSelectedTags correctly removes tags", function (assert) {
    const controller = getOwner(this).lookup("controller:docs-index");
    controller.filterTags = "foo|bar|baz";

    controller.updateSelectedTags({ id: "bar" });

    assert.deepEqual(controller.filterTags, "foo|baz");
  });

  test("updateSelectedTags correctly appends tags to list", function (assert) {
    const controller = getOwner(this).lookup("controller:docs-index");
    controller.filterTags = "foo|bar";

    controller.updateSelectedTags({ id: "baz" });

    assert.deepEqual(controller.filterTags, "foo|bar|baz");
  });

  test("updateSelectedTags correctly appends tags to empty list", function (assert) {
    const controller = getOwner(this).lookup("controller:docs-index");
    controller.filterTags = null;

    controller.updateSelectedTags({ id: "foo" });

    assert.deepEqual(controller.filterTags, "foo");
  });
});
