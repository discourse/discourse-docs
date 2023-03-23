import { module, test } from "qunit";
import { setupTest } from "ember-qunit";
import { getOwner } from "discourse-common/lib/get-owner";

module("Unit | Controller | docs-index", function (hooks) {
  setupTest(hooks);

  test("docsCategories ignores invalid category ids", function (assert) {
    const siteSettings = getOwner(this).lookup("service:site-settings");
    siteSettings.docs_categories = "1|2|3|333|999";

    const controller = getOwner(this).lookup("controller:docs-index");
    assert.deepEqual(controller.docsCategories, ["bug", "feature", "meta"]);
  });
});
