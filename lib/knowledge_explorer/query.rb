# frozen_string_literal: true

module KnowledgeExplorer
  class KnowledgeExplorerQuery

    def initialize(filters = {})
      @filters = filters
    end

    def self.guardian
      Guardian.new(current_user)
    end

    def self.categories
      selected_categories = SiteSetting.knowledge_explorer_categories.split("|")

      if selected_categories
        categories = Category.where('id IN (?)', selected_categories)

        return categories.select { |c| guardian.can_see_category?(c) }
      end
    end

    def self.tags
      selected_tags = SiteSetting.knowledge_explorer_tags.split("|")

      if selected_tags
        return Tag.where('name IN (?)', selected_tags)
      end
    end

    def get

      tq = TopicQuery.new
      results = tq.latest_results
      byebug
      #results = results.where("category_id IN (5,6)") 
      #topic_query = tq.create_list(:knowledge_base, {}, results)

    end
  end
end
