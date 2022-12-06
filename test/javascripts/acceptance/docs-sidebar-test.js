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

let DOCS_URL_PATH = "docs";

acceptance("Docs - Sidebar with docs disabled", function (needs) {
  needs.user();
  needs.site({ docs_path: DOCS_URL_PATH });
  needs.settings({
    docs_enabled: false,
    navigation_menu: "sidebar",
  });

  test("docs sidebar link is hidden", async function (assert) {
    await visit("/");

    await click(
      ".sidebar-section-community .sidebar-more-section-links-details-summary"
    );

    assert.ok(
      !exists(".sidebar-section-link-docs"),
      "it does not display the docs link in sidebar"
    );
  });
});

acceptance("Docs - Sidebar with docs enabled", function (needs) {
  needs.user();
  needs.site({ docs_path: DOCS_URL_PATH });
  needs.settings({
    docs_enabled: true,
    navigation_menu: "sidebar",
  });

  needs.pretender((server, helper) => {
    server.get("/" + DOCS_URL_PATH + ".json", () =>
      helper.response(cloneJSON(docsFixtures))
    );
  });

  test("clicking on docs link", async function (assert) {
    await visit("/");

    await click(
      ".sidebar-section-community .sidebar-more-section-links-details-summary"
    );

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

    assert.strictEqual(
      currentURL(),
      "/" + DOCS_URL_PATH,
      "it navigates to the right page"
    );
  });
});
