export default {
  tag_groups: [
    {
      id: 1,
      name: "my-tag-group-1",
      tags: [
        {
          id: "something 1",
          count: 50,
          active: true
        },
        {
          id: "something 2",
          count: 10,
          active: true
        }
      ]
    },
    {
      id: 2,
      name: "my-tag-group-2",
      tags: [
        {
          id: "something 2",
          count: 10,
          active: true
        }
      ]
    },
    {
      id: 3,
      name: "my-tag-group-3",
      tags: [
        {
          id: "something 3",
          count: 1,
          active: false
        }
      ]
    },
    {
      id: 4,
      name: "my-tag-group-4",
      tags: [
        {
          id: "something 4",
          count: 1,
          active: false
        }
      ]
    }
  ],
  categories: [
    {
      id: 1,
      count: 119,
      active: false
    }
  ],
  topics: {
    users: [
      {
        id: 2,
        username: "cvx",
        name: "Jarek",
        avatar_template: "/letter_avatar/cvx/{size}/2.png"
      }
    ],
    primary_groups: [],
    topic_list: {
      can_create_topic: true,
      draft: null,
      draft_key: "new_topic",
      draft_sequence: 94,
      per_page: 30,
      top_tags: ["something"],
      topics: [
        {
          id: 54881,
          title: "Importing from Software X",
          fancy_title: "Importing from Software X",
          slug: "importing-from-software-x",
          posts_count: 112,
          reply_count: 72,
          highest_post_number: 122,
          image_url: null,
          created_at: "2016-12-28T14:59:29.396Z",
          last_posted_at: "2020-11-14T16:21:35.720Z",
          bumped: true,
          bumped_at: "2020-11-14T16:21:35.720Z",
          archetype: "regular",
          unseen: false,
          pinned: false,
          unpinned: null,
          visible: true,
          closed: false,
          archived: false,
          bookmarked: null,
          liked: null,
          tags: ["something"],
          views: 15222,
          like_count: 167,
          has_summary: true,
          last_poster_username: "cvx",
          category_id: 1,
          pinned_globally: false,
          featured_link: null,
          has_accepted_answer: false,
          posters: [
            {
              extras: null,
              description: "Original Poster",
              user_id: 2,
              primary_group_id: null
            },
            {
              extras: null,
              description: "Frequent Poster",
              user_id: 2,
              primary_group_id: null
            },
            {
              extras: "latest",
              description: "Most Recent Poster",
              user_id: 2,
              primary_group_id: null
            }
          ]
        }
      ]
    },
    load_more_url: "/docs.json?page=1"
  },
  search_count: null
};
