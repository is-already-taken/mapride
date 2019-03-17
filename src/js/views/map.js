
/* global L */

import { MAPBOX_ACCESS_TOKEN } from "../config.js";

const TRACK_COLOR = "#0000ff";

function Map(appState) {
	const el = document.querySelector("#map");
	const map = L.map(el);
	const trackPolyline = L.polyline([], { color: TRACK_COLOR }).addTo(map);

	L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: "mapbox.streets",
		accessToken: MAPBOX_ACCESS_TOKEN
	}).addTo(map);

	appState.subscribe((state, change) => {
		let latLng,
			latLngs;

		if ("allReady" in change) {
			latLngs = state.path.map(([, latLng]) => latLng);
			// Pick one location in the middle of the route to center the
			// map in the middle of the route.
			latLng = latLngs[Math.floor(latLngs.length / 2)];

			map.setView(latLng, 13);
			trackPolyline.setLatLngs(latLngs);
		}
	});
}

// Export wrapped to be able to spy on that function in specs
export const MapModule = { Map };
