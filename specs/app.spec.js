
import { App } from "../src/js/app.js";
import { BrowserFacade } from "../src/js/foundation/browser.js";
import { VideoModule } from "../src/js/views/video.js";
import { StateModule } from "../src/js/state/state.js";

describe("App", () => {
	const hash = "foo47";

	let mockState;

	beforeEach(() => {
		mockState = jasmine.createSpyObj("State", ["subscribe"]);
		mockState.state = { };

		spyOn(BrowserFacade, "getLocationHash").and.returnValue(hash);
		spyOn(StateModule, "State").and.returnValue(mockState);
		spyOn(VideoModule, "Video");

		App();
	});

	it("should initialize State with videoId from location.hash", () => {
		expect(StateModule.State).toHaveBeenCalledWith({
			playing: false,
			time: 0,
			videoId: hash
		});
	});

	it("should pass a State object to Video view", () => {
		expect(VideoModule.Video).toHaveBeenCalledWith(mockState);
	});
});
