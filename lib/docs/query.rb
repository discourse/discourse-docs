# frozen_string_literal: true

module Docs
  class Query
    def initialize(user = nil, filters = {})
      @user = user
      @filters = filters
      @limit = 30
    end

    def self.categories
      SiteSetting.docs_categories.split('|')
    end

    def self.tags
      SiteSetting.docs_tags.split('|')
    end

    def list
      # query for topics matching selected categories & tags
      opts = { no_definitions: true, limit: false }
      tq = TopicQuery.new(@user, opts)
      results = tq.list_docs_topics
      results = results.left_outer_joins(:tags)
      results = results.references(:categories)
      results = results.where('topics.category_id IN (?)', Query.categories).or(results.where('tags.name IN (?)', Query.tags))

      # filter results by selected category
      if @filters[:category].present?
        category_ids = @filters[:category].split('|')
        results = results.where('topics.category_id IN (?)', category_ids) if category_ids.all? { |id| id =~ /\A\d+\z/ }
      end

      # filter results by selected tags
      if @filters[:tags].present?
        tag_filters = @filters[:tags].split('|')
        tags_count = tag_filters.length
        tag_filters = Tag.where_name(tag_filters).pluck(:id) unless Integer === tag_filters[0]

        if tags_count == tag_filters.length
          tag_filters.each_with_index do |tag, index|
            # to_i to make it clear this is not an injection
            sql_alias = "tt#{index.to_i}"
            results = results.joins("INNER JOIN topic_tags #{sql_alias} ON #{sql_alias}.topic_id = topics.id AND #{sql_alias}.tag_id = #{tag}")
          end
        else
          results = results.none # don't return any results unless all tags exist in the database
        end
      end

      if @filters[:solved].present?
        results = results.where("topics.id IN (
          SELECT tc.topic_id
          FROM topic_custom_fields tc
          WHERE tc.name = 'accepted_answer_post_id' AND
                          tc.value IS NOT NULL
        )")
      end

      # filter results by search term
      if @filters[:search_term].present?
        term = Search.prepare_data(@filters[:search_term])
        escaped_ts_query = Search.ts_query(term: term)

        results = results.where(<<~SQL)
          topics.id IN (
            SELECT pp.topic_id FROM post_search_data pd
            JOIN posts pp ON pp.id = pd.post_id AND pp.post_number = 1
            JOIN topics tt ON pp.topic_id = tt.id
            WHERE
              tt.id = topics.id AND
              pp.deleted_at IS NULL AND
              tt.deleted_at IS NULL AND
              pp.post_type <> #{Post.types[:whisper].to_i} AND
              pd.search_data @@ #{escaped_ts_query}
          )
        SQL
      end

      if @filters[:order] == "title"
        if @filters[:ascending].present?
          results = results.reorder('topics.title')
        else
          results = results.reorder('topics.title DESC')
        end
      elsif @filters[:order] == "activity"
        if @filters[:ascending].present?
          results = results.reorder('topics.last_posted_at')
        else
          results = results.reorder('topics.last_posted_at DESC')
        end
      end

      # conduct a second set of joins so we don't mess up the count
      count_query = results.joins <<~SQL
        INNER JOIN topic_tags ttx ON ttx.topic_id = topics.id
        INNER JOIN tags t2 ON t2.id = ttx.tag_id
      SQL
      tags = count_query.group('t2.name').reorder('').count
      tags = create_tags_object(tags)
      categories = results.where('topics.category_id IS NOT NULL').group('topics.category_id').reorder('').count
      categories = create_categories_object(categories)

      results_length = results.size

      if @filters[:page]
        offset = @filters[:page].to_i * @limit
        page_range = offset + @limit
        end_of_list = true if page_range > results_length
      else
        offset = 0
        page_range = @limit
        end_of_list = true if results_length < @limit
      end

      results = results.offset(offset).limit(@limit) #results[offset...page_range]

      # assemble the object
      topic_query = tq.create_list(:docs, { unordered: true }, results)

      topic_list = TopicListSerializer.new(topic_query, scope: Guardian.new(@user)).as_json

      if end_of_list.nil?
        topic_list['load_more_url'] = load_more_url
      else
        topic_list['load_more_url'] = nil
      end

      { tags: tags, categories: categories, topics: topic_list, topic_count: results_length }
    end

    def create_tags_object(tags)
      tags_object = []

      tags.each do |tag|
        active = @filters[:tags].include?(tag[0]) if @filters[:tags]
        tags_object << { id: tag[0], count: tag[1], active: active || false }
      end

      allowed_tags = DiscourseTagging.filter_allowed_tags(Guardian.new(@user)).map(&:name)

      tags_object = tags_object.select { |tag| allowed_tags.include?(tag[:id]) }

      tags_object.sort_by { |tag| [tag[:active] ? 0 : 1, -tag[:count]] }
    end

    def create_categories_object(categories)
      categories_object = []

      categories.each do |category|
        active = @filters[:category].include?(category[0].to_s) if @filters[:category]
        categories_object << { id: category[0], count: category[1], active: active || false }
      end

      categories_object.sort_by { |category| [category[:active] ? 0 : 1, -category[:count]] }
    end

    def load_more_url
      filters = []

      filters.push("tags=#{@filters[:tags]}") if @filters[:tags].present?
      filters.push("category=#{@filters[:category]}") if @filters[:category].present?
      filters.push("solved=#{@filters[:solved]}") if @filters[:solved].present?
      filters.push("search=#{@filters[:search_term]}") if @filters[:search_term].present?
      filters.push("sort=#{@filters[:sort]}") if @filters[:sort].present?

      if @filters[:page].present?
        filters.push("page=#{@filters[:page].to_i + 1}")
      else
        filters.push('page=1')
      end

      "/docs.json?#{filters.join('&')}"
    end
  end
end
