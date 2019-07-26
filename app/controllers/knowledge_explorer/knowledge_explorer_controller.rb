module KnowledgeExplorer
  class KnowledgeExplorerController < ApplicationController
    requires_plugin 'knowledge-explorer'
    before_action :init_guardian

    def index

      filters = {
        tags: params[:tags],
        category: params[:category]
      }

      if filters[:category]
       category_topic_lists = get_topics_from_categories(category_by_filter(filters[:category]))
      else
       category_topic_lists = get_topics_from_categories(knowledge_explorer_categories)
      end

      if filters[:tags]
        tag_topic_lists = get_topics_from_tags(tags_by_filter(filters[:tags]))
      else
        tag_topic_lists = get_topics_from_tags(knowledge_explorer_tags)
      end

      # Deduplicate results

      topics = []

      category_topic_lists.each do |list|
        list[:topic_list][:topics].each do |t| 
          if topics.none?{|item| item[:id] == t[:id]}
            if t[:id] != Category.find(t[:category_id]).topic_id
              topics << t
            end
          end
        end
      end
      tag_topic_lists.each do |list|
        list[:topic_list][:topics].each do |t| 
          if topics.none?{|item| item[:id] == t[:id]}
            topics << t
          end
        end
      end

      topics = count_tags(topics)

      render json: topics
    end

    def get_topics_from_categories(categories)
      category_topic_lists = []

      categories.each do |c|
        if topic_list = TopicQuery.new(current_user, category: c.id).list_latest
          category_topic_lists << TopicListSerializer.new(topic_list, scope: @guardian).as_json
        end
      end

      category_topic_lists
    end

    def get_topics_from_tags(tags)
      tag_topic_lists = []

      tags.each do |t|
        if topic_list = TopicQuery.new(current_user, tags: t.name).list_latest
          tag_topic_lists << TopicListSerializer.new(topic_list, scope: @guardian).as_json
        end
      end

      tag_topic_lists
    end

    def count_tags(topics)
      tags = []

      topics.each do |topic|
        topic[:tags].each do |tag| 
          if tags.none? { |item| item[:id].to_s == tag }
            tags << { id: tag, count: 1 }
          else
            tag_index = tags.index(tags.find { |item| item[:id].to_s == tag })
            tags[tag_index][:count] += 1
          end
        end
      end

      { tags: tags, topics: topics }
    end

    private

    def init_guardian
      @guardian = Guardian.new(current_user)
    end
    
    def knowledge_explorer_categories
      selected_categories = SiteSetting.knowledge_explorer_categories.split("|")

      categories = Category.where('slug IN (?)', selected_categories)

      categories.select { |c| @guardian.can_see_category?(c) }
    end

    def knowledge_explorer_tags
      selected_tags = SiteSetting.knowledge_explorer_tags.split("|")

      Tag.where('name IN (?)', selected_tags)
    end

    def category_by_filter(category_filter)
      selected_category = category_filter

      category = Category.where('slug IN (?)', selected_category)

      category.select { |c| @guardian.can_see_category?(c) }
    end

    def tags_by_filter(tags)
      selected_tags = tags.split(' ')
      Tag.where('name IN (?)', selected_tags)
    end
  end
end
