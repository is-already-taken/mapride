
import { VideoModule } from "./views/video.js";
import { BrowserFacade } from "./foundation/browser.js";
import { MapModule } from "./views/map.js";
import { StateModule } from "./state/state.js";

window.State = StateModule.State;

export function App() {
	const videoId = BrowserFacade.getLocationHash().replace(/^#/, "");

	let state = StateModule.State({
		path: [],
		playing: false,
		videoReady: false,
		allReady: false,
		time: 0,
		videoId
	});

	fetch(`../data/${videoId}_mapride.json`)
		.then((reader) => reader.json())
		.then((path) => {
			state.state.path = path;
		});

	state.subscribe((_, change) => {
		if (state.state.videoReady && state.state.path.length > 0) {
			state.state.allReady = true;
		}
	});

	VideoModule.Video(state);
	MapModule.Map(state);
}
