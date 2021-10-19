import { acceptance, count, query } from "helpers/qunit-helpers";
import docsFixtures from "../fixtures/docs";

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
