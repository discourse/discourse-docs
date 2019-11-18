# frozen_string_literal: true

module KnowledgeExplorer
  class Query
    def initialize(user = nil, filters = {})
      @user = user
      @filters = filters
      @limit = 30
    end

    def self.categories
      SiteSetting.knowledge_explorer_categories.split('|')
    end

    def self.tags
      SiteSetting.knowledge_explorer_tags.split('|')
    end

    def list
      # query for topics matching selected categories & tags
      tq = TopicQuery.new(@user)
      results = tq.latest_results(no_definitions: true, limit: false)
      results = results.left_outer_joins(:tags)
      results = results.where('topics.category_id IN (?)', Query.categories).or(results.where('tags.name IN (?)', Query.tags))

      # filter results by selected category
      if @filters[:category].present?
        results = results.where('topics.category_id IN (?)', @filters[:category].split('|'))
      end

      # filter results by selected tags
      if @filters[:tags].present?
        tag_filters = @filters[:tags].split('|')
        tags_count = tag_filters.length
        tag_filters = Tag.where_name(tag_filters).pluck(:id) unless Integer === tag_filters[0]

        if tags_count == tag_filters.length
          tag_filters.each_with_index do |tag, index|
            sql_alias = ['t', index].join
            results = results.joins("INNER JOIN topic_tags #{sql_alias} ON #{sql_alias}.topic_id = topics.id AND #{sql_alias}.tag_id = #{tag}")
          end
        else
          results = results.none # don't return any results unless all tags exist in the database
        end
      end

      # filter results by search term
      if @filters[:search_term].present?
        results = results.where('lower(title) LIKE ?', "%#{@filters[:search_term].downcase}%")
      end

      if @filters[:order] == "title"
        if @filters[:ascending].present?
          results = results.reorder('title')
        else
          results = results.reorder('title DESC')
        end
      elsif @filters[:order] == "activity"
        if @filters[:ascending].present?
          results = results.reorder('last_posted_at')
        else
          results = results.reorder('last_posted_at DESC')
        end
      end

      tags = tag_count(results)
      categories = categories_count(results)

      results_length = results.length

      if @filters[:page]
        offset = @filters[:page].to_i * @limit
        page_range = offset + @limit
        end_of_list = true if page_range > results_length
      else
        offset = 0
        page_range = @limit
        end_of_list = true if results_length < @limit
      end

      results = results[offset...page_range]

      # assemble the object
      topic_query = tq.create_list(:knowledge_explorer, { unordered: true }, results)

      topic_list = TopicListSerializer.new(topic_query, scope: Guardian.new(@user)).as_json

      if end_of_list.nil?
        topic_list['load_more_url'] = load_more_url
      else
        topic_list['load_more_url'] = nil
      end

      { tags: tags, categories: categories, topics: topic_list }
    end

    def tag_count(results)
      tags = []

      results.each do |topic|
        topic.tags.each do |tag|
          active = @filters[:tags].include?(tag.name) if @filters[:tags]
          if tags.none? { |item| item[:id].to_s == tag.name }
            tags << { id: tag.name, count: 1, active: active || false }
          else
            tag_index = tags.index(tags.find { |item| item[:id].to_s == tag.name })
            tags[tag_index][:count] += 1
          end
        end
      end

      tags.sort_by { |tag| [tag[:active] ? 0 : 1, -tag[:count]] }
    end

    def categories_count(results)
      categories = []

      results.each do |topic|
        active = @filters[:category].include?(topic.category_id.to_s) if @filters[:category]
        if categories.none? { |item| item[:id] == topic.category_id }
          categories << { id: topic.category_id, count: 1, active: active || false }
        else
          category_index = categories.index(categories.find { |item| item[:id] == topic.category_id })
          categories[category_index][:count] += 1
        end
      end

      categories.sort_by { |category| [category[:active] ? 0 : 1, -category[:count]] }
    end

    def load_more_url
      filters = []

      filters.push("tags=#{@filters[:tags]}") if @filters[:tags].present?
      filters.push("category=#{@filters[:category]}") if @filters[:category].present?
      filters.push("search=#{@filters[:search_term]}") if @filters[:search_term].present?
      filters.push("sort=#{@filters[:sort]}") if @filters[:sort].present?

      if @filters[:page].present?
        filters.push("page=#{@filters[:page].to_i + 1}")
      else
        filters.push('page=1')
      end

      "/knowledge-explorer.json?#{filters.join('&')}"
    end
  end
end
