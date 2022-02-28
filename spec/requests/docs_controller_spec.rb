# frozen_string_literal: true

require 'rails_helper'

describe Docs::DocsController do
  fab!(:category) { Fabricate(:category) }
  fab!(:topic) { Fabricate(:topic, title: "I love carrot today", category: category) }
  fab!(:topic2) { Fabricate(:topic, title: "I love pineapple today", category: category) }
  fab!(:tag) { Fabricate(:tag, topics: [topic], name: 'test') }

  before do
    SiteSetting.tagging_enabled = true
    SiteSetting.docs_enabled = true
    SiteSetting.docs_categories = category.id.to_s
    SiteSetting.docs_tags = 'test'
  end

  describe 'docs data' do
    context 'when any user' do
      it 'should return the right response' do
        get '/explorer.json'

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        tags = json['tags']
        topics = json['topics']['topic_list']['topics']

        expect(tags.size).to eq(1)
        expect(topics.size).to eq(2)
      end

      it 'should return a topic count' do
        get '/explorer.json'

        json = response.parsed_body
        topic_count = json['topic_count']

        expect(topic_count).to eq(2)
      end
    end

    context 'when some docs topics are private' do
      let!(:group) { Fabricate(:group) }
      let!(:private_category) { Fabricate(:private_category, group: group) }
      let!(:private_topic) { Fabricate(:topic, category: private_category) }

      before do
        SiteSetting.docs_categories = "#{category.id}|#{private_category.id}"
      end

      it 'should not show topics in private categories without permissions' do
        get '/explorer.json'

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        expect(topics.size).to eq(2)
      end

      it 'should show topics when users have permissions' do
        admin = Fabricate(:admin)
        sign_in(admin)

        get '/explorer.json'

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        expect(topics.size).to eq(3)
      end
    end

    context 'when filtering by tag' do
      fab!(:tag2) { Fabricate(:tag, topics: [topic], name: 'test2') }
      fab!(:tag3) { Fabricate(:tag, topics: [topic], name: 'test3') }

      it 'should return a list filtered by tag' do
        get '/explorer.json?tags=test'

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        expect(topics.size).to eq(1)
      end

      it 'should properly filter with more than two tags' do
        get '/explorer.json?tags=test%7ctest2%7ctest3'

        expect(response.status).to eq(200)

        json = response.parsed_body
        tags = json['tags']
        topics = json['topics']['topic_list']['topics']

        expect(tags.size).to eq(3)
        expect(topics.size).to eq(1)
      end
    end

    context 'when filtering by category' do
      let!(:category2) { Fabricate(:category) }
      let!(:topic3) { Fabricate(:topic, category: category2) }

      before do
        SiteSetting.docs_categories = "#{category.id}|#{category2.id}"
      end

      it 'should return a list filtered by category' do
        get "/explorer.json?category=#{category2.id}"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        categories = json['categories']
        topics = json['topics']['topic_list']['topics']

        expect(categories.size).to eq(1)
        expect(topics.size).to eq(1)
      end

      it 'ignores category filter when incorrect argument' do
        get "/explorer.json?category=hack"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        categories = json['categories']
        topics = json['topics']['topic_list']['topics']

        expect(categories.size).to eq(2)
        expect(topics.size).to eq(3)

      end
    end

    context 'when ordering results' do
      context 'by title' do
        it 'should return the list ordered descending' do
          get "/explorer.json?order=title"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json['topics']['topic_list']['topics']

          expect(topics[0]['id']).to eq(topic2.id)
          expect(topics[1]['id']).to eq(topic.id)
        end

        it 'should return the list ordered ascending with an additional parameter' do
          get "/explorer.json?order=title&ascending=true"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json['topics']['topic_list']['topics']

          expect(topics[0]['id']).to eq(topic.id)
          expect(topics[1]['id']).to eq(topic2.id)
        end
      end

      context 'by date' do
        before do
          topic2.update(last_posted_at: Time.zone.now + 100)
        end

        it 'should return the list ordered descending' do
          get "/explorer.json?order=activity"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json['topics']['topic_list']['topics']

          expect(topics[0]['id']).to eq(topic.id)
          expect(topics[1]['id']).to eq(topic2.id)
        end

        it 'should return the list ordered ascending with an additional parameter' do
          get "/explorer.json?order=activity&ascending=true"

          expect(response.status).to eq(200)

          json = response.parsed_body
          topics = json['topics']['topic_list']['topics']

          expect(topics[0]['id']).to eq(topic2.id)
          expect(topics[1]['id']).to eq(topic.id)
        end
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
        get "/explorer.json?search=banana"

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        # ordered by latest for now

        expect(topics[0]["id"]).to eq(post2.topic_id)
        expect(topics[1]["id"]).to eq(post.topic_id)

        expect(topics.size).to eq(2)

        get "/explorer.json?search=walk"

        json = JSON.parse(response.body)
        topics = json['topics']['topic_list']['topics']

        expect(topics.size).to eq(1)

      end
    end

    context 'when getting topic first post contents' do
      let!(:non_ke_topic) { Fabricate(:topic) }

      it 'should correctly grab the topic' do
        get "/explorer.json?topic=#{topic.id}"

        expect(response.parsed_body['topic']['id']).to eq(topic.id)
      end

      it 'should get topics matching a selected docs tag or category' do
        get "/explorer.json?topic=#{non_ke_topic.id}"

        expect(response.parsed_body['topic']).to be_blank
      end

      it 'should return a docs topic when only tags are added to settings' do
        SiteSetting.docs_categories = nil

        get "/explorer.json?topic=#{topic.id}"

        expect(response.parsed_body['topic']['id']).to eq(topic.id)
      end

      it 'should return a docs topic when only categories are added to settings' do
        SiteSetting.docs_tags = nil

        get "/explorer.json?topic=#{topic.id}"

        expect(response.parsed_body['topic']['id']).to eq(topic.id)
      end

      it 'should create TopicViewItem' do
        admin = Fabricate(:admin)
        sign_in(admin)
        expect do
          get "/explorer.json?topic=#{topic.id}"
        end.to change { TopicViewItem.count }.by(1)
      end

      it 'should create TopicUser if authenticated' do
        expect do
          get "/explorer.json?topic=#{topic.id}&track_visit=true"
        end.not_to change { TopicUser.count }

        admin = Fabricate(:admin)
        sign_in(admin)
        expect do
          get "/explorer.json?topic=#{topic.id}&track_visit=true"
        end.to change { TopicUser.count }.by(1)
      end
    end
  end
end
