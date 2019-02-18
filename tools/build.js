
const browserSync = require("browser-sync").create();

browserSync.watch([
	"./src/*.css"
], function (event, file) {
	if (event === "change") {
		bs.reload("*.css");
	}
});

browserSync.init({
	open: false,
	port: 61616,
	server: "./src"
});
