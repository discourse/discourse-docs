# frozen_string_literal: true

require "rails_helper"

describe Docs::DocsController do
  fab!(:category)
  fab!(:topic) { Fabricate(:topic, title: "I love carrot today", category: category) }
  fab!(:topic2) { Fabricate(:topic, title: "I love pineapple today", category: category) }
  fab!(:tag) { Fabricate(:tag, topics: [topic], name: "test") }

  def get_tag_attributes(tag)
    { "id" => tag.name, "count" => 1 }
  end

  def get_tags_from_response(response_tags)
    response_tags.map { |tag| tag.except("active") }
  end

  before do
    SiteSetting.tagging_enabled = true
    SiteSetting.docs_enabled = true
    SiteSetting.docs_categories = category.id.to_s
    SiteSetting.docs_tags = "test"
    GlobalSetting.stubs(:docs_path).returns("docs")
  end

  describe "docs data" do
    context "when any user" do
      it "should return the right response" do
        get "/#{GlobalSetting.docs_path}.json"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        tags = json["tags"]
        topics = json["topics"]["topic_list"]["topics"]

        expect(tags.size).to eq(1)
        expect(topics.size).to eq(2)
      end

      it "should return a topic count" do
        get "/#{GlobalSetting.docs_path}.json"

        json = response.parsed_body
        topic_count = json["topic_count"]

        expect(topic_count).to eq(2)
      end
    end

    context "when some docs topics are private" do
      let!(:group) { Fabricate(:group) }
      let!(:private_category) { Fabricate(:private_category, group: group) }
      let!(:private_topic) { Fabricate(:topic, category: private_category) }

      before { SiteSetting.docs_categories = "#{category.id}|#{private_category.id}" }

      it "should not show topics in private categories without permissions" do
        get "/#{GlobalSetting.docs_path}.json"

        json = JSON.parse(response.body)
        topics = json["topics"]["topic_list"]["topics"]

        expect(topics.size).to eq(2)
      end

      it "should show topics when users have permissions" do
        admin = Fabricate(:admin)
        sign_in(admin)

        get "/#{GlobalSetting.docs_path}.json"

        json = JSON.parse(response.body)
        topics = json["topics"]["topic_list"]["topics"]

        expect(topics.size).to eq(3)
      end
    end

    context "when filtering by tag" do
      fab!(:tag2) { Fabricate(:tag, topics: [topic], name: "test2") }
      fab!(:tag3) { Fabricate(:tag, topics: [topic], name: "test3") }

      it "should return a list filtered by tag" do
        get "/#{GlobalSetting.docs_path}.json?tags=test"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        topics = json["topics"]["topic_list"]["topics"]

        expect(topics.size).to eq(1)
      end

      it "should properly filter with more than two tags" do
        get "/#{GlobalSetting.docs_path}.json?tags=test%7ctest2%7ctest3"

        expect(response.status).to eq(200)

        json = response.parsed_body
        tags = json["tags"]
        topics = json["topics"]["topic_list"]["topics"]

        expect(tags.size).to eq(3)
        expect(topics.size).to eq(1)
      end

      context "when show_tags_by_group is enabled" do
        fab!(:tag4) { Fabricate(:tag, topics: [topic], name: "test4") }

        fab!(:tag_group_1) { Fabricate(:tag_group, name: "test-test2", tag_names: %w[test test2]) }
        fab!(:tag_group_2) do
          Fabricate(:tag_group, name: "test3-test4", tag_names: %w[test3 test4])
        end
        fab!(:non_docs_tag_group) do
          Fabricate(:tag_group, name: "non-docs-group", tag_names: %w[test3])
        end
        fab!(:empty_tag_group) { Fabricate(:tag_group, name: "empty-group") }

        let(:docs_json_path) { "/#{GlobalSetting.docs_path}.json" }
        let(:parsed_body) { response.parsed_body }
        let(:tag_groups) { parsed_body["tag_groups"] }
        let(:tag_ids) { tag_groups.map { |group| group["id"] } }

        before do
          SiteSetting.show_tags_by_group = true
          SiteSetting.docs_tag_groups = "test-test2|test3-test4"
          get docs_json_path
        end

        it "should add groups to the tags attribute" do
          get docs_json_path
          expect(get_tags_from_response(tag_groups[0]["tags"])).to contain_exactly(
            *[tag, tag2].map { |t| get_tag_attributes(t) },
          )
          expect(get_tags_from_response(tag_groups[1]["tags"])).to contain_exactly(
            *[tag3, tag4].map { |t| get_tag_attributes(t) },
          )
        end

        it "only displays tag groups that are enabled" do
          SiteSetting.docs_tag_groups = "test3-test4"
          get docs_json_path
          expect(tag_groups.size).to eq(1)
          expect(get_tags_from_response(tag_groups[0]["tags"])).to contain_exactly(
            *[tag3, tag4].map { |t| get_tag_attributes(t) },
          )
        end

        it "does not return tag groups without tags" do
          expect(tag_ids).not_to include(empty_tag_group.id)
        end

        it "does not return non-docs tag groups" do
          expect(tag_ids).not_to include(non_docs_tag_group.id)
        end
      end
    end

    context "when filtering by category" do
      let!(:category2) { Fabricate(:category) }
      let!(:topic3) { Fabricate(:topic, category: category2) }

      before { SiteSetting.docs_categories = "#{category.id}|#{category2.id}" }

      it "should return a list filtered by category" do
        get "/#{GlobalSetting.docs_path}.json?category=#{category2.id}"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        categories = json["categories"]
        topics = json["topics"]["topic_list"]["topics"]

        expect(categories.size).to eq(2)
        expect(categories[0]).to include({ "active" => true, "count" => 1, "id" => category2.id })
        expect(categories[1]).to include({ "active" => false, "count" => 2, "id" => category.id })
        expect(topics.size).to eq(1)
      end

      it "ignores category filter when incorrect argument" do
        get "/#{GlobalSetting.docs_path}.json?category=hack"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        categories = json["categories"]
        topics = json["topics"]["topic_list"]["topics"]

        expect(categories.size).to eq(2)
        expect(topics.size).to eq(3)
      end
    end

    context "when ordering results" do
      describe "by title" do
        it "should return the list ordered descending" do
          get "/#{GlobalSetting.docs_path}.json?order=title"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json["topics"]["topic_list"]["topics"]

          expect(topics[0]["id"]).to eq(topic2.id)
          expect(topics[1]["id"]).to eq(topic.id)
        end

        it "should return the list ordered ascending with an additional parameter" do
          get "/#{GlobalSetting.docs_path}.json?order=title&ascending=true"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json["topics"]["topic_list"]["topics"]

          expect(topics[0]["id"]).to eq(topic.id)
          expect(topics[1]["id"]).to eq(topic2.id)
        end
      end

      describe "by date" do
        before { topic2.update(last_posted_at: Time.zone.now + 100) }

        it "should return the list ordered descending" do
          get "/#{GlobalSetting.docs_path}.json?order=activity"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json["topics"]["topic_list"]["topics"]

          expect(topics[0]["id"]).to eq(topic.id)
          expect(topics[1]["id"]).to eq(topic2.id)
        end

        it "should return the list ordered ascending with an additional parameter" do
          get "/#{GlobalSetting.docs_path}.json?order=activity&ascending=true"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json["topics"]["topic_list"]["topics"]

          expect(topics[0]["id"]).to eq(topic2.id)
          expect(topics[1]["id"]).to eq(topic.id)
        end
      end
    end

    context "when searching" do
      before { SearchIndexer.enable }

      # no fab here otherwise will be missing from search
      let!(:post) do
        topic = Fabricate(:topic, title: "I love banana today", category: category)
        Fabricate(:post, topic: topic, raw: "walking and running is fun")
      end

      let!(:post2) do
        topic = Fabricate(:topic, title: "I love the amazing tomorrow", category: category)
        Fabricate(:post, topic: topic, raw: "I also eat bananas")
      end

      it "should correctly filter topics" do
        get "/#{GlobalSetting.docs_path}.json?search=banana"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        topics = json["topics"]["topic_list"]["topics"]

        # ordered by latest for now

        expect(topics[0]["id"]).to eq(post2.topic_id)
        expect(topics[1]["id"]).to eq(post.topic_id)

        expect(topics.size).to eq(2)

        get "/#{GlobalSetting.docs_path}.json?search=walk"

        json = JSON.parse(response.body)
        topics = json["topics"]["topic_list"]["topics"]

        expect(topics.size).to eq(1)
      end
    end

    context "when getting topic first post contents" do
      let!(:non_ke_topic) { Fabricate(:topic) }

      it "should correctly grab the topic" do
        get "/#{GlobalSetting.docs_path}.json?topic=#{topic.id}"

        expect(response.parsed_body["topic"]["id"]).to eq(topic.id)
      end

      it "should get topics matching a selected docs tag or category" do
        get "/#{GlobalSetting.docs_path}.json?topic=#{non_ke_topic.id}"

        expect(response.parsed_body["topic"]).to be_blank
      end

      it "should return a docs topic when only tags are added to settings" do
        SiteSetting.docs_categories = nil

        get "/#{GlobalSetting.docs_path}.json?topic=#{topic.id}"

        expect(response.parsed_body["topic"]["id"]).to eq(topic.id)
      end

      it "should return a docs topic when only categories are added to settings" do
        SiteSetting.docs_tags = nil

        get "/#{GlobalSetting.docs_path}.json?topic=#{topic.id}"

        expect(response.parsed_body["topic"]["id"]).to eq(topic.id)
      end

      it "should create TopicViewItem" do
        admin = Fabricate(:admin)
        sign_in(admin)
        expect do get "/#{GlobalSetting.docs_path}.json?topic=#{topic.id}" end.to change {
          TopicViewItem.count
        }.by(1)
      end

      it "should create TopicUser if authenticated" do
        expect do
          get "/#{GlobalSetting.docs_path}.json?topic=#{topic.id}&track_visit=true"
        end.not_to change { TopicUser.count }

        admin = Fabricate(:admin)
        sign_in(admin)
        expect do
          get "/#{GlobalSetting.docs_path}.json?topic=#{topic.id}&track_visit=true"
        end.to change { TopicUser.count }.by(1)
      end
    end
  end
end
