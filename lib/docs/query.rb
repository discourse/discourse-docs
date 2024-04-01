# frozen_string_literal: true

module Docs
  class Query
    def initialize(guardian, filters = {})
      @guardian = guardian
      @filters = filters
      @limit = 30
    end

    def self.categories
      SiteSetting.docs_categories.split("|")
    end

    def self.tags
      SiteSetting.docs_tags.split("|")
    end

    def list
      # query for topics matching selected categories & tags
      opts = { no_definitions: true, limit: false }
      tq = TopicQuery.new(@guardian.user, opts)
      results = tq.list_docs_topics
      results =
        results.left_outer_joins(SiteSetting.show_tags_by_group ? { tags: :tag_groups } : :tags)
      results = results.references(:categories)
      results =
        results.where("topics.category_id IN (?)", Query.categories).or(
          results.where("tags.name IN (?)", Query.tags),
        )

      # filter results by selected tags
      if @filters[:tags].present?
        tag_filters = @filters[:tags].split("|")
        tags_count = tag_filters.length
        tag_filters = Tag.where_name(tag_filters).pluck(:id) unless Integer === tag_filters[0]

        if tags_count == tag_filters.length
          tag_filters.each_with_index do |tag, index|
            # to_i to make it clear this is not an injection
            sql_alias = "tt#{index.to_i}"
            results =
              results.joins(
                "INNER JOIN topic_tags #{sql_alias} ON #{sql_alias}.topic_id = topics.id AND #{sql_alias}.tag_id = #{tag}",
              )
          end
        else
          results = results.none # don't return any results unless all tags exist in the database
        end
      end

      if @filters[:solved].present?
        results =
          results.where(
            "topics.id IN (
          SELECT tc.topic_id
          FROM topic_custom_fields tc
          WHERE tc.name = 'accepted_answer_post_id' AND
                          tc.value IS NOT NULL
        )",
          )
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
          results = results.reorder("topics.title")
        else
          results = results.reorder("topics.title DESC")
        end
      elsif @filters[:order] == "activity"
        if @filters[:ascending].present?
          results = results.reorder("topics.last_posted_at")
        else
          results = results.reorder("topics.last_posted_at DESC")
        end
      end

      # conduct a second set of joins so we don't mess up the count
      count_query = results.joins <<~SQL
        INNER JOIN topic_tags ttx ON ttx.topic_id = topics.id
        INNER JOIN tags t2 ON t2.id = ttx.tag_id
      SQL

      if SiteSetting.show_tags_by_group
        enabled_tag_groups = SiteSetting.docs_tag_groups.split("|")
        subquery = TagGroup.where(name: enabled_tag_groups).select(:id)
        results = results.joins(tags: :tag_groups).where(tag_groups: { id: subquery })

        tags =
          count_query
            .joins(tags: :tag_groups)
            .where(tag_groups: { id: subquery })
            .group("tag_groups.id", "tag_groups.name", "tags.name")
            .reorder("")
            .count

        tags = create_group_tags_object(tags)
      else
        tags = count_query.group("t2.name").reorder("").count
        tags = create_tags_object(tags)
      end

      categories =
        results
          .where("topics.category_id IS NOT NULL")
          .group("topics.category_id")
          .reorder("")
          .count
      categories = create_categories_object(categories)

      # filter results by selected category
      # needs to be after building categories filter list
      if @filters[:category].present?
        category_ids = @filters[:category].split("|")
        results =
          results.where("topics.category_id IN (?)", category_ids) if category_ids.all? { |id|
          id =~ /\A\d+\z/
        }
      end

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

      topic_list = TopicListSerializer.new(topic_query, scope: @guardian).as_json

      if end_of_list.nil?
        topic_list["load_more_url"] = load_more_url
      else
        topic_list["load_more_url"] = nil
      end

      tags_key = SiteSetting.show_tags_by_group ? :tag_groups : :tags
      {
        tags_key => tags,
        :categories => categories,
        :topics => topic_list,
        :topic_count => results_length,
        :meta => {
          show_topic_excerpts: show_topic_excerpts,
        },
      }
    end

    def create_group_tags_object(tags)
      tags_hash = ActiveSupport::OrderedHash.new
      allowed_tags = DiscourseTagging.filter_allowed_tags(Guardian.new(@user)).map(&:name)

      tags.each do |group_tags_data, count|
        group_tag_id, group_tag_name, tag_name = group_tags_data
        active = @filters[:tags]&.include?(tag_name)

        tags_hash[group_tag_id] ||= { id: group_tag_id, name: group_tag_name, tags: [] }
        tags_hash[group_tag_id][:tags] << { id: tag_name, count: count, active: active }
      end

      tags_hash
        .transform_values do |group|
          group[:tags] = group[:tags].filter { |tag| allowed_tags.include?(tag[:id]) }
          group
        end
        .values
    end

    def create_tags_object(tags)
      tags_object = []

      tags.each do |tag|
        active = @filters[:tags].include?(tag[0]) if @filters[:tags]
        tags_object << { id: tag[0], count: tag[1], active: active || false }
      end

      allowed_tags = DiscourseTagging.filter_allowed_tags(@guardian).map(&:name)

      tags_object = tags_object.select { |tag| allowed_tags.include?(tag[:id]) }

      tags_object.sort_by { |tag| [tag[:active] ? 0 : 1, -tag[:count]] }
    end

    def create_categories_object(category_counts)
      categories =
        Category
          .where(id: category_counts.keys)
          .includes(
            :uploaded_logo,
            :uploaded_logo_dark,
            :uploaded_background,
            :uploaded_background_dark,
          )
          .joins("LEFT JOIN topics t on t.id = categories.topic_id")
          .select("categories.*, t.slug topic_slug")

      Category.preload_user_fields!(@guardian, categories)

      categories
        .map do |category|
          count = category_counts[category.id]
          active = @filters[:category] && @filters[:category].include?(category.id.to_s)

          if @guardian.can_lazy_load_categories?
            BasicCategorySerializer
              .new(categories[id], scope: @guardian, root: false)
              .as_json
              .merge(count:, active:)
          else
            { id: category.id, count:, active: }
          end
        end
        .sort_by { |category| [category[:active] ? 0 : 1, -category[:count]] }
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
        filters.push("page=1")
      end

      "/#{GlobalSetting.docs_path}.json?#{filters.join("&")}"
    end

    def show_topic_excerpts
      SiteSetting.always_include_topic_excerpts ||
        ThemeModifierHelper.new(request: @guardian.request).serialize_topic_excerpts
    end
  end
end
