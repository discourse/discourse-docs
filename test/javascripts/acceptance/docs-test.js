import { click, visit } from "@ember/test-helpers";
import { test } from "qunit";
import {
  acceptance,
  count,
  exists,
  query,
} from "discourse/tests/helpers/qunit-helpers";
import docsFixtures from "../fixtures/docs";
import docsShowTagGroupsFixtures from "../fixtures/docs-show-tag-groups";

let DOCS_URL_PATH = "docs";

acceptance("Docs", function (needs) {
  needs.user();
  needs.site({ docs_path: DOCS_URL_PATH });
  needs.settings({
    docs_enabled: true,
  });

  needs.pretender((server, helper) => {
    server.get("/" + DOCS_URL_PATH + ".json", (request) => {
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

    await click(
      ".sidebar-section[data-section-name='community'] .sidebar-more-section-links-details-summary"
    );

    await click(
      ".sidebar-section[data-section-name='community'] .sidebar-section-link[data-link-name='docs']"
    );

    assert.equal(query(".docs-category .docs-item-id").innerText, "bug");
    assert.equal(query(".docs-category .docs-item-count").innerText, "119");
    assert.equal(query(".docs-tag .docs-item-id").innerText, "something");
    assert.equal(query(".docs-tag .docs-item-count").innerText, "74");
    assert.equal(
      query(".docs-topic-link").innerText.trim(),
      "Importing from Software X"
    );
  });

  test("selecting a category", async function (assert) {
    await visit("/" + DOCS_URL_PATH);
    assert.equal(count(".docs-category.selected"), 0);

    await click(".docs-item.docs-category");
    assert.equal(count(".docs-category.selected"), 1);

    await click(".docs-item.docs-category");
    assert.equal(
      count(".docs-category.selected"),
      0,
      "clicking again deselects"
    );
  });
});

acceptance("Docs - with tag groups enabled", function (needs) {
  needs.user();
  needs.site({ docs_path: DOCS_URL_PATH });
  needs.settings({
    docs_enabled: true,
  });

  function getRootElementText(selector) {
    return Array.from(query(selector).childNodes)
      .filter((node) => node.nodeType === Node.TEXT_NODE)
      .map((node) => node.textContent.trim())
      .join("");
  }

  function assertTagGroup(assert, tagGroup) {
    let groupTagSelector = `.docs-filter-tag-group-${tagGroup.id}`;
    assert.equal(
      getRootElementText(groupTagSelector),
      tagGroup.expectedTagGroupName
    );
    assert.equal(
      query(`${groupTagSelector} .docs-tag .docs-item-id`).innerText,
      tagGroup.expectedTagName
    );
    assert.equal(
      query(`${groupTagSelector} .docs-tag .docs-item-count`).innerText,
      tagGroup.expectedCount
    );
  }

  needs.pretender((server, helper) => {
    server.get("/" + DOCS_URL_PATH + ".json", () => {
      return helper.response(docsShowTagGroupsFixtures);
    });
  });

  test("Show tag groups", async function (assert) {
    this.siteSettings.tagging_enabled = true;
    this.siteSettings.show_tags_by_group = true;
    this.siteSettings.docs_tag_groups =
      "my-tag-group-1|my-tag-group-2|my-tag-group-3";

    await visit("/");

    await click(
      ".sidebar-section[data-section-name='community'] .sidebar-more-section-links-details-summary"
    );

    await click(
      ".sidebar-section[data-section-name='community'] .sidebar-section-link[data-link-name='docs']"
    );

    assert.equal(query(".docs-category .docs-item-id").innerText, "bug");
    assert.equal(query(".docs-category .docs-item-count").innerText, "119");

    const expectedTagGroups = [
      {
        id: "1",
        expectedTagGroupName: "my-tag-group-1",
        expectedTagName: "something 1",
        expectedCount: "50",
      },
      {
        id: "2",
        expectedTagGroupName: "my-tag-group-2",
        expectedTagName: "something 2",
        expectedCount: "10",
      },
      {
        id: "3",
        expectedTagGroupName: "my-tag-group-3",
        expectedTagName: "something 3",
        expectedCount: "1",
      },
    ];

    for (let tagGroup of expectedTagGroups) {
      assertTagGroup(assert, tagGroup);
    }
  });
});
acceptance("Docs - empty state", function (needs) {
  needs.user();
  needs.site({ docs_path: DOCS_URL_PATH });
  needs.settings({
    docs_enabled: true,
  });

  needs.pretender((server, helper) => {
    server.get("/" + DOCS_URL_PATH + ".json", () => {
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
    await visit("/" + DOCS_URL_PATH);
    assert.ok(exists("div.empty-state"));
  });
});
