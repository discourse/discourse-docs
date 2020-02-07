# frozen_string_literal: true

require 'rails_helper'

describe KnowledgeExplorer::KnowledgeExplorerController do
  fab!(:category) { Fabricate(:category) }
  fab!(:topic) { Fabricate(:topic, category: category) }
  fab!(:topic2) { Fabricate(:topic, category: category) }
  fab!(:tag) { Fabricate(:tag, topics: [topic], name: 'test') }

  before do
    SiteSetting.tagging_enabled = true
    SiteSetting.knowledge_explorer_enabled = true
    SiteSetting.knowledge_explorer_categories = category.id.to_s
    SiteSetting.knowledge_explorer_tags = 'test'
  end

  describe 'knowledge explorer data' do
    context 'when any user' do
      it 'should return the right response' do
        get '/knowledge-explorer.json'

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        tags = json['tags']
        topics = json['topics']['topic_list']['topics']

        expect(tags.size).to eq(1)
        expect(topics.size).to eq(2)
      end
    end

    context 'when some knowledge explorer topics are private' do
      let!(:group) { Fabricate(:group) }
      let!(:private_category) { Fabricate(:private_category, group: group) }
      let!(:private_topic) { Fabricate(:topic, category: private_category) }

      before do
        SiteSetting.knowledge_explorer_categories = "#{category.id}|#{private_category.id}"
      end

      it 'should not show topics in private categories without permissions' do
        get '/knowledge-explorer.json'

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        expect(topics.size).to eq(2)
      end

      it 'should show topics when users have permissions' do
        admin = Fabricate(:admin)
        sign_in(admin)

        get '/knowledge-explorer.json'

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        expect(topics.size).to eq(3)
      end
    end

    context 'when filtering by tag' do
      it 'should return a list filtered by tag' do
        get '/knowledge-explorer.json?tags=test'

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        tags = json['tags']
        topics = json['topics']['topic_list']['topics']

        expect(tags.size).to eq(1)
        expect(topics.size).to eq(1)
      end
    end

    context 'when filtering by category' do
      let!(:category2) { Fabricate(:category) }
      let!(:topic3) { Fabricate(:topic, category: category2) }

      before do
        SiteSetting.knowledge_explorer_categories = "#{category.id}|#{category2.id}"
      end

      it 'should return a list filtered by category' do
        get "/knowledge-explorer.json?category=#{category2.id}"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        categories = json['categories']
        topics = json['topics']['topic_list']['topics']

        expect(categories.size).to eq(1)
        expect(topics.size).to eq(1)
      end
    end

    context 'when searching' do
      before do
        SearchIndexer.enable
      end

      # no fab here otherwise will be missing from search
      let!(:post) do
        topic = Fabricate(:topic, title: "I love banana today", category: category)
        Fabricate(:post, topic: topic, raw: "walking and running is fun")
      end

      let!(:post2) do
        topic = Fabricate(:topic, title: "I love the amazing tomorrow", category: category)
        Fabricate(:post, topic: topic, raw: "I also eat bananas")
      end

      it 'should correctly filter topics' do
        get "/knowledge-explorer.json?search=banana"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        # ordered by latest for now

        expect(topics[0]["id"]).to eq(post2.topic_id)
        expect(topics[1]["id"]).to eq(post.topic_id)

        expect(topics.size).to eq(2)

        get "/knowledge-explorer.json?search=walk"

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        expect(topics.size).to eq(1)

      end
    end
  end
end
