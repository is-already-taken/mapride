
import { VideoModule } from "../../src/js/views/video.js";
import { LoadScriptModule } from "../../src/js/foundation/loadScript.js";
const Video = VideoModule.Video;

describe("Video", () => {
	let resolveScriptLoad,
		state,
		subscribeSpy,
		YT,
		YTPlayerConstructor;

	beforeEach(() => {
		let loadScriptPromise;

		YTPlayerConstructor = jasmine.createSpy("YT.Player");
		subscribeSpy = jasmine.createSpy("subscribe");

		// Mock Youtube
		YT = window.YT = { Player: YTPlayerConstructor };

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

	it("should instantiate the Youtube player", (done) => {
		Video(state);
		
		YTPlayerConstructor.and.callFake(() => {
			expect(YT.Player).toHaveBeenCalled();

			done();
		});

		resolveScriptLoad();
	});

	it("should pass the player element as first argument", (done) => {
		Video(state);
		
		YTPlayerConstructor.and.callFake(() => {
			expect(YT.Player).toHaveBeenCalledWith(
				jasmine.any(Element),
				jasmine.any(Object)
			);

			done();
		});

		resolveScriptLoad();
	});

	it("should pass the player config as second argument", (done) => {
		Video(state);
		
		YTPlayerConstructor.and.callFake(() => {
			expect(YT.Player).toHaveBeenCalledWith(
				jasmine.any(Element),
				jasmine.objectContaining({
					height: "720",
					width: "1280",
					videoId: state.state.videoId
				})
			);

			done();
		});

		resolveScriptLoad();
	});
});
