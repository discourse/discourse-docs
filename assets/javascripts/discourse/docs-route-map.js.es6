export default function () {
  this.route("docs", { path: "/docs" }, function () {
    this.route("index", { path: "/" });
  });
}
