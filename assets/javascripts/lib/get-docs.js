import Site from "discourse/models/site";

export function getDocs() {
  return Site.currentProp("docs_url") || "docs";
}
