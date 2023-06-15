# frozen_string_literal: true

describe "Discourse Docs | Index", type: :system do
  fab!(:current_user) { Fabricate(:user) }
  fab!(:category) { Fabricate(:category) }
  fab!(:topic_1) { Fabricate(:topic, category: category) }
  fab!(:topic_2) { Fabricate(:topic, category: category) }
  fab!(:post_1) { Fabricate(:post, topic: topic_1) }
  fab!(:post_2) { Fabricate(:post, topic: topic_2) }

  before do
    SiteSetting.docs_enabled = true
    SiteSetting.docs_categories = category.id.to_s
    sign_in(current_user)
  end

  it "does not error when showing the index" do
    visit("/docs")
    expect(page).to have_css(".docs-topic-link", text: topic_1.title)
    expect(page).to have_css(".docs-topic-link", text: topic_2.title)
  end

  describe "topic excerpts" do
    before do
      topic_1.update_excerpt(post_1.excerpt_for_topic)
      topic_2.update_excerpt(post_2.excerpt_for_topic)
    end

    it "does not show the topic excerpts by default" do
      visit("/docs")
      expect(page).to have_no_css(".topic-excerpt")
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
        ThemeModifierSet.find_by(theme_id: Theme.first.id).update!(serialize_topic_excerpts: true)
        Theme.clear_cache!
      end

      it "shows the excerpts" do
        visit("/docs")
        expect(page).to have_css(".topic-excerpt", text: topic_1.excerpt)
        expect(page).to have_css(".topic-excerpt", text: topic_2.excerpt)
      end
    end
  end
end
