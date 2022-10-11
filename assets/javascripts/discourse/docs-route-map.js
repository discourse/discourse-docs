import { getDocs } from "../lib/get-docs";

export default function () {
  const docs_url = getDocs();

  this.route("docs", { path: "/" + docs_url }, function () {
    this.route("index", { path: "/" });
  });
}
