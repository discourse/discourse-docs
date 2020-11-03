export default function () {
  this.route("knowledgeExplorer", { path: "/docs" }, function () {
    this.route("index", { path: "/" });
  });
}
