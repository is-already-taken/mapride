
/* global YT */

import { LoadScriptModule } from "../foundation/loadScript.js";

const YT_IFRAME_API_URL = "https://www.youtube.com/iframe_api";
const YT_IFRAME_API_CALLBACK = "onYouTubeIframeAPIReady";

function Video(appState) {
	const el = document.querySelector("#video");
	let player;

	init();

	async function init() {
		await LoadScriptModule
			.loadScript(YT_IFRAME_API_URL, YT_IFRAME_API_CALLBACK);

		player = new YT.Player(el, {
			height: "720",
			width: "1280",
			videoId: appState.state.videoId,
			events: {

			}
		});
	}
}

// Export wrapped to be able to spy on that function in specs
export const VideoModule = { Video };
