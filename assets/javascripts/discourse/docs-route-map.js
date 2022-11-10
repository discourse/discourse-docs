import { getDocs } from "../lib/get-docs";

export default function () {
  const docsPath = getDocs();

  this.route("docs", { path: "/" + docsPath }, function () {
    this.route("index", { path: "/" });
  });
}
