import {
  acceptance,
  count,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import { test } from "qunit";
import docsFixtures from "../fixtures/docs";
import { click, visit } from "@ember/test-helpers";

acceptance("Docs", function (needs) {
  needs.user();
  needs.settings({
    docs_enabled: true,
  });

  needs.pretender((server, helper) => {
    server.get("/docs.json", (request) => {
      if (request.queryParams.category === "1") {
        const fixture = JSON.parse(JSON.stringify(docsFixtures));

        return helper.response(
          Object.assign(fixture, {
            categories: [
              {
                id: 1,
                count: 119,
                active: true,
              },
            ],
          })
        );
      } else {
        return helper.response(docsFixtures);
      }
    });
  });

  test("index page", async function (assert) {
    this.siteSettings.tagging_enabled = true;

    await visit("/");
    await click("#toggle-hamburger-menu");
    await click(".docs-link");

    assert.equal(query(".docs-category").innerText.trim(), "bug 119");
    assert.equal(query(".docs-tag").innerText.trim(), "something 74");
    assert.equal(
      query(".docs-topic-link").innerText.trim(),
      "Importing from Software X"
    );
  });

  test("selecting a category", async function (assert) {
    await visit("/docs");
    assert.equal(count(".docs-category.selected"), 0);

    await click(".docs-item.docs-category");
    assert.equal(count(".docs-category.selected"), 1);
  });
});

acceptance("Docs - empty state", function (needs) {
  needs.user();
  needs.settings({
    docs_enabled: true,
  });

  needs.pretender((server, helper) => {
    server.get("/docs.json", () => {
      const response = {
        tags: [],
        categories: [],
        topics: {
          topic_list: {
            can_create_topic: true,
            per_page: 30,
            top_tags: [],
            topics: [],
          },
          load_more_url: null,
        },
        topic_count: 0,
      };

      return helper.response(response);
    });
  });

  test("shows the empty state panel when there are no docs", async function (assert) {
    await visit("/docs");
    assert.ok(exists("div.empty-state"));
  });
});
