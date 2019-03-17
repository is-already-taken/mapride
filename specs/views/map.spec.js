
import { MAPBOX_ACCESS_TOKEN } from "../../src/js/config.js";

import { MapModule } from "../../src/js/views/map.js";
const Map = MapModule.Map;

describe("Map", () => {
	let L,
		dummyEl,
		map,
		mockState,
		stateSetInterceptor,
		tileLayer;

	beforeEach(() => {
		dummyEl = document.createElement("div");
		dummyEl.id = "map";

		document.body.appendChild(dummyEl);

		// Mock Leaflet
		L = window.L = jasmine.createSpyObj("Leaflet", [
			"map",
			"tileLayer"
		]);

		map = jasmine.createSpyObj("Leaflet.map", [
			"setView"
		]);

		tileLayer = jasmine.createSpyObj("Leaflet:tileLayer", [
			"addTo"
		]);

		L.map.and.returnValue(map);
		L.tileLayer.and.returnValue(tileLayer);

		stateSetInterceptor = jasmine.createSpy("state:set")
			.and.callFake((obj, property, value) => {
				obj[property] = value;
				return true;
			});

		mockState = jasmine.createSpyObj("State", ["subscribe"]);
		mockState.state = new Proxy({ }, { set: stateSetInterceptor });

		Map(mockState);
	});

	afterEach(() => {
		document.body.removeChild(dummyEl);
	});

	describe("initialization", () => {
		it("should initialize a map with an element", () => {
			expect(L.map).toHaveBeenCalledWith(dummyEl);
		});

		it("should create a tileLayer", () => {
			expect(L.tileLayer).toHaveBeenCalled();
		});

		describe("tileLayer configuration", () => {
			it("should configure the title layer with a MapBox URL", () => {
				const URL = "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}";

				expect(L.tileLayer)
					.toHaveBeenCalledWith(URL, jasmine.any(Object));
			});

			it("should configure the title layer with attribution, maxZoom, id and accessToken", () => {
				const attributionStr = 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>';

				expect(L.tileLayer)
					.toHaveBeenCalledWith(jasmine.any(String), {
						attribution: attributionStr,
						maxZoom: 18,
						id: "mapbox.streets",
						accessToken: MAPBOX_ACCESS_TOKEN
					});
			});
		});

		it("should add the tileLayer to the map", () => {
			expect(tileLayer.addTo).toHaveBeenCalledWith(map);
		});
	});

	describe("state changes", () => {
		it('should set the view to the middle route location when "allReady" changes', () => {
			mockState.state.path = [
				[1, [1, 2]],
				[2, [3, 4]],
				[3, [5, 6]],
				[4, [7, 8]],
				[5, [9, 10]],
			];

			mockState.subscribe.calls.allArgs().forEach(([subscriberFn]) => {
				subscriberFn(mockState.state, { allReady: true });
			});

			expect(map.setView).toHaveBeenCalledWith([5, 6], 13);
		});

		it('should not set the view when "allReady" does not change', () => {
			mockState.subscribe.calls.allArgs().forEach(([subscriberFn]) => {
				subscriberFn(mockState.state, { foo: 42 });
			});

			expect(map.setView).not.toHaveBeenCalled();
		});
	});
});
