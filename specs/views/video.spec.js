
import { VideoModule } from "../../src/js/views/video.js";
import { LoadScriptModule } from "../../src/js/foundation/loadScript.js";
const Video = VideoModule.Video;

describe("Video", () => {
	let resolveScriptLoad,
		state,
		subscribeSpy,
		instantiationArgs,
		instantiationTrigger,
		YT;

	function MockPlayer() {
		instantiationArgs = [...arguments];
		instantiationTrigger();
	}

	MockPlayer.prototype.getPlayerState = () => { };
	MockPlayer.prototype.getCurrentTime = () => { };

	beforeEach(() => {
		let loadScriptPromise;

		subscribeSpy = jasmine.createSpy("subscribe");

		instantiationArgs = null;
		// Can be defined by tests, will be called by the construtor to 
		// notify for instantiation
		instantiationTrigger = () => { };

		// Mock Youtube
		YT = window.YT = {
			Player: MockPlayer,
			PlayerState: {
				UNSTARTED: -1,
				ENDED: 0,
				PLAYING: 1,
				PAUSED: 2,
				BUFFERING: 3,
				CUED: 5
			}
		};

		state = { 
			state: { videoId: "foo47" },
			subscribe: subscribeSpy
		};

		loadScriptPromise = new Promise((resolve) => {
			resolveScriptLoad = resolve;
		});

		spyOn(LoadScriptModule, "loadScript")
			.and.returnValue(loadScriptPromise);
		spyOn(document, "querySelector")
			.and.returnValue(document.createElement("div"));
	});

	it("should load the API", () => {
		Video(state);

		expect(LoadScriptModule.loadScript)
			.toHaveBeenCalledWith(
				"https://www.youtube.com/iframe_api",
				"onYouTubeIframeAPIReady"
			);
	});

	describe("instantiation", () => {
		beforeEach((done) => {
			instantiationTrigger = done;

			Video(state);
			resolveScriptLoad();
		});

		it("should instantiate the Youtube player", () => {
			expect(instantiationArgs).not.toBe(null);
		});

		it("should pass the player element as first argument", () => {
			expect(instantiationArgs[0]).toEqual(jasmine.any(Element));
		});

		it("should pass the player config as second argument", () => {
			expect(instantiationArgs[1]).toEqual(
				jasmine.objectContaining({
					height: "720",
					width: "1280",
					events: {
						onReady: jasmine.any(Function),
						onStateChange: jasmine.any(Function)
					},
					videoId: state.state.videoId,
				})
			);
		});
	});

	describe("Player.onReady", () => {
		let capturedOnReady;

		beforeEach((done) => {
			instantiationTrigger = () => {
				capturedOnReady = instantiationArgs[1]
										.events.onReady;

				// Video internally uses a async function (Promise), wait
				// for the next tick
				setTimeout(done);

				// Install clock after player was initialize, same reason
				// as before
				jasmine.clock().install();
			};

			spyOn(MockPlayer.prototype, "getPlayerState")
				.and.returnValue(0);
			spyOn(MockPlayer.prototype, "getCurrentTime")
				.and.returnValue(0);

			Video(state);
			resolveScriptLoad();
		});

		afterEach(() => {
			jasmine.clock().uninstall();
		});

		it("should set State videoReady: true when called", () => {
			capturedOnReady();

			expect(state.state.videoReady).toBe(true);
		});
	});

	describe("Player.onStateChange", () => {
		let capturedOnStateChange;

		beforeEach((done) => {
			instantiationTrigger = () => {
				capturedOnStateChange = instantiationArgs[1]
											.events.onStateChange;

				// Video internally uses a async function (Promise), wait 
				// for the next tick
				setTimeout(done);

				// Install clock after player was initialize, same reason 
				// as before
				jasmine.clock().install();
			};

			spyOn(MockPlayer.prototype, "getPlayerState")
				.and.returnValue(0);
			spyOn(MockPlayer.prototype, "getCurrentTime")
				.and.returnValue(0);

			Video(state);
			resolveScriptLoad();
		});

		afterEach(() => {
			jasmine.clock().uninstall();			
		});

		it("should set State playing: true when state changes to playing", () => {
			MockPlayer.prototype.getPlayerState
				.and.returnValue(YT.PlayerState.PLAYING);

			capturedOnStateChange();

			expect(state.state.playing).toBe(true);
		});

		it("should set State playing: false when state changes to paused", () => {
			MockPlayer.prototype.getPlayerState
				.and.returnValue(YT.PlayerState.PAUSED);

			capturedOnStateChange();

			expect(state.state.playing).toBe(false);
		});

		it("should set State playing: false when state changes to buffering", () => {
			MockPlayer.prototype.getPlayerState
				.and.returnValue(YT.PlayerState.BUFFERING);

			capturedOnStateChange();

			expect(state.state.playing).toBe(false);
		});

		it("should set State time when state changes to playing", () => {
			// Set time first to capture the instant value
			MockPlayer.prototype.getCurrentTime
				.and.returnValue(47);
			MockPlayer.prototype.getPlayerState
				.and.returnValue(YT.PlayerState.PLAYING);

			capturedOnStateChange();

			expect(state.state.time).toBe(47);
		});

		it("should set State time when state changes to paused", () => {
			// Set time first to capture the instant value
			MockPlayer.prototype.getCurrentTime
				.and.returnValue(47);
			MockPlayer.prototype.getPlayerState
				.and.returnValue(YT.PlayerState.PAUSED);

			capturedOnStateChange();

			expect(state.state.time).toBe(47);
		});

		it("should set State time frequently when playing", () => {
			const INTERVAL = 1000;
			let getCurrentTime = MockPlayer.prototype.getCurrentTime;

			getCurrentTime.and.returnValue(47);

			MockPlayer.prototype.getPlayerState
				.and.returnValue(YT.PlayerState.PLAYING);

			capturedOnStateChange();

			// Don't complete the interval
			jasmine.clock().tick(INTERVAL - 1);
			expect(state.state.time).toBe(47);

			getCurrentTime.and.returnValue(48);
			// Complete the interval
			jasmine.clock().tick(2);
			expect(state.state.time).toBe(48);

			getCurrentTime.and.returnValue(49);
			jasmine.clock().tick(INTERVAL);
			expect(state.state.time).toBe(49);
		});

		it("should not set State time frequently when paused", () => {
			const INTERVAL = 1000;
			let getCurrentTime = MockPlayer.prototype.getCurrentTime;

			getCurrentTime.and.returnValue(47);

			MockPlayer.prototype.getPlayerState
				.and.returnValue(YT.PlayerState.PAUSED);

			capturedOnStateChange();

			// Don't complete the interval
			jasmine.clock().tick(INTERVAL - 1);
			expect(state.state.time).toBe(47);

			getCurrentTime.and.returnValue(48);
			// Complete the interval
			jasmine.clock().tick(2);
			expect(state.state.time).toBe(47);

			getCurrentTime.and.returnValue(49);
			jasmine.clock().tick(INTERVAL);
			expect(state.state.time).toBe(47);
		});
	});
});
