
import foo from "../src/foo.js";

describe("foo", () => {
	it("should return 42", () => {
		expect(foo()).toBe(42);
	});
});
