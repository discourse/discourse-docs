# frozen_string_literal: true

module KnowledgeExplorer
  class Query

    def initialize(user = nil, filters = {})
      @user = user
      @filters = filters
    end

    def categories
      SiteSetting.knowledge_explorer_categories.split('|')
    end

    def tags
      SiteSetting.knowledge_explorer_tags.split('|')
    end

    def get

      # query for topics matching selected categories & tags
      tq = TopicQuery.new(@user)
      results = tq.latest_results({ :no_definitions => true })
      results = results.left_outer_joins(:tags)
      results = results.where('category_id IN (?)', categories).or(results.where('tags.name IN (?)', tags))

      # filter results by selected category
      unless @filters[:category].nil?
        results = results.where('category_id IN (?)', @filters[:category])
      end

      # filter results by selected tags
      unless @filters[:tags].nil?
        tag_filters = @filters[:tags].split('|')
        results = results.where('tags.name IN (?)', tag_filters)
          .group('id')
          .having('count(distinct tags.name) = ?', tag_filters.count)
      end

      # filter results by search term
      unless @filters[:search_term].nil?
        results = results.where('title LIKE ?', "%#{@filters[:search_term]}%")
      end

      tags = tag_count(results)

      # assemble the object
      topic_query = tq.create_list(:knowledge_explorer, {}, results)

      topic_list = TopicListSerializer.new(topic_query, scope: Guardian.new(@user)).as_json

      { tags: tags, topics: topic_list }
    end

    def tag_count(results)
      tags = []

      results.each do |topic|
        topic.tags.each do |tag|
          if @filters[:tags]
            active = @filters[:tags].include?(tag.name)
          end
          if tags.none? { |item| item[:id].to_s == tag.name }
            tags << { id: tag.name, count: 1 , active: active || false }
          else
            tag_index = tags.index(tags.find { |item| item[:id].to_s == tag.name })
            tags[tag_index][:count] += 1
          end
        end
      end

      tags.sort_by { |tag| [tag[:active] ? 0 : 1, -tag[:count]] }
    end
  end
end
