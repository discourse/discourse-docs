# frozen_string_literal: true

require "rails_helper"

describe Docs do
  fab!(:category)
  fab!(:topic) { Fabricate(:topic, category: category) }
  fab!(:post) { Fabricate(:post, topic: topic) }
  fab!(:non_docs_category, :category)
  fab!(:non_docs_topic) { Fabricate(:topic, category: non_docs_category) }
  fab!(:non_docs_post) { Fabricate(:post, topic: non_docs_topic) }

  before do
    SiteSetting.docs_enabled = true
    SiteSetting.docs_categories = category.id.to_s
    GlobalSetting.stubs(:docs_path).returns("docs")
  end

  describe "docs oneboxes" do
    let(:docs_list_url) { "#{Discourse.base_url}/#{GlobalSetting.docs_path}" }
    let(:docs_topic_url) { "#{Discourse.base_url}/#{GlobalSetting.docs_path}?topic=#{topic.id}" }
    let(:non_docs_topic_url) do
      "#{Discourse.base_url}/#{GlobalSetting.docs_path}?topic=#{non_docs_topic.id}"
    end

    context "when inline" do
      it "renders docs list" do
        results = InlineOneboxer.new([docs_list_url], skip_cache: true).process
        expect(results).to be_present
        expect(results[0][:url]).to eq(docs_list_url)
        expect(results[0][:title]).to eq(I18n.t("js.docs.title"))
      end

      it "renders docs topic" do
        results = InlineOneboxer.new([docs_topic_url], skip_cache: true).process
        expect(results).to be_present
        expect(results[0][:url]).to eq(docs_topic_url)
        expect(results[0][:title]).to eq(topic.title)
      end

      it "does not render topic if not in docs" do
        results = InlineOneboxer.new([non_docs_topic_url], skip_cache: true).process
        expect(results).to be_empty
      end
    end

    context "when regular" do
      it "renders docs list" do
        onebox = Oneboxer.preview(docs_list_url)
        expect(onebox).to match_html <<~HTML
          <aside class="onebox docs-onebox">
            <article class="onebox-body docs-onebox-body">
              <h3>
                <a href="#{docs_list_url}">#{I18n.t("js.docs.title")}</a>
              </h3>
            </article>
          </aside>
        HTML
      end

      it "renders docs topic" do
        onebox = Oneboxer.preview(docs_topic_url)
        expect(onebox).to include(%{data-topic="#{topic.id}">})
        expect(onebox).to include(PrettyText.avatar_img(post.user.avatar_template_url, "tiny"))
        expect(onebox).to include(%{<a href="#{docs_topic_url}">#{topic.title}</a>})
        expect(onebox).to include(post.excerpt)
      end

      it "does not onebox topic if not in docs" do
        onebox = Oneboxer.preview(non_docs_topic_url)
        expect(onebox).to eq(%{<a href='#{non_docs_topic_url}'>#{non_docs_topic_url}</a>})
      end
    end
  end
end
