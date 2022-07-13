# frozen_string_literal: true

require 'rails_helper'

describe RobotsTxtController do
  before do
    SiteSetting.docs_enabled = true
  end

  it 'adds /docs/ to robots.txt' do
    get '/robots.txt'

    expect(response.body).to include('User-agent: *')
    expect(response.body).to include('Disallow: /docs/')
  end
end