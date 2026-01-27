# frozen_string_literal: true

describe "Discourse Docs | Index", type: :system do
  fab!(:category)
  fab!(:topic_1) { Fabricate(:topic, category: category) }
  fab!(:topic_2) { Fabricate(:topic, category: category) }
  fab!(:post_1) { Fabricate(:post, topic: topic_1) }
  fab!(:post_2) { Fabricate(:post, topic: topic_2) }

  let(:docs_page) { PageObjects::Pages::Docs.new }

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

  describe "tag filtering" do
    fab!(:tag_alpha) { Fabricate(:tag, name: "alpha") }
    fab!(:tag_beta) { Fabricate(:tag, name: "beta") }
    fab!(:tagged_topic) { Fabricate(:topic, category: category, tags: [tag_alpha]) }
    fab!(:both_tags_topic) { Fabricate(:topic, category: category, tags: [tag_alpha, tag_beta]) }

    before do
      SiteSetting.tagging_enabled = true
      SiteSetting.docs_tags = "alpha|beta"
      Fabricate(:post, topic: tagged_topic)
      Fabricate(:post, topic: both_tags_topic)
    end

    it "displays tags by name and filters topics when a tag is clicked" do
      docs_page.visit

      expect(docs_page).to have_docs_tag("alpha")
      expect(docs_page).to have_docs_tag("beta")

      docs_page.click_tag("alpha")

      expect(docs_page).to have_selected_docs_tag("alpha")
      expect(docs_page).to have_topic(tagged_topic.title)
      expect(docs_page).to have_topic(both_tags_topic.title)
    end

    it "deselects a tag when clicked again" do
      docs_page.visit
      docs_page.click_tag("alpha")

      expect(docs_page).to have_selected_docs_tag("alpha")

      docs_page.click_tag("alpha")

      expect(docs_page).to have_no_selected_docs_tag("alpha")
    end
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
