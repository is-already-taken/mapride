
import { StateModule } from "../../src/js/state/state.js";
const State = StateModule.State;

describe("state", () => {
	let state;

	beforeEach(() => {
		spyOn(console, "warn");

		state = State({ foo: 47 });
	});

	it("should initialize the state with the passed data", () => {
		expect(state.state).toEqual({ foo: 47 });
	});

	it("should return an object with subscribe function", () => {
		expect(state.subscribe).toEqual(jasmine.any(Function));
	});

	it("should return an object with the initial state", () => {
		expect(state.state).toEqual({ foo: 47 });
	});

	it("should update the state", () => {
		state.state.foo = 42;

		expect(state.state).toEqual({ foo: 42 });
	});

	it("should update the state, even if initially undefined", () => {
		state.state.bar = 47;

		expect(state.state).toEqual({ foo: 47, bar: 47 });
	});

	it("should log a warning if setting an initially undefined property", () => {
		state.state.bar = 47;

		expect(console.warn)
			.toHaveBeenCalledWith(
				'Update of undefined property "bar". Consider defining an initial state.'
			);
	});

	it("should call all subscribers with the change", () => {
		let expectedNewState,
			subscriber1 = jasmine.createSpy("subscriber1"),
			subscriber2 = jasmine.createSpy("subscriber2");

		state.subscribe(subscriber1);
		state.subscribe(subscriber2);

		state.state.foo = 42;

		expectedNewState = { foo: 42 };

		expect(subscriber1)
			.toHaveBeenCalledWith(expectedNewState, expectedNewState);
		expect(subscriber2)
			.toHaveBeenCalledWith(expectedNewState, expectedNewState);
	});

	it("should not publish when there's no change", () => {
		let subscriber = jasmine.createSpy("subscriber");

		state.subscribe(subscriber);

		state.state.foo = 47;

		expect(subscriber)
			.not.toHaveBeenCalled();
	});
});
