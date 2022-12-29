# frozen_string_literal: true

require "rails_helper"

describe SiteSerializer do
  fab!(:user) { Fabricate(:user) }
  let(:guardian) { Guardian.new(user) }

  before do
    SiteSetting.docs_enabled = true
    GlobalSetting.stubs(:docs_path).returns("docs")
  end

  it "returns correct default value" do
    data = described_class.new(Site.new(guardian), scope: guardian, root: false).as_json

    expect(data[:docs_path]).to eq("docs")
  end

  it "returns custom path based on global setting" do
    GlobalSetting.stubs(:docs_path).returns("custom_path")
    data = described_class.new(Site.new(guardian), scope: guardian, root: false).as_json

    expect(data[:docs_path]).to eq("custom_path")
  end
end
