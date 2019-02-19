
const BrowserSync = require("browser-sync");

const BrowserSyncConfig = Object.freeze({
	port: 61616,
	open: false
});

/**
 * Read Karma config from karma.conf.js and BrowserSync from local object
 */
function readConfig() {
	return new Promise((resolve) => {
		resolve([BrowserSyncConfig]);
	});
}

function startBrowserSync(browserSyncConfig) {
	const browserSync = BrowserSync.create();

	browserSync.watch([
		"./specs/*.spec.js",
		"./src/*.js",
		"./src/*.css"
	], function (event, file) {
		if (event === "change") {
			browserSync.reload("*.css");
		}
	});

	browserSync.init(Object.assign({ }, browserSyncConfig, {
		server: "./src"
	}));
}

readConfig()
	.then(([browserSyncConfig]) => {
		startBrowserSync(browserSyncConfig);
	});
