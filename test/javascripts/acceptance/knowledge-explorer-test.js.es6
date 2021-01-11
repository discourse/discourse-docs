import { acceptance, queryAll } from "helpers/qunit-helpers";
import docsFixtures from "../fixtures/docs";

acceptance("Knowledge Explorer", function (needs) {
  needs.user();
  needs.settings({
    knowledge_explorer_enabled: true,
  });

  needs.pretender((server, helper) => {
    server.get("/docs.json", () => helper.response(docsFixtures));
  });

  test("index page", async function (assert) {
    await visit("/");
    await click("#toggle-hamburger-menu");
    await click(".knowledge-explorer-link");

    assert.equal(
      queryAll(".knowledge-explorer-category")[0].innerText.trim(),
      "bug 119"
    );
    assert.equal(
      queryAll(".knowledge-explorer-tag")[0].innerText.trim(),
      "something 74"
    );
    assert.equal(
      queryAll(".knowledge-explorer-topic-link")[0].innerText.trim(),
      "Importing from Software X"
    );
  });
});
