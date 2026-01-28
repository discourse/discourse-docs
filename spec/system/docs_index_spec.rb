# frozen_string_literal: true

describe "Discourse Docs | Index" do
  fab!(:category)
  fab!(:topic_1) { Fabricate(:topic, category: category) }
  fab!(:topic_2) { Fabricate(:topic, category: category) }
  fab!(:post_1) { Fabricate(:post, topic: topic_1) }
  fab!(:post_2) { Fabricate(:post, topic: topic_2) }

  before do
    SiteSetting.docs_enabled = true
    SiteSetting.docs_categories = category.id.to_s

    if SiteSetting.respond_to?(:tooltips_enabled)
      # Unfortunately this plugin is enabled by default, and it messes with the docs specs
      SiteSetting.tooltips_enabled = false
    end
  end

  it "does not error when showing the index" do
    visit("/docs")
    expect(page).to have_css(".raw-topic-link", text: topic_1.title)
    expect(page).to have_css(".raw-topic-link", text: topic_2.title)
  end

  describe "topic excerpts" do
    before do
      topic_1.update_excerpt(post_1.excerpt_for_topic)
      topic_2.update_excerpt(post_2.excerpt_for_topic)
    end

    context "when docs_show_topic_excerpts is false" do
      before { SiteSetting.always_include_topic_excerpts = false }

      it "does not show the topic excerpts by default" do
        visit("/docs")
        expect(page).to have_css(".topic-list-item", count: 2)
        expect(page).to have_no_css(".topic-excerpt")
      end
    end

    context "when docs_show_topic_excerpts is true" do
      before { SiteSetting.always_include_topic_excerpts = true }

      it "shows the excerpts" do
        visit("/docs")
        expect(page).to have_css(".topic-excerpt", text: topic_1.excerpt)
        expect(page).to have_css(".topic-excerpt", text: topic_2.excerpt)
      end
    end

    context "when the theme modifier serialize_topic_excerpts is true" do
      before do
        ThemeModifierSet.find_by(theme_id: SiteSetting.default_theme_id).update!(
          serialize_topic_excerpts: true,
        )
        Theme.clear_cache!
      end

      after { Theme.clear_cache! }

      it "shows the excerpts" do
        visit("/docs")
        expect(page).to have_css(".topic-excerpt", text: topic_1.excerpt)
        expect(page).to have_css(".topic-excerpt", text: topic_2.excerpt)
      end
    end
  end
end
