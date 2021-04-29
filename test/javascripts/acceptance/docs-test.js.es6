import { acceptance, query } from "helpers/qunit-helpers";
import docsFixtures from "../fixtures/docs";

acceptance("Docs", function (needs) {
  needs.user();
  needs.settings({
    docs_enabled: true,
  });

  needs.pretender((server, helper) => {
    server.get("/docs.json", () => helper.response(docsFixtures));
  });

  test("index page", async function (assert) {
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
});
