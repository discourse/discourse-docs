import { visit } from "@ember/test-helpers";
import { test } from "qunit";
import {
  acceptance,
  publishToMessageBus,
} from "discourse/tests/helpers/qunit-helpers";
import docsFixtures from "../fixtures/docs";

acceptance("Docs - user status", function (needs) {
  needs.user();
  needs.site({ docs_path: "docs" });
  needs.settings({
    docs_enabled: true,
    enable_user_status: true,
  });

  const mentionedUserId = 1;

  needs.pretender((server, helper) => {
    server.get("/docs.json", () => {
      docsFixtures.topic = {
        post_stream: {
          posts: [
            {
              id: 427,
              topic_id: 1,
              username: "admin1",
              post_number: 2,
              cooked:
                '<p>This is a document.</p>\n<p>I am mentioning another user <a class="mention" href="/u/andrei4">@andrei4</a></p>',
              mentioned_users: [
                {
                  id: mentionedUserId,
                  username: "andrei4",
                  name: "andrei",
                  avatar_template:
                    "/letter_avatar_proxy/v4/letter/a/a87d85/{size}.png",
                  assign_icon: "user-plus",
                  assign_path: "/u/andrei4/activity/assigned",
                },
              ],
            },
          ],
          stream: [427],
        },
      };

      return helper.response(docsFixtures);
    });
  });

  test("user status on mentions is live", async function (assert) {
    await visit("/docs?topic=1");
    assert.dom(".mention .user-status").doesNotExist();

    const newStatus = { emoji: "surfing_man", description: "surfing" };
    await publishToMessageBus(`/user-status`, { [mentionedUserId]: newStatus });

    assert
      .dom(`.mention .user-status-message .emoji[alt='${newStatus.emoji}']`)
      .exists();
    await publishToMessageBus(`/user-status`, { [mentionedUserId]: null });
    assert.dom(".mention .user-status").doesNotExist();
  });
});
