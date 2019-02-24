
const path = require("path");

const BrowserSync = require("browser-sync");

const eslint = require("eslint");

const KarmaConfig = require("karma").config;
const KarmaRunner = require("karma").runner;
const KarmaServer = require("karma").Server;

const BrowserSyncConfig = Object.freeze({
	port: 61616,
	open: false
});

function onChange(event, file, browserSync, karmaConfig) {
	console.log(`BrowserSync: changed file ${file} (${event})`);

	if (event !== "change") {
		return;
	}

	if (/\.css$/.test(file)) {
		browserSync.reload("*.css");
	}

	if (/\.js$/.test(file)) {
		onCodeChange(file, karmaConfig);
	}
}

function onCodeChange(change, karmaConfig) {
	runEslint([change])
		.then(
			() => {
				if (/src[/]main\.js$/.test(change)) {
					return;
				}

				runTests(karmaConfig);
			},
			() => { /* don't run tests after linting error */ }
		);
}

function runEslint(changes) {
	return new Promise((resolve, reject) => {
		const formatter = eslint.CLIEngine.getFormatter();
		const engine = new eslint.CLIEngine();

		let report;

		console.log(`Linting ${changes.join(", ")}`);

		try {
			report = engine.executeOnFiles(changes);
		} catch (e) {
			console.warn("Error executing eslint on files:", e);
			reject();
		}

		console.log(formatter(report.results));

		if (report.errorCount === 0 && report.warningCount === 0) {
			console.log("Files are lintfree.");
		}

		if (report.errorCount > 0) {
			reject();
		} else {
			resolve();
		}
	});
}

function runTests({ port: karmaPort }) {
	// Run with no-op completion handler to prevent default
	// handler from exiting the process.
	KarmaRunner.run({ port: karmaPort }, () => {});
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

		runEslint([
			"specs/**/*.js",
			"src/**/*.js",
			"tools/**/*.js"
		]).then(null, () => { /* ignore linting errors for the initial run*/ });
	});
