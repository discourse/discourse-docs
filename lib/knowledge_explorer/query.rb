# frozen_string_literal: true

module KnowledgeExplorer
  class Query

    def initialize(user = nil, filters = {})
      @user = user
      @filters = filters
    end

    def categories
      SiteSetting.knowledge_explorer_categories.split("|")
    end

    def tags
      SiteSetting.knowledge_explorer_tags.split("|")
    end

    def get

      tq = TopicQuery.new(@user)
      results = tq.latest_results({:no_definitions => true})
      results = results.where("category_id IN (?)", categories)
      topic_query = tq.create_list(:knowledge_base, {}, results)
    end
  end
end
