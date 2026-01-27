# frozen_string_literal: true

module PageObjects
  module Pages
    class Docs < PageObjects::Pages::Base
      def visit
        page.visit("/docs")
        self
      end

      def has_topic?(title)
        page.has_css?(".raw-topic-link", text: title)
      end

      def has_no_topic?(title)
        page.has_no_css?(".raw-topic-link", text: title)
      end

      def has_docs_tag?(tag_name)
        page.has_css?(".docs-tags .docs-tag .tag-id", text: tag_name)
      end

      def has_no_docs_tag?(tag_name)
        page.has_no_css?(".docs-tags .docs-tag .tag-id", text: tag_name)
      end

      def has_selected_docs_tag?(tag_name)
        page.has_css?(".docs-tags .docs-tag.selected .tag-id", text: tag_name)
      end

      def has_no_selected_docs_tag?(tag_name)
        page.has_no_css?(".docs-tags .docs-tag.selected .tag-id", text: tag_name)
      end

      def click_tag(tag_name)
        find(".docs-filter-tag-#{tag_name} .docs-tag").click
        self
      end

      def has_topic_count?(count)
        page.has_css?(".topic-list-item", count: count)
      end
    end
  end
end
