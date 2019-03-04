
/* global L */

import { MAPBOX_ACCESS_TOKEN } from "../config.js";

function Map(appState) {
	const el = document.querySelector("#map");
	const map = L.map(el).setView([52.5144473,13.3495612], 13);

	L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
		attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		maxZoom: 18,
		id: "mapbox.streets",
		accessToken: MAPBOX_ACCESS_TOKEN
	}).addTo(map);
}

// Export wrapped to be able to spy on that function in specs
export const MapModule = { Map };
