import { test } from "qunit";
import I18n from "I18n";
import { click, currentURL, visit } from "@ember/test-helpers";
import {
  acceptance,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import docsFixtures from "../fixtures/docs";
import { cloneJSON } from "discourse-common/lib/object";

acceptance("Docs - Sidebar with docs disabled", function (needs) {
  needs.user({ experimental_sidebar_enabled: true });

  needs.settings({
    docs_enabled: false,
  });

  test("docs sidebar link is hidden", async function (assert) {
    await visit("/");

    assert.ok(
      !exists(".sidebar-section-link-docs"),
      "it does not display the docs link in sidebar"
    );
  });
});

acceptance("Docs - Sidebar with docs enabled", function (needs) {
  needs.user({ experimental_sidebar_enabled: true });
  needs.settings({
    docs_enabled: true,
  });

  needs.pretender((server, helper) => {
    server.get("/docs.json", () => helper.response(cloneJSON(docsFixtures)));
  });

  test("clicking on docs link", async function (assert) {
    await visit("/");

    assert.strictEqual(
      query(".sidebar-section-link-docs").textContent.trim(),
      I18n.t("sidebar.docs_link_text"),
      "displays the right text for the link"
    );

    assert.strictEqual(
      query(".sidebar-section-link-docs").title,
      I18n.t("sidebar.docs_link_title"),
      "displays the right title for the link"
    );

    await click(".sidebar-section-link-docs");

    assert.strictEqual(currentURL(), "/docs", "it navigates to the right page");
  });
});
