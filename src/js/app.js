
import { VideoModule } from "./views/video.js";
import { BrowserFacade } from "./foundation/browser.js";
import { StateModule } from "./state/state.js";

window.State = StateModule.State;

export function App() {
	const videoId = BrowserFacade.getLocationHash().replace(/^#/, "");

	let state = StateModule.State({
		playing: false,
		time: 0,
		videoId
	});

	VideoModule.Video(state);
}
