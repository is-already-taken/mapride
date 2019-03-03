
export async function loadScript(src, callbackFnName) {
	return new Promise((resolve, reject) => {
		const script = document.createElement("script");
		const head = document.getElementsByTagName("head")[0];

		if (!callbackFnName) {
			reject(new Error("Callback function name required."));
		}

		window[callbackFnName] = resolve;

		script.src = src;

		head.appendChild(script);
	});
}

// Export wrapped to be able to spy on that function in specs
export const LoadScriptModule = { loadScript };
