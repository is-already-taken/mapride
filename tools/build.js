
const path = require("path");

const BrowserSync = require("browser-sync");

const KarmaConfig = require("karma").config;
const KarmaRunner = require("karma").runner;
const KarmaServer = require("karma").Server;

const BrowserSyncConfig = Object.freeze({
	port: 61616,
	open: false
});

function onChange(event, file, browserSync, { port: karmaPort }) {
	console.log(`BrowserSync: changed file ${file} (${event})`);

	if (event !== "change") {
		return;
	}

	if (/src[/]main\.js$/.test(file)) {
		return;
	}

	if (/\.css$/.test(file)) {
		browserSync.reload("*.css");
	}

	if (/\.js$/.test(file)) {
		console.log("Javascript changed - run tests.");

		// Run with no-op completion handler to prevent default
		// handler from exiting the process.
		KarmaRunner.run({ port: karmaPort }, () => {});
	}
}

/**
 * Read Karma config from karma.conf.js and BrowserSync from local object
 */
function readConfig() {
	return new Promise((resolve) => {
		const karmaConfig = KarmaConfig.parseConfig(path.resolve("./karma.conf.js"));

		// We use BrowserSync to watch and run Karma.
		karmaConfig.autoWatch = false;

		resolve([BrowserSyncConfig, karmaConfig]);
	});
}

function startBrowserSync(browserSyncConfig, karmaConfig) {
	const browserSync = BrowserSync.create();

	browserSync.watch([
		"./specs/*.spec.js",
		"./src/*.js",
		"./src/*.css"
	], (event, file) => { onChange(event, file, browserSync, karmaConfig); });

	browserSync.init(Object.assign({ }, browserSyncConfig, {
		server: "./src"
	}));
}

function startKarma(karmaConfig) {
	const karmaServer = new KarmaServer(karmaConfig, function(exitCode) {
		console.log(`Karma has exited with ${exitCode}`);

		process.exit(exitCode);
	});

	karmaServer.start();
}

readConfig()
	.then(([browserSyncConfig, karmaConfig]) => {
		startBrowserSync(browserSyncConfig, karmaConfig);
		startKarma(karmaConfig);
	});
