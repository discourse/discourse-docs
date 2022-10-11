# frozen_string_literal: true

class DocsUrlConstraint
  def matches?(_request)
    return ["/#{SiteSetting.docs_url_path}", "/#{SiteSetting.docs_url_path}.json"].include? _request.path;
  end
end
