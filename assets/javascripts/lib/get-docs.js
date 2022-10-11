import { getOwner } from "discourse-common/lib/get-owner";

const siteSettings = getOwner(this).lookup("site-settings:main");

export function getDocs() {
  let url_path = siteSettings.docs_url_path;
  return url_path; 
}
