
import { MAPBOX_ACCESS_TOKEN } from "../../src/js/config.js";

import { MapModule } from "../../src/js/views/map.js";
const Map = MapModule.Map;

describe("Map", () => {
	let L,
		dummyEl,
		map,
		mockState,
		polyline,
		stateSetInterceptor,
		tileLayer;

	beforeEach(() => {
		dummyEl = document.createElement("div");
		dummyEl.id = "map";

		document.body.appendChild(dummyEl);

		// Mock Leaflet
		L = window.L = jasmine.createSpyObj("Leaflet", [
			"map",
			"polyline",
			"tileLayer"
		]);

		map = jasmine.createSpyObj("Leaflet.map", [
			"getBounds",
			"setView"
		]);

		polyline = jasmine.createSpyObj("Leaflet:polyline", [
			"addTo",
			"setLatLngs"
		]);

		polyline.addTo.and.returnValue(polyline);

		tileLayer = jasmine.createSpyObj("Leaflet:tileLayer", [
			"addTo"
		]);

		L.map.and.returnValue(map);
		L.polyline.and.returnValue(polyline);
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

		it("should create a blue polyline with no geocoordinates", () => {
			expect(L.polyline).toHaveBeenCalledWith([], {
				color: "#0000ff"
			});
		});

		it("should add the polyline to the map", () => {
			expect(polyline.addTo).toHaveBeenCalledWith(map);
		});
	});

	describe("state changes", () => {
		const path = [
			[1, [1, 2]],
			[2, [3, 4]],
			[3, [5, 6]],
			[4, [7, 8]],
			[5, [9, 10]],
		];

		describe('"allReady" changes', () => {
			beforeEach(() => {
				mockState.state.path = path;

				mockState.subscribe.calls.allArgs().forEach(([subscriberFn]) => {
					subscriberFn(mockState.state, { allReady: true });
				});
			});

			it("should set the view to the middle route location", () => {
				expect(map.setView).toHaveBeenCalledWith([5, 6], 13);
			});

			it("should set polyline with the path locations", () => {
				const geocoordinates = path.map(([, latLng]) => latLng);

				expect(polyline.setLatLngs).toHaveBeenCalledWith(geocoordinates);
			});
		});

		describe('"allReady" does not change', () => {
			beforeEach(() => {
				mockState.subscribe.calls.allArgs().forEach(([subscriberFn]) => {
					subscriberFn(mockState.state, { foo: 42 });
				});
			});

			it("should not set the view", () => {
				expect(map.setView).not.toHaveBeenCalled();
			});

			it("should not set geocoordinates", () => {
				expect(polyline.setLatLngs).not.toHaveBeenCalled();
			});
		});

		describe('"playing" changes', () => {
			let bounds;

			beforeEach(() => {
				mockState.state.path = path;
				mockState.state.playing = true;
				mockState.state.time = 2;

				bounds = jasmine.createSpyObj("Leaflet:bounds", ["contains"]);
				map.getBounds.and.returnValue(bounds);

				bounds.contains.and.returnValue(true);
			});

			it("should set the view to the current time's location", () => {
				let [, latLng] = path[1];

				bounds.contains.and.returnValue(false);

				mockState.subscribe.calls.allArgs().forEach(([subscriberFn]) => {
					subscriberFn(mockState.state, { playing: true });
				});

				expect(bounds.contains).toHaveBeenCalledWith(latLng);
				expect(map.setView).toHaveBeenCalledWith(latLng, 15);
			});

			it("should set the view if it already shows the location", () => {
				mockState.subscribe.calls.allArgs().forEach(([subscriberFn]) => {
					subscriberFn(mockState.state, { playing: true });
				});

				expect(map.setView).not.toHaveBeenCalled();
			});
		});
	});
});
