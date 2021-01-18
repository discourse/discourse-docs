import { acceptance, queryAll } from "helpers/qunit-helpers";
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

    assert.equal(queryAll(".docs-category")[0].innerText.trim(), "bug 119");
    assert.equal(queryAll(".docs-tag")[0].innerText.trim(), "something 74");
    assert.equal(
      queryAll(".docs-topic-link")[0].innerText.trim(),
      "Importing from Software X"
    );
  });
});
