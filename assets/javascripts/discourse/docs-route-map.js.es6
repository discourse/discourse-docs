export default function () {
  this.route("docs", { path: "/explorer" }, function () {
    this.route("index", { path: "/" });
  });
}
