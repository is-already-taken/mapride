
import { App } from "../src/js/app.js";
import { BrowserFacade } from "../src/js/foundation/browser.js";
import { MapModule } from "../src/js/views/map.js";
import { VideoModule } from "../src/js/views/video.js";
import { StateModule } from "../src/js/state/state.js";

describe("App", () => {
	const hash = "foo47";

	let fetchReader,
		jsonData,
		jsonResultPromise,
		mockState,
		stateSetInterceptor,
		resolveFetch;

	beforeEach(() => {
		jsonData = [
			[1, [1, 1]],
			[2, [2, 2]],
			[3, [3, 3]]
		];

		jsonResultPromise = Promise.resolve(jsonData);

		fetchReader = jasmine.createSpyObj("Reader", ["json"]);
		fetchReader.json.and.returnValue(Promise.resolve(jsonResultPromise));

		stateSetInterceptor = jasmine.createSpy("state:set")
			.and.callFake((obj, property, value) => {
				obj[property] = value;
				return true;
			});

		mockState = jasmine.createSpyObj("State", ["subscribe"]);
		mockState.state = new Proxy({ }, { set: stateSetInterceptor });

		spyOn(BrowserFacade, "getLocationHash").and.returnValue(hash);
		spyOn(StateModule, "State").and.returnValue(mockState);
		spyOn(MapModule, "Map");
		spyOn(VideoModule, "Video");

		resolveFetch = null;
		spyOn(window, "fetch").and.callFake(() => {
			return new Promise((resolve) => {
				resolveFetch = () => resolve(fetchReader);
			});
		});

		App();
	});

	it("should initialize State with videoId from location.hash", () => {
		expect(StateModule.State).toHaveBeenCalledWith({
			allReady: false,
			path: [],
			playing: false,
			time: 0,
			videoId: hash,
			videoReady: false
		});
	});

	it("should pass a State object to Map view", () => {
		expect(MapModule.Map).toHaveBeenCalledWith(mockState);
	});

	it("should pass a State object to Video view", () => {
		expect(VideoModule.Video).toHaveBeenCalledWith(mockState);
	});

	it('should set "path" on state with fetch\'s JSON result', (done) => {
		resolveFetch();

		setTimeout(() => {
			expect(mockState.state).toEqual(jasmine.objectContaining({
				path: jsonData
			}));

			done();
		});
	});

	it('should set "allReady" on state when "videoReady" is true and "path" has elements', (done) => {
		let subscribers = [];

		mockState.state.videoReady = true;
		mockState.state.path = [[/*one element, data does not matter*/]];

		mockState.subscribe.calls.allArgs().forEach(([subscriberFn]) => {
			subscriberFn(mockState.state, { });
		});

		setTimeout(() => {
			expect(mockState.state).toEqual(jasmine.objectContaining({
				allReady: true
			}));

			done();
		});
	});
});
