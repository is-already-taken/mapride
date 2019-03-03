
import { LoadScriptModule } from "../../src/js/foundation/loadScript.js";
const loadScript = LoadScriptModule.loadScript;

describe("loadScript", () => {
	const src = "dummylocation";
	const callbackFunctionName = "dummyCallback";

	let mockScript,
		promise;

	beforeEach(() => {
		// Using link element here to not actually load something
		mockScript = document.createElement("link");

		spyOn(document, "createElement").and.returnValue(mockScript);
	});

	it("should throw on missing callback function", async function(done) {
		try {
			await loadScript(src);
			done.fail("Expected loadScript() to throw");
		} catch(e) {
			expect(e.toString()).toEqual("Error: Callback function name required.");
			done();
		}
	});

	it("should add a script element to head", () => {
		const head = document.getElementsByTagName("head")[0];

		loadScript(src, callbackFunctionName);
		expect([...head.childNodes].includes(mockScript)).toBe(true);
	});

	it("should set src to the passed location", () => {
		loadScript(src, callbackFunctionName);
		expect(mockScript.src).toBe(src);
	});

	it("should define a global callback function if specified", () => {
		loadScript(src, callbackFunctionName);
		expect(window[callbackFunctionName]).toEqual(jasmine.any(Function));
	});

	it("should return a Promise", () => {
		promise = loadScript(src, callbackFunctionName);
		expect(promise).toEqual(jasmine.any(Promise));
	});

	it("should resolve when the global callback function is called", (done) => {
		promise = loadScript(src, callbackFunctionName);
		window[callbackFunctionName]();

		promise.then(() => {
			expect(true).toBe(true);
			done();
		});
	});
});
