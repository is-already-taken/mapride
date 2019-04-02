
/* global L */

const TRACK_COLOR = "#0000ff";
const IN_SEGMENT_COLOR = "#009900";

/**
 * Get the lat/long pair for the path we're currently in
 */
function getInSegment(path, time) {
	let index,
		pair = [];

	index = path.findIndex(([locationTime]) => {
		return (locationTime >= time);
	});

	// Ensure there are always two coordinates. Return empty otherwise.
	if (index < path.length - 1) {
		pair = [path[index][1], path[index + 1][1]];
	}

	return pair;
}

function TrackLayer(map, appState) {
	const trackPolyline = L.polyline([], { color: TRACK_COLOR }).addTo(map);
	const inSegmentPolyline = L.polyline([], { color: IN_SEGMENT_COLOR }).addTo(map);

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

		if ("playing" in change && state.playing) {
			[, latLng] = state.path.find(([time]) => {
				return (time >= Math.floor(state.time));
			});

			// Don't pan around when the location is in view already
			if (!map.getBounds().contains(latLng)) {
				map.setView(latLng, 15);
			}
		}

		if ("time" in change && state.playing) {
			inSegmentPolyline.setLatLngs(getInSegment(state.path, state.time));
		}
	});
}

// Export wrapped to be able to spy on that function in specs
export const TrackLayerModule = { TrackLayer };
