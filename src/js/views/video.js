
/* global YT */

import { LoadScriptModule } from "../foundation/loadScript.js";

// The player will frequently update the time value (milliseconds)
const TIME_UPDATE_INTERVAL = 1000;

const YT_IFRAME_API_URL = "https://www.youtube.com/iframe_api";
const YT_IFRAME_API_CALLBACK = "onYouTubeIframeAPIReady";

function Video(appState) {
	const el = document.querySelector("#video");
	let timeUpdateInterval,
		player;

	init();

	function isPlaying() {
		return player.getPlayerState() === YT.PlayerState.PLAYING;
	}

	async function init() {
		await LoadScriptModule
			.loadScript(YT_IFRAME_API_URL, YT_IFRAME_API_CALLBACK);

		player = new YT.Player(el, {
			height: "720",
			width: "1280",
			videoId: appState.state.videoId,
			events: {
				onReady: () => {
					appState.state.videoReady = true;
				},
				onStateChange: () => {
					const playing = isPlaying();

					if (playing) {
						timeUpdateInterval = setInterval(() => {
							appState.state.time = player.getCurrentTime();
						}, TIME_UPDATE_INTERVAL);
					} else {
						clearInterval(timeUpdateInterval);
					}

					appState.state.playing = playing;
					appState.state.time = player.getCurrentTime();
				}
			}
		});
	}
}

// Export wrapped to be able to spy on that function in specs
export const VideoModule = { Video };

