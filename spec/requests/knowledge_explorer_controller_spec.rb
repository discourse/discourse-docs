# frozen_string_literal: true

require 'rails_helper'

describe KnowledgeExplorer::KnowledgeExplorerController do
  let!(:category) { Fabricate(:category) }
  let!(:topic) { Fabricate(:topic, category: category) }
  let!(:topic2) { Fabricate(:topic, category: category) }
  let!(:tag) { Fabricate(:tag, topics: [topic], name: 'test') }

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

    context "when some knowledge explorer topics are private" do
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
      it 'should return a filtered list' do
        get '/knowledge-explorer.json?tags=test'

        expect(response.status).to eq(200)

        json = JSON.parse(response.body)
        tags = json['tags']
        topics = json['topics']['topic_list']['topics']

        expect(tags.size).to eq(1)
        expect(topics.size).to eq(1)
      end
    end
  end
end
