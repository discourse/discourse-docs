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
  needs.user({
    sidebar_sections: [
      {
        id: 111,
        title: "Community",
        links: [
          {
            id: 329,
            name: "Everything",
            value: "/latest",
            icon: "layer-group",
            external: false,
            segment: "primary",
          },
          {
            id: 336,
            name: "Groups",
            value: "/g",
            icon: "user-friends",
            external: false,
            segment: "secondary",
          },
        ],
        slug: "community",
        public: true,
        section_type: "community",
      },
    ],
  });
  needs.site({ docs_path: DOCS_URL_PATH });
  needs.settings({
    docs_enabled: false,
    navigation_menu: "sidebar",
  });

  test("docs sidebar link is hidden", async function (assert) {
    await visit("/");

    await click(
      ".sidebar-section[data-section-name='community'] .sidebar-more-section-links-details-summary"
    );

    assert.ok(
      !exists(".sidebar-section-link[data-link-name='docs']"),
      "it does not display the docs link in sidebar"
    );
  });
});

acceptance("Docs - Sidebar with docs enabled", function (needs) {
  needs.user({
    sidebar_sections: [
      {
        id: 111,
        title: "Community",
        links: [
          {
            id: 329,
            name: "Everything",
            value: "/latest",
            icon: "layer-group",
            external: false,
            segment: "primary",
          },
          {
            id: 336,
            name: "Groups",
            value: "/g",
            icon: "user-friends",
            external: false,
            segment: "secondary",
          },
        ],
        slug: "community",
        public: true,
        section_type: "community",
      },
    ],
  });
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
      ".sidebar-section[data-section-name='community'] .sidebar-more-section-links-details-summary"
    );

    assert.strictEqual(
      query(".sidebar-section-link[data-link-name='docs']").textContent.trim(),
      I18n.t("sidebar.docs_link_text"),
      "displays the right text for the link"
    );

    assert.strictEqual(
      query(".sidebar-section-link[data-link-name='docs']").title,
      I18n.t("sidebar.docs_link_title"),
      "displays the right title for the link"
    );

    await click(".sidebar-section-link[data-link-name='docs']");

    assert.strictEqual(
      currentURL(),
      "/" + DOCS_URL_PATH,
      "it navigates to the right page"
    );
  });
});
